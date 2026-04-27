/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, ImpactLevel, UserContext } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { askGemini, scanStack } from './services/api';

const STORAGE_KEY = 'stacksense_user_context';

type AlertStatus = 'active' | 'resolved' | 'dismissed';
type AlertWithStatus = Alert & { status: AlertStatus };

export default function App() {
  const [context, setContext] = useState<UserContext | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [alerts, setAlerts] = useState<AlertWithStatus[]>([]);
  const [healthScore, setHealthScore] = useState(78);
  const [terminalMessages, setTerminalMessages] = useState<string[]>(['[SYSTEM] AUTH_SUCCESS', '[SYSTEM] MONITORING_ACTIVE']);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [implementedSavings, setImplementedSavings] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setContext(JSON.parse(saved));
    }
    setIsInitializing(false);
  }, []);

  const handleOnboardingComplete = (newContext: UserContext) => {
    setContext(newContext);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContext));
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setContext(null);
    setAlerts([]);
    setTerminalMessages(['[SYSTEM] AUTH_SUCCESS', '[SYSTEM] MONITORING_ACTIVE']);
    setLastScan(null);
    setImplementedSavings(0);
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
      const scanAlerts = await scanStack(stack, monthlySpend);

      const mappedAlerts: AlertWithStatus[] = scanAlerts.map((item, index) => ({
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
        category: 'cost',
        timestamp: Date.now(),
        status: 'active',
      }));

      setAlerts(mappedAlerts);
      setImplementedSavings(0);
      setHealthScore(Math.max(55, 92 - mappedAlerts.length * 4));
      setLastScan(new Date());
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
              isScanning={isScanning}
              alerts={alerts}
              healthScore={healthScore}
              terminalMessages={terminalMessages}
              lastScan={lastScan}
              implementedSavings={implementedSavings}
              onScan={handleScan}
              onImplementAlert={handleImplementAlert}
              onDismissAlert={handleDismissAlert}
              onAskGemini={handleAskGemini}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
