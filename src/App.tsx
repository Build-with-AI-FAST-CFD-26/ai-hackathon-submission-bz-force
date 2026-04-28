/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, BusinessStateItem, DashboardTab, FounderSyncResult, ImpactLevel, StackItem, UserContext } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { askGemini, generateDigest, generateDiligence, generateInsights, scanStack, syncFounders } from './services/api';

const STORAGE_KEY = 'stacksense_user_context';

type AlertStatus = 'active' | 'resolved' | 'dismissed';
type AlertWithStatus = Alert & { status: AlertStatus };

export default function App() {
  const [context, setContext] = useState<UserContext | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [alerts, setAlerts] = useState<AlertWithStatus[]>([]);
  const [mermaidGraph, setMermaidGraph] = useState('');
  const [healthScore, setHealthScore] = useState(78);
  const [terminalMessages, setTerminalMessages] = useState<string[]>(['[SYSTEM] AUTH_SUCCESS', '[SYSTEM] MONITORING_ACTIVE']);
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
    setTerminalMessages(['[SYSTEM] AUTH_SUCCESS', '[SYSTEM] MONITORING_ACTIVE']);
    setLastScan(null);
    setImplementedSavings(0);
    setHasPendingRescan(false);
    setActiveTab('overview');
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

  const addTerminalMessage = (message: string) => {
    setTerminalMessages((prev) => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleScan = async () => {
    if (!context || isScanning) {
      return;
    }

    setIsScanning(true);
    setTerminalMessages([]);
    addTerminalMessage('INITIATING_DEEP_STACK_SCAN');

    const steps = [
      'RESOLVING_DEPENDENCY_GRAPH...',
      'EVALUATING_MODEL_LATENCY...',
      'ANALYZING_COST_VECTORS...',
      'IDENTIFYING_DEPRECATION_RISKS...',
      'CALCULATING_RUNWAY_GAINS...',
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      addTerminalMessage(step);
    }

    try {
      const stack = context.stack.map((item) => item.name).filter(Boolean);
      const monthlySpend = context.stack.reduce((sum, item) => sum + (Number(item.monthlyCost) || 0), 0);
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
      setHealthScore(Math.max(55, 92 - mappedAlerts.length * 4));
      setLastScan(new Date());
      setHasPendingRescan(false);
      addTerminalMessage(`SCAN_COMPLETE: ${mappedAlerts.length} OPTIMIZATION_POINTS_IDENTIFIED`);
    } catch (error) {
      console.error('Scan failed', error);
      addTerminalMessage('SCAN_FAILED: BACKEND_OR_MODEL_ERROR');
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
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-brand-cyan font-mono"
        >
          INITIALIZING_STACKSENSE_CORE...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-gray-100 selection:bg-brand-cyan/30">
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
              healthScore={healthScore}
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
