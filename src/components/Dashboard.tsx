import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Terminal as TerminalIcon, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { UserContext, Alert, ImpactLevel } from '../types';
import Sidebar from './Sidebar';
import TerminalView from './TerminalView';
import AlertCard from './AlertCard';
import { cn } from '../lib/utils';

interface DashboardProps {
  context: UserContext;
  onReset: () => void;
  isScanning: boolean;
  alerts: (Alert & { status: 'active' | 'resolved' | 'dismissed' })[];
  healthScore: number;
  terminalMessages: string[];
  lastScan: Date | null;
  implementedSavings: number;
  onScan: () => Promise<void>;
  onImplementAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onAskGemini: (
    alert: Alert & { status: 'active' | 'resolved' | 'dismissed' },
    question: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: unknown) => void
  ) => Promise<void>;
}

export default function Dashboard({
  context,
  onReset,
  isScanning,
  alerts,
  healthScore,
  terminalMessages,
  lastScan,
  implementedSavings,
  onScan,
  onImplementAlert,
  onDismissAlert,
  onAskGemini,
}: DashboardProps) {
  const visibleAlerts = alerts.filter((item) => item.status !== 'dismissed');
  const runwayBoost = (implementedSavings / (context.monthlyBudget || 1)).toFixed(1);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <Sidebar 
        context={context} 
        healthScore={healthScore} 
        onReset={onReset}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-brand-border flex items-center justify-between px-8 shrink-0 bg-brand-bg/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-brand-cyan/10 rounded-lg">
              <LayoutDashboard className="text-brand-cyan w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight">Technical Intelligence</h1>
              <p className="text-xs text-gray-500 font-mono">
                {lastScan ? `LAST_SYNC: ${lastScan.toLocaleTimeString()}` : 'WAITING_FOR_INITIAL_SCAN'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border border-brand-bg bg-brand-border flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-400 font-mono">3_NODES_UP</span>
            </div>

            <button 
              onClick={onScan}
              disabled={isScanning}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all",
                isScanning ? "bg-brand-border text-gray-500" : "bg-brand-cyan text-brand-bg hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,245,255,0.2)]"
              )}
            >
              {isScanning && <RefreshCw className="w-4 h-4 animate-spin" />}
              {isScanning ? 'SCANNING...' : 'SCAN NOW'}
              {!isScanning && <Zap className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Terminal Section */}
            <div className="col-span-12 lg:col-span-5 bg-black rounded-2xl border border-brand-border overflow-hidden h-80 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-brand-card border-b border-brand-border">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Live Scan Engine</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-900/40" />
                  <div className="w-2 h-2 rounded-full bg-amber-900/40" />
                  <div className="w-2 h-2 rounded-full bg-emerald-900/40" />
                </div>
              </div>
              <TerminalView messages={terminalMessages} />
            </div>

            {/* Top Metrics */}
            <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-6 h-80">
              <div className="bg-brand-card rounded-2xl border border-brand-border p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Implemented Savings</span>
                    <TrendingUp className="text-brand-cyan w-4 h-4" />
                  </div>
                  <div className="text-4xl font-bold text-brand-cyan">${implementedSavings.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-tighter">EST_MONTHLY_REDUCTION</div>
                </div>
                <div className="pt-4 border-t border-brand-border">
                  <div className="flex justify-between text-xs mb-2 text-gray-500">
                    <span>PROGRESS_TO_EFFICIENCY_GOAL</span>
                    <span>12%</span>
                  </div>
                  <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand-cyan shadow-[0_0_10px_rgba(0,245,255,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: '12%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-brand-card rounded-2xl border border-brand-border p-6 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <RefreshCw className="w-32 h-32 text-brand-cyan rotate-12" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Runway Impact</span>
                    <Info className="text-gray-500 w-4 h-4" />
                  </div>
                  <div className="text-4xl font-bold text-brand-amber">+{runwayBoost} mo</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase font-mono tracking-tighter">PROJECTED_EXTENSION</div>
                </div>
                <div className="text-xs text-brand-amber/80 font-mono leading-relaxed">
                  // OPTIMIZING_CURRENT_BURN_RATE<br/>
                  // INJECTING_${implementedSavings}_TO_RESERVES
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-brand-amber" /> Impact Ranked Alerts
              </h2>
              <div className="flex gap-2">
                {['COST', 'ECOSYSTEM', 'PERF'].map(filter => (
                  <button key={filter} className="text-[10px] font-mono border border-brand-border px-3 py-1 rounded-full text-gray-500 hover:text-brand-cyan hover:border-brand-cyan transition-colors">
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {visibleAlerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {visibleAlerts.map((alert, i) => (
                    <div key={alert.id}>
                      <AlertCard
                        alert={alert}
                        index={i}
                        stack={context.stack}
                        onImplement={() => onImplementAlert(alert.id)}
                        onDismiss={() => onDismissAlert(alert.id)}
                        onAskGemini={onAskGemini}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="border border-dashed border-brand-border rounded-2xl p-20 flex flex-col items-center justify-center text-center opacity-50">
                <div className="w-16 h-16 rounded-full bg-brand-border flex items-center justify-center mb-4">
                  <RefreshCw className="text-gray-500 w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">No Active Intel</h3>
                <p className="text-sm max-w-xs text-gray-500">Run a deep scan to discover cost and architectural optimization vectors.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
