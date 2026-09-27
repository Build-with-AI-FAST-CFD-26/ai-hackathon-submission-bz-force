import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { configuredOperatingMode, type OperatingMode } from './config/operatingMode';
import type { BusinessStateItem, FounderSyncResult, ImpactLevel, ProductAlert, StackItem, UserContext } from './types';
import { ImpactLevel as Impact } from './types';
import Onboarding from './components/Onboarding';
import ProductShell from './components/product/ProductShell';
import TodayView from './components/product/TodayView';
import StackView from './components/product/StackView';
import ChangesView from './components/product/ChangesView';
import SavingsView from './components/product/SavingsView';
import ReportsView from './components/product/ReportsView';
import SettingsView from './components/product/SettingsView';
import EvidencePanel from './components/product/EvidencePanel';
import { ApiRequestError, askGemini, generateDigest, generateDiligence, generateInsights, scanStack, syncFounders } from './services/api';
import './legacy-product.css';

const STORAGE_KEY = 'stacksense_user_context';

export default function ProductApp() {
  const location = useLocation(); const navigate = useNavigate();
  const [context, setContext] = useState<UserContext | null>(null); const [initializing, setInitializing] = useState(true); const [isScanning, setIsScanning] = useState(false); const [alerts, setAlerts] = useState<ProductAlert[]>([]); const [mermaidGraph, setMermaidGraph] = useState(''); const [operatingMode, setOperatingMode] = useState<OperatingMode>(configuredOperatingMode); const [scanError, setScanError] = useState<string | null>(null); const [scanMessages, setScanMessages] = useState<string[]>(['No scan has been run in this workspace.']); const [lastScan, setLastScan] = useState<Date | null>(null); const [implementedSavings, setImplementedSavings] = useState(0); const [pendingRescan, setPendingRescan] = useState(false); const [founderSync, setFounderSync] = useState<FounderSyncResult>({ paulActions: [], coordinationAlerts: [] });
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(location.search).get('finding'));

  useEffect(() => { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { try { setContext(JSON.parse(saved)); } catch { localStorage.removeItem(STORAGE_KEY); } } setInitializing(false); }, []);
  useEffect(() => { if (context) localStorage.setItem(STORAGE_KEY, JSON.stringify(context)); }, [context]);

  useEffect(() => { setSelectedId(new URLSearchParams(location.search).get('finding')); }, [location.search]);
  const selectedFinding = alerts.find((item) => item.id === selectedId);
  const closeFinding = useCallback(() => { const id = selectedId; setSelectedId(null); navigate(location.pathname, { replace: true }); requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-finding-id="${CSS.escape(id ?? '')}"]`)?.focus()); }, [location.pathname, navigate, selectedId]);
  const openFinding = (id: string) => { setSelectedId(id); navigate(`${location.pathname}?finding=${encodeURIComponent(id)}`); };

  const reset = () => { localStorage.removeItem(STORAGE_KEY); setContext(null); setAlerts([]); setMermaidGraph(''); setScanMessages(['No scan has been run in this workspace.']); setLastScan(null); setImplementedSavings(0); setPendingRescan(false); setScanError(null); setOperatingMode(configuredOperatingMode); navigate('/app'); };
  const updateStack = (stack: StackItem[]) => { setContext((previous) => previous ? { ...previous, stack } : previous); setPendingRescan(true); };
  const addStack = (name: string, monthlyCost: number, category: string) => context && updateStack([...context.stack, { id: crypto.randomUUID(), name, category, monthlyCost }]);
  const updateStackItem = (id: string, updates: Partial<StackItem>) => context && updateStack(context.stack.map((item) => item.id === id ? { ...item, ...updates } : item));
  const removeStack = (id: string) => context && updateStack(context.stack.filter((item) => item.id !== id));
  const loadDemoStack = () => updateStack([{ id: 'demo-api', name: 'Example API', category: 'API', monthlyCost: 500 }, { id: 'demo-database', name: 'Example Database', category: 'Database', monthlyCost: 200 }]);

  const runScan = async () => {
    if (!context || isScanning) return;
    const names = context.stack.map((item) => item.name).filter(Boolean); const monthlySpend = context.stack.reduce((sum, item) => sum + (Number(item.monthlyCost) || 0), 0);
    if (!names.length) { setScanError('Add at least one stack component before starting a scan.'); return; }
    setIsScanning(true); setScanError(null); setScanMessages(operatingMode === 'demo' ? ['Preparing demo workspace', 'Loading example source snapshots', 'Matching example changes to stack components', 'Calculating demo impact', 'Creating demo findings'] : ['Starting scan', 'Waiting for analysis', 'Processing results']);
    try {
      const result = await scanStack(names, monthlySpend);
      const mapped: ProductAlert[] = result.alerts.map((item, index) => ({ id: item.id || `finding-${index}`, title: item.title, description: item.actionDescription, impact: (item.impactLevel === 'High' ? Impact.HIGH : item.impactLevel === 'Medium' ? Impact.MEDIUM : Impact.LOW) as ImpactLevel, potentialSavings: Number(item.estimatedSavings) || 0, action: item.actionDescription, category: item.category, timestamp: new Date(result.meta.generatedAt).getTime(), status: 'active' }));
      setAlerts(mapped); setMermaidGraph(result.mermaidGraph); setImplementedSavings(0); setOperatingMode(result.meta.mode); setLastScan(new Date(result.meta.generatedAt)); setPendingRescan(false); setScanMessages((previous) => [...previous, 'Complete']);
    } catch (error) {
      let message = 'The backend is unavailable or could not complete the scan. Existing workspace data has been preserved.';
      if (error instanceof ApiRequestError) { if (error.status === 400) message = error.message; else if (error.status === 401 || error.status === 403) message = 'This workspace is not authorized to run a live scan. Check the backend access configuration.'; else if (error.status === 429) message = 'The scan quota has been reached. Wait before retrying; existing workspace data is unchanged.'; }
      setOperatingMode('degraded'); setScanError(message); setScanMessages((previous) => [...previous, 'Scan did not complete. No demo findings were substituted.']);
    } finally { setIsScanning(false); }
  };

  const implement = (id: string) => setAlerts((previous) => { const target = previous.find((item) => item.id === id); if (!target || target.status === 'resolved') return previous; setImplementedSavings((value) => value + target.potentialSavings); return previous.map((item) => item.id === id ? { ...item, status: 'resolved' } : item); });
  const dismiss = (id: string) => setAlerts((previous) => previous.map((item) => item.id === id ? { ...item, status: 'dismissed' } : item));
  const ask = async (finding: ProductAlert, question: string, onChunk: (chunk: string) => void, onComplete: () => void, onError: (error: unknown) => void) => askGemini({ id: finding.id, title: finding.title, impact: finding.impact, estimatedSavings: finding.potentialSavings, actionDescription: finding.action }, question, onChunk, onComplete, onError);
  const generateSummary = () => context ? generateInsights(alerts, context.stack.reduce((sum, item) => sum + item.monthlyCost, 0), implementedSavings) : Promise.resolve('');
  const generateDueDiligence = () => context ? generateDiligence(alerts, context.stack) : Promise.resolve('');
  const sync = async (state: BusinessStateItem[]) => { const result = await syncFounders(state, alerts); setFounderSync(result); return result; };

  if (initializing) return <main className="product-app product-initializing" aria-live="polite">Loading StackSense workspace…</main>;
  if (!context?.onboarded) return <div className="product-app"><Onboarding onComplete={(value) => { setContext(value); setPendingRescan(true); navigate('/app'); }} /></div>;

  let view;
  if (location.pathname === '/app') view = <TodayView alerts={alerts} stack={context.stack} mode={operatingMode} isScanning={isScanning} scanError={scanError} scanMessages={scanMessages} lastScan={lastScan} pendingRescan={pendingRescan} implementedSavings={implementedSavings} onScan={runScan} onOpen={openFinding} onImplement={implement} onDismiss={dismiss} />;
  else if (location.pathname === '/app/stack') view = <StackView stack={context.stack} pendingRescan={pendingRescan} mermaidGraph={mermaidGraph} onAdd={addStack} onUpdate={updateStackItem} onRemove={removeStack} onLoadDemo={loadDemoStack} />;
  else if (location.pathname === '/app/changes') view = <ChangesView alerts={alerts} stack={context.stack} mode={operatingMode} onOpen={openFinding} />;
  else if (location.pathname === '/app/savings') view = <SavingsView alerts={alerts} stack={context.stack} implementedSavings={implementedSavings} />;
  else if (location.pathname === '/app/reports') view = <ReportsView alerts={alerts} stack={context.stack} mode={operatingMode} implementedSavings={implementedSavings} founderSync={founderSync} onGenerateInsights={generateSummary} onGenerateDigest={() => generateDigest(alerts)} onGenerateDiligence={generateDueDiligence} onSyncFounders={sync} />;
  else if (location.pathname === '/app/settings') view = <SettingsView mode={operatingMode} onReset={reset} />;
  else view = <div className="product-page product-not-found"><p className="product-eyebrow">404 · Product view</p><h1>That workspace view doesn’t exist.</h1><p>Use the product navigation or return to Today.</p><Link className="product-button product-button--dark" to="/app">Return to Today</Link></div>;

  return <div className="product-app"><ProductShell mode={operatingMode} panel={selectedFinding ? <EvidencePanel finding={selectedFinding} stack={context.stack} mode={operatingMode} onClose={closeFinding} onImplement={() => implement(selectedFinding.id)} onDismiss={() => { dismiss(selectedFinding.id); closeFinding(); }} onAsk={(question, onChunk, onDone, onError) => ask(selectedFinding, question, onChunk, onDone, onError)} /> : undefined}>{view}</ProductShell></div>;
}
