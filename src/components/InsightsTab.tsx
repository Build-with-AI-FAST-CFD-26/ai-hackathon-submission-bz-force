import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert } from '../types';

interface InsightsTabProps {
  alerts: Alert[];
  monthlyCost: number;
  implementedSavings: number;
  onGenerateInsights: () => Promise<string>;
}

export default function InsightsTab({ alerts, monthlyCost, implementedSavings, onGenerateInsights }: InsightsTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const markdown = await onGenerateInsights();
      setReport(markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate executive summary.');
    } finally {
      setIsGenerating(false);
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
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-cyan px-5 py-3 font-bold text-brand-bg hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'GENERATING...' : 'Generate Executive Report'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Alerts Reviewed" value={String(alerts.length)} />
        <StatCard label="Monthly Cost" value={`$${monthlyCost.toLocaleString()}`} />
        <StatCard label="Savings Implemented" value={`$${implementedSavings.toLocaleString()}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-card border border-brand-border rounded-2xl p-6 min-h-[420px]"
      >
        {error ? (
          <div className="text-brand-red text-sm font-mono">{error}</div>
        ) : report ? (
          <article className="prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
          </article>
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
