import { useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Alert } from '../types';

interface WeeklyDigestProps {
  alerts: Alert[];
  onGenerateDigest: () => Promise<string>;
}

export default function WeeklyDigest({ alerts, onGenerateDigest }: WeeklyDigestProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [digest, setDigest] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const markdown = await onGenerateDigest();
      setDigest(markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate executive digest.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-brand-amber/10 border border-brand-amber/30 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-brand-amber" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Weekly Digest</h2>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Executive summary for Paul</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 max-w-2xl">
            A short, board-ready digest centered on runway saved, critical risks mitigated, and engineering velocity.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-amber px-5 py-3 font-bold text-brand-bg hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'GENERATING...' : 'Generate Executive Summary'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Alerts in Digest" value={String(alerts.length)} />
        <StatCard label="Status" value="Ready" />
        <StatCard label="Audience" value="Paul / CEO" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-card border border-brand-border rounded-2xl p-6 min-h-[420px]"
      >
        {error ? (
          <div className="text-brand-red text-sm font-mono">{error}</div>
        ) : digest ? (
          <article className="prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{digest}</ReactMarkdown>
          </article>
        ) : (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center text-gray-500">
            <div className="w-14 h-14 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mb-4">
              <CalendarDays className="w-6 h-6 text-brand-amber" />
            </div>
            <p className="max-w-md text-sm leading-relaxed">
              Generate the weekly digest to summarize the latest technical activity into a concise business update.
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
