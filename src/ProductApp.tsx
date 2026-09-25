/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, BusinessStateItem, DashboardTab, FounderSyncResult, ImpactLevel, StackItem, UserContext } from './types';
import { configuredOperatingMode, type OperatingMode } from './config/operatingMode';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { ApiRequestError, askGemini, generateDigest, generateDiligence, generateInsights, scanStack, syncFounders } from './services/api';
import './legacy-product.css';

const STORAGE_KEY = 'stacksense_user_context';

type AlertStatus = 'active' | 'resolved' | 'dismissed';
type AlertWithStatus = Alert & { status: AlertStatus };

export default function ProductApp() {
  const [context, setContext] = useState<UserContext | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [alerts, setAlerts] = useState<AlertWithStatus[]>([]);
  const [mermaidGraph, setMermaidGraph] = useState('');
  const [operatingMode, setOperatingMode] = useState<OperatingMode>(configuredOperatingMode);
  const [scanError, setScanError] = useState<string | null>(null);
  const [terminalMessages, setTerminalMessages] = useState<string[]>(['No scan has been run in this workspace.']);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [implementedSavings, setImplementedSavings] = useState(0);
  const [hasPendingRescan, setHasPendingRescan] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [founderSync, setFounderSync] = useState<FounderSyncResult>({
    paulActions: [],
    coordinationAlerts: [],
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContext(JSON.parse(saved));
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (context) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
    }
  }, [context]);

  const handleOnboardingComplete = (newContext: UserContext) => {
    setContext(newContext);
    setHasPendingRescan(true);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setContext(null);
    setAlerts([]);
    setMermaidGraph('');
    setTerminalMessages(['No scan has been run in this workspace.']);
    setLastScan(null);
    setImplementedSavings(0);
    setHasPendingRescan(false);
    setActiveTab('overview');
    setScanError(null);
    setOperatingMode(configuredOperatingMode);
  };

  const updateStackContext = (updatedStack: StackItem[]) => {
    setContext((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        stack: updatedStack,
      };
    });
    setHasPendingRescan(true);
  };

  const handleAddStackItem = (name: string, monthlyCost: number) => {
    if (!context) {
      return;
    }

    const id = Math.random().toString(36).slice(2, 11);
    updateStackContext([
      ...context.stack,
      {
        id,
        name,
        category: 'SaaS',
        monthlyCost,
      },
    ]);
  };

  const handleUpdateStackItem = (itemId: string, updates: Partial<StackItem>) => {
    if (!context) {
      return;
    }

    updateStackContext(context.stack.map((item) => (item.id === itemId ? { ...item, ...updates } : item)));
  };

  const handleRemoveStackItem = (itemId: string) => {
    if (!context) {
      return;
    }

    updateStackContext(context.stack.filter((item) => item.id !== itemId));
  };

  const handleLoadDemoStack = () => {
    if (!context) {
      return;
    }

    updateStackContext([
      { id: 'demo-vercel', name: 'Vercel (Pro)', category: 'SaaS', monthlyCost: 150 },
      { id: 'demo-firebase', name: 'Firebase', category: 'SaaS', monthlyCost: 200 },
      { id: 'demo-openai', name: 'OpenAI API', category: 'SaaS', monthlyCost: 500 },
      { id: 'demo-pinecone', name: 'Pinecone Vector DB', category: 'SaaS', monthlyCost: 250 },
      { id: 'demo-mailchimp', name: 'Mailchimp', category: 'SaaS', monthlyCost: 100 },
    ]);
  };

  const handleScan = async () => {
    if (!context || isScanning) {
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setTerminalMessages(['Preparing the configured stack components.', 'Requesting analysis from the StackSense backend.']);

    try {
      const stack = context.stack.map((item) => item.name).filter(Boolean);
      const monthlySpend = context.stack.reduce((sum, item) => sum + (Number(item.monthlyCost) || 0), 0);
      if (stack.length === 0) {
        throw new ApiRequestError(400, 'EMPTY_STACK', 'Add at least one stack component before starting a scan.', false);
      }
      const scanResult = await scanStack(stack, monthlySpend);

      const mappedAlerts: AlertWithStatus[] = scanResult.alerts.map((item, index) => ({
        id: item.id || `alert-${index}`,
        title: item.title,
        description: item.actionDescription,
        impact:
          item.impactLevel === 'High'
            ? ImpactLevel.HIGH
            : item.impactLevel === 'Medium'
            ? ImpactLevel.MEDIUM
            : ImpactLevel.LOW,
        potentialSavings: Number(item.estimatedSavings) || 0,
        action: item.actionDescription,
        category: item.category,
        timestamp: Date.now(),
        status: 'active',
      }));

      setAlerts(mappedAlerts);
      setMermaidGraph(scanResult.mermaidGraph);
      setImplementedSavings(0);
      setOperatingMode(scanResult.meta.mode);
      setLastScan(new Date(scanResult.meta.generatedAt));
      setHasPendingRescan(false);
      setTerminalMessages([
        `${stack.length} stack component${stack.length === 1 ? '' : 's'} included.`,
        `${mappedAlerts.length} ${scanResult.meta.mode === 'demo' ? 'demo ' : ''}finding${mappedAlerts.length === 1 ? '' : 's'} returned.`,
        scanResult.meta.mode === 'demo' ? 'No official sources were scanned; these findings are deterministic demo data.' : 'Live analysis completed successfully.',
      ]);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Scan failed', error);
      let message = 'The backend is unavailable or could not complete the scan. Existing workspace data has been preserved.';
      if (error instanceof ApiRequestError) {
        if (error.status === 400) message = error.message;
        if (error.status === 401 || error.status === 403) message = 'This workspace is not authorized to run a live scan. Check the backend access configuration.';
        if (error.status === 429) message = 'The scan quota has been reached. Wait before retrying; existing workspace data is unchanged.';
      }
      setOperatingMode('degraded');
      setScanError(message);
      setTerminalMessages((previous) => [...previous, 'Scan did not complete. No demo findings were substituted.']);
    } finally {
      setIsScanning(false);
    }
  };

  const handleImplementAlert = (alertId: string) => {
    setAlerts((prev) => {
      const target = prev.find((item) => item.id === alertId);
      if (!target || target.status === 'resolved') {
        return prev;
      }

      setImplementedSavings((total) => total + target.potentialSavings);
      return prev.map((item) => (item.id === alertId ? { ...item, status: 'resolved' } : item));
    });
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((item) => (item.id === alertId ? { ...item, status: 'dismissed' } : item)));
  };

  const handleAskGemini = async (
    alert: AlertWithStatus,
    question: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: unknown) => void
  ) => {
    await askGemini(
      {
        id: alert.id,
        title: alert.title,
        impact: alert.impact,
        estimatedSavings: alert.potentialSavings,
        actionDescription: alert.action,
      },
      question,
      onChunk,
      onComplete,
      onError
    );
  };

  const handleGenerateInsights = async () => {
    if (!context) {
      return '';
    }

    const monthlyCost = context.stack.reduce((sum, item) => sum + (Number(item.monthlyCost) || 0), 0);
    return generateInsights(alerts, monthlyCost, implementedSavings);
  };

  const handleGenerateDigest = async () => {
    return generateDigest(alerts);
  };

  const handleGenerateDiligence = async () => {
    if (!context) {
      return '';
    }

    return generateDiligence(alerts, context.stack);
  };

  const handleSyncFounders = async (businessState: BusinessStateItem[]) => {
    const syncResult = await syncFounders(businessState, alerts);
    setFounderSync(syncResult);
    return syncResult;
  };

  if (isInitializing) {
    return (
      <div className="product-app min-h-screen bg-brand-bg flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-brand-cyan font-mono"
        >
          Loading StackSense workspace…
        </motion.div>
      </div>
    );
  }

  return (
    <div className="product-app min-h-screen bg-brand-bg text-gray-100 selection:bg-brand-cyan/30">
      <AnimatePresence mode="wait">
        {!context || !context.onboarded ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard
              context={context}
              onReset={handleReset}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isScanning={isScanning}
              alerts={alerts}
              operatingMode={operatingMode}
              scanError={scanError}
              terminalMessages={terminalMessages}
              lastScan={lastScan}
              implementedSavings={implementedSavings}
              hasPendingRescan={hasPendingRescan}
              mermaidGraph={mermaidGraph}
              onScan={handleScan}
              onAddStackItem={handleAddStackItem}
              onUpdateStackItem={handleUpdateStackItem}
              onRemoveStackItem={handleRemoveStackItem}
              onLoadDemoStack={handleLoadDemoStack}
              onImplementAlert={handleImplementAlert}
              onDismissAlert={handleDismissAlert}
              onAskGemini={handleAskGemini}
              onGenerateInsights={handleGenerateInsights}
              onGenerateDigest={handleGenerateDigest}
              onGenerateDiligence={handleGenerateDiligence}
              founderSync={founderSync}
              onSyncFounders={handleSyncFounders}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
