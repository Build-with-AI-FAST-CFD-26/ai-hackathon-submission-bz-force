import { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ListChecks,
  LayoutDashboard, 
  RefreshCw,
  AlertTriangle,
  Layers3,
  ArrowLeft,
  WifiOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserContext, Alert, ImpactLevel, StackItem, DashboardTab, FounderSyncResult, BusinessStateItem } from '../types';
import type { OperatingMode } from '../config/operatingMode';
import Sidebar from './Sidebar';
import TerminalView from './TerminalView';
import AlertCard from './AlertCard';
import { cn } from '../lib/utils';

const StackManager = lazy(() => import('./StackManager'));
const RunwayProjections = lazy(() => import('./RunwayProjections'));
const ArchitectureView = lazy(() => import('./ArchitectureView'));
const InsightsTab = lazy(() => import('./InsightsTab'));
const WeeklyDigest = lazy(() => import('./WeeklyDigest'));

interface DashboardProps {
  context: UserContext;
  onReset: () => void;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  isScanning: boolean;
  alerts: (Alert & { status: 'active' | 'resolved' | 'dismissed' })[];
  operatingMode: OperatingMode;
  scanError: string | null;
  terminalMessages: string[];
  lastScan: Date | null;
  implementedSavings: number;
  hasPendingRescan: boolean;
  mermaidGraph: string;
  onScan: () => Promise<void>;
  onAddStackItem: (name: string, monthlyCost: number) => void;
  onUpdateStackItem: (itemId: string, updates: Partial<StackItem>) => void;
  onRemoveStackItem: (itemId: string) => void;
  onLoadDemoStack: () => void;
  onImplementAlert: (alertId: string) => void;
  onDismissAlert: (alertId: string) => void;
  onAskGemini: (
    alert: Alert & { status: 'active' | 'resolved' | 'dismissed' },
    question: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: unknown) => void
  ) => Promise<void>;
  onGenerateInsights: () => Promise<string>;
  onGenerateDigest: () => Promise<string>;
  onGenerateDiligence: () => Promise<string>;
  founderSync: FounderSyncResult;
  onSyncFounders: (businessState: BusinessStateItem[]) => Promise<FounderSyncResult>;
}

