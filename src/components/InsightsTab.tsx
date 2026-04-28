import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, FileText, ShieldCheck, Link2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert, BusinessStateItem, FounderSyncResult, StackItem } from '../types';

interface InsightsTabProps {
  alerts: Alert[];
  stack: StackItem[];
  monthlyCost: number;
  implementedSavings: number;
  onGenerateInsights: () => Promise<string>;
  onGenerateDiligence: () => Promise<string>;
  founderSync: FounderSyncResult;
  onSyncFounders: (businessState: BusinessStateItem[]) => Promise<FounderSyncResult>;
}

export default function InsightsTab({
  alerts,
  stack,
  monthlyCost,
  implementedSavings,
  onGenerateInsights,
  onGenerateDiligence,
  founderSync,
  onSyncFounders,
}: InsightsTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingDiligence, setIsGeneratingDiligence] = useState(false);
  const [isSyncingFounders, setIsSyncingFounders] = useState(false);
  const [report, setReport] = useState('');
  const [reportMode, setReportMode] = useState<'summary' | 'diligence'>('summary');
  const [error, setError] = useState('');
  const [businessState, setBusinessState] = useState<BusinessStateItem[]>([]);

  const demoBusinessState: BusinessStateItem[] = [
    { type: 'Lead', item: 'Acme Corp Demo (Cold)' },
    { type: 'Deadline', item: 'YC Application (Due Friday)' },
    { type: 'Task', item: 'Mailchimp Welcome Sequence (Draft)' },
    { type: 'Promise', item: 'Promised investors new Vector Search by next week' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setReportMode('summary');
    try {
      const markdown = await onGenerateInsights();
      setReport(markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate executive summary.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDiligence = async () => {
    setIsGeneratingDiligence(true);
    setError('');
    setReportMode('diligence');
    try {
      const markdown = await onGenerateDiligence();
      setReport(markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate diligence report.');
    } finally {
      setIsGeneratingDiligence(false);
    }
  };

  const handleLoadBusinessState = () => {
    setBusinessState(demoBusinessState);
  };

  const handleSyncFounders = async () => {
    setIsSyncingFounders(true);
    setError('');

    try {
      const inputState = businessState.length > 0 ? businessState : demoBusinessState;
      if (businessState.length === 0) {
        setBusinessState(demoBusinessState);
      }
      await onSyncFounders(inputState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate founder sync plan.');
    } finally {
      setIsSyncingFounders(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Executive Summary</h2>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Weekly update written for Paul</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 max-w-2xl">
            A non-technical, board-ready overview of runway impact, diligence risks, and engineering velocity.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-cyan px-5 py-3 font-bold text-brand-bg hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'GENERATING...' : 'Generate Executive Report'}
          </button>
          <button
            onClick={handleGenerateDiligence}
            disabled={isGeneratingDiligence}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-amber/40 bg-brand-amber/10 px-5 py-3 font-bold text-brand-amber hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {isGeneratingDiligence ? 'GENERATING...' : 'Generate Tech Due Diligence (YC/Investors)'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Alerts Reviewed" value={String(alerts.length)} />
        <StatCard label="Monthly Cost" value={`$${monthlyCost.toLocaleString()}`} />
        <StatCard label="Savings Implemented" value={`$${implementedSavings.toLocaleString()}`} />
      </div>

      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-amber/10 border border-brand-amber/30 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-brand-amber" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Founder Sync</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Bridge Paul's execution with Sam's technical constraints</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLoadBusinessState}
              type="button"
              className="text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-brand-cyan transition-colors"
            >
              Load Business State
            </button>
            <button
              onClick={handleSyncFounders}
              disabled={isSyncingFounders}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-2.5 font-bold text-brand-cyan hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isSyncingFounders ? 'SYNCING...' : 'Run Founder Sync'}
            </button>
          </div>
        </div>

        {businessState.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {businessState.map((entry) => (
              <div key={`${entry.type}-${entry.item}`} className="rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-sm">
                <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500 mr-2">{entry.type}</span>
                <span className="text-gray-300">{entry.item}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500 font-mono">No business state loaded yet. Use Load Business State for the live pitch scenario.</div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand-border bg-brand-bg p-4">
            <div className="text-[10px] uppercase tracking-widest font-mono text-gray-500 mb-3">Paul's Action Items</div>
            {founderSync.paulActions.length > 0 ? (
              <ul className="space-y-2 text-sm text-gray-200 list-disc list-inside">
                {founderSync.paulActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-500 font-mono">Run Founder Sync to generate Paul's prioritized next actions.</div>
            )}
          </div>

          <div className="rounded-2xl border border-brand-amber/40 bg-brand-amber/10 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-brand-amber mb-3">
              <AlertTriangle className="w-3.5 h-3.5" /> Alignment Warnings
            </div>
            {founderSync.coordinationAlerts.length > 0 ? (
              <ul className="space-y-2 text-sm text-brand-amber list-disc list-inside">
                {founderSync.coordinationAlerts.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-brand-amber/80 font-mono">Coordination conflicts will appear here after sync runs.</div>
            )}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-card border border-brand-border rounded-2xl p-6 min-h-[420px]"
      >
        {error ? (
          <div className="text-brand-red text-sm font-mono">{error}</div>
        ) : report ? (
          <div className="prose prose-invert prose-cyan max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
          </div>
        ) : (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center text-gray-500">
            <div className="w-14 h-14 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-brand-cyan" />
            </div>
            <p className="max-w-md text-sm leading-relaxed">
              Generate a concise executive summary for Paul. It will synthesize the current alerts into a weekly business update.
            </p>
          </div>
        )}
      </motion.div>

      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
        Current stack: {stack.length} tools • View: {reportMode === 'summary' ? 'Executive Summary' : 'Tech Due Diligence'}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-widest font-mono text-gray-500 mb-2">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