export default function Dashboard({
  context,
  onReset,
  activeTab,
  onTabChange,
  isScanning,
  alerts,
  operatingMode,
  scanError,
  terminalMessages,
  lastScan,
  implementedSavings,
  hasPendingRescan,
  mermaidGraph,
  onScan,
  onAddStackItem,
  onUpdateStackItem,
  onRemoveStackItem,
  onLoadDemoStack,
  onImplementAlert,
  onDismissAlert,
  onAskGemini,
  onGenerateInsights,
  onGenerateDigest,
  onGenerateDiligence,
  founderSync,
  onSyncFounders,
}: DashboardProps) {
  const visibleAlerts = alerts.filter((item) => item.status !== 'dismissed');
  const activeFindings = alerts.filter((item) => item.status === 'active').length;
  const currentMonthlySpend = context.stack.reduce((sum, item) => sum + (Number(item.monthlyCost) || 0), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <Sidebar 
        context={context} 
        operatingMode={operatingMode}
        activeFindingCount={activeFindings}
        onReset={onReset}
        activeTab={activeTab}
        onTabChange={onTabChange}
          hasPendingRescan={hasPendingRescan}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="min-h-20 border-b border-brand-border flex items-center justify-between gap-4 px-4 md:px-8 py-3 shrink-0 bg-brand-bg/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-brand-cyan/10 rounded-lg">
              <LayoutDashboard className="text-brand-cyan w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-xl tracking-normal">TECHNICAL INTELLIGENCE</h1>
              <p className="text-xs text-gray-400">
                {lastScan ? `Last successful scan ${lastScan.toLocaleTimeString()}` : 'No successful scan yet'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <Link to="/" className="hidden sm:flex min-h-11 items-center gap-2 text-xs font-bold text-gray-300 hover:text-brand-cyan"><ArrowLeft className="w-4 h-4" /> Landing page</Link>
            <span className={cn('hidden md:inline-flex px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border', operatingMode === 'demo' ? 'bg-brand-amber/10 border-brand-amber/30 text-brand-amber' : operatingMode === 'live' ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300' : 'bg-red-400/10 border-red-400/30 text-red-300')}>{operatingMode} workspace</span>

            <button 
              onClick={onScan}
              disabled={isScanning}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all",
                isScanning
                  ? "bg-brand-border text-gray-500"
                  : hasPendingRescan
                    ? "bg-brand-amber/15 text-brand-amber border border-brand-amber/40 shadow-[0_0_24px_rgba(255,184,0,0.35)] animate-pulse"
                    : "bg-brand-cyan text-brand-bg hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,245,255,0.2)]"
              )}
            >
              {isScanning && <RefreshCw className="w-4 h-4 animate-spin" />}
              {isScanning ? 'SCANNING...' : hasPendingRescan ? 'RESCAN REQUIRED' : 'SCAN NOW'}
              {!isScanning && <Zap className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          <div className="lg:hidden flex flex-wrap items-center gap-3">
            <Link to="/" className="min-h-11 px-4 inline-flex items-center gap-2 rounded-lg border border-brand-border text-sm"><ArrowLeft className="w-4 h-4" /> Landing</Link>
            <label className="sr-only" htmlFor="mobile-product-nav">Product section</label>
            <select id="mobile-product-nav" value={activeTab} onChange={(event) => onTabChange(event.target.value as DashboardTab)} className="min-h-11 flex-1 bg-brand-card border border-brand-border rounded-lg px-3 text-sm">
              <option value="overview">Today</option><option value="stack">Stack</option><option value="runway">Savings</option><option value="architecture">Changes</option><option value="insights">Reports</option><option value="digest">Weekly digest</option>
            </select>
            <span className={cn('px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border', operatingMode === 'demo' ? 'border-brand-amber/30 text-brand-amber' : operatingMode === 'live' ? 'border-emerald-400/30 text-emerald-300' : 'border-red-400/30 text-red-300')}>{operatingMode}</span>
          </div>
          {scanError && <section role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-red-400/30 bg-red-400/10"><div className="flex items-start gap-3"><WifiOff className="w-5 h-5 text-red-300 shrink-0" /><div><h2 className="font-bold">Scan unavailable</h2><p className="text-sm text-gray-300 mt-1">{scanError}</p></div></div><button onClick={onScan} disabled={isScanning} className="min-h-11 px-5 rounded-lg bg-white text-brand-bg font-bold">Retry scan</button></section>}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-12 lg:col-span-5 bg-brand-card rounded-2xl border border-brand-border overflow-hidden h-80 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 bg-brand-card border-b border-brand-border">
                      <div className="flex items-center gap-2">
                        <ListChecks className="w-3.5 h-3.5 text-brand-cyan" />
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Scan activity</span>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-900/40" />
                        <div className="w-2 h-2 rounded-full bg-amber-900/40" />
                        <div className="w-2 h-2 rounded-full bg-emerald-900/40" />
                      </div>
                    </div>
                    <TerminalView messages={terminalMessages} />
                  </div>

                  <div className="col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-80">
                    <div className="bg-brand-card rounded-2xl border border-brand-border p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs text-gray-400 uppercase tracking-widest">Recorded savings</span>
                          <ListChecks className="text-brand-cyan w-4 h-4" />
                        </div>
                        <div className="text-4xl font-bold text-brand-cyan">${implementedSavings.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 mt-1">User-recorded monthly amount</div>
                      </div>
                      <div className="pt-4 border-t border-brand-border">
                        <div className="flex justify-between text-xs text-gray-400"><span>Findings requiring review</span><strong className="text-white">{activeFindings}</strong></div>
                      </div>
                    </div>

                    <div className="bg-brand-card rounded-2xl border border-brand-border p-6 flex flex-col justify-between relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Layers3 className="w-32 h-32 text-brand-cyan rotate-12" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs text-gray-400 uppercase tracking-widest">Configured stack</span>
                          <Layers3 className="text-gray-500 w-4 h-4" />
                        </div>
                        <div className="text-4xl font-bold text-brand-amber">{context.stack.length}</div>
                        <div className="text-xs text-gray-400 mt-1">Stack components</div>
                      </div>
                      <div className="text-xs text-brand-amber/80 leading-relaxed">Stated monthly spend: ${currentMonthlySpend.toLocaleString()}<br />Mode: {operatingMode}</div>
                    </div>
                  </div>
                </div>

                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-brand-amber" /> Impact Ranked Alerts
                    </h2>
                    <div className="flex gap-2">
                      {['COST', 'ECOSYSTEM', 'PERF'].map((filter) => (
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
                              isDemo={operatingMode === 'demo'}
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
                      <h3 className="font-bold text-lg mb-2">No findings yet</h3>
                      <p className="text-sm max-w-xs text-gray-400">Run a scan after configuring your stack. If no relevant findings are returned, this view will remain intentionally empty.</p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === 'stack' && (
              <motion.div
                key="stack"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={panelFallback('stack-manager')}>
                  <StackManager
                    stack={context.stack}
                    onAddTool={onAddStackItem}
                    onUpdateTool={onUpdateStackItem}
                    onRemoveTool={onRemoveStackItem}
                    onLoadDemoStack={onLoadDemoStack}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'runway' && (
              <motion.div
                key="runway"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={panelFallback('runway-projections')}>
                  <RunwayProjections
                    currentMonthlySpend={currentMonthlySpend}
                    implementedSavings={implementedSavings}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'architecture' && (
              <motion.div
                key="architecture"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={panelFallback('architecture-view')}>
                  <ArchitectureView mermaidGraph={mermaidGraph} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={panelFallback('insights')}>
                  <InsightsTab
                    alerts={visibleAlerts}
                    stack={context.stack}
                    monthlyCost={currentMonthlySpend}
                    implementedSavings={implementedSavings}
                    onGenerateInsights={onGenerateInsights}
                    onGenerateDiligence={onGenerateDiligence}
                    founderSync={founderSync}
                    onSyncFounders={onSyncFounders}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'digest' && (
              <motion.div
                key="digest"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.25 }}
              >
                <Suspense fallback={panelFallback('weekly-digest')}>
                  <WeeklyDigest alerts={visibleAlerts} onGenerateDigest={onGenerateDigest} />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function panelFallback(label: string) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-8 text-gray-500 font-mono text-sm">
      LOADING_{label.toUpperCase()}...
    </div>
  );
}
