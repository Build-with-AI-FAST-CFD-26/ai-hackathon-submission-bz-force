import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  ArrowRight, 
  MessageSquare, 
  ChevronDown, 
  Send,
  Loader2,
  DollarSign
} from 'lucide-react';
import { Alert, ImpactLevel, StackItem } from '../types';
import { cn } from '../lib/utils';

interface AlertCardProps {
  alert: Alert & { status: 'active' | 'resolved' | 'dismissed' };
  index: number;
  stack: StackItem[];
  onImplement: () => void;
  onDismiss: () => void;
  onAskGemini: (
    alert: Alert & { status: 'active' | 'resolved' | 'dismissed' },
    question: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: unknown) => void
  ) => Promise<void>;
}

export default function AlertCard({ alert, index, stack, onImplement, onDismiss, onAskGemini }: AlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const impactColors = {
    [ImpactLevel.LOW]: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    [ImpactLevel.MEDIUM]: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    [ImpactLevel.HIGH]: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    [ImpactLevel.CRITICAL]: 'text-brand-red bg-brand-red/10 border-brand-red/20 border-2 animate-pulse',
  };

  const categoryMeta = {
    FinOps: { label: '💰 FinOps', className: 'text-brand-amber border-brand-amber/30 bg-brand-amber/10' },
    DevOps: { label: '⚙️ DevOps', className: 'text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10' },
    Security: { label: '🛡️ Security', className: 'text-brand-red border-brand-red/30 bg-brand-red/10' },
  } as const;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMsg = question.trim();
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }, { role: 'ai', content: '' }]);
    setIsLoading(true);

    try {
      await onAskGemini(
        alert,
        userMsg,
        (chunk) => {
          setChatHistory((prev) => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i -= 1) {
              if (next[i].role === 'ai') {
                next[i] = { ...next[i], content: `${next[i].content}${chunk}` };
                break;
              }
            }
            return next;
          });
        },
        () => {
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
          setChatHistory((prev) => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i -= 1) {
              if (next[i].role === 'ai') {
                const fallback = next[i].content ? `${next[i].content}\n` : '';
                next[i] = { ...next[i], content: `${fallback}Connection failure. Strategic link dropped.` };
                break;
              }
            }
            return next;
          });
        }
      );
    } catch (err) {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      layout
      className={cn(
        "bg-brand-card rounded-2xl border border-brand-border overflow-hidden flex flex-col hover:border-brand-cyan/20 transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] group",
        alert.status === 'resolved' && 'border-emerald-500/40 bg-emerald-500/5'
      )}
    >
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-2">
            <div className={cn("px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border", impactColors[alert.impact])}>
              {alert.impact} Impact
            </div>
            <div className={cn("px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border inline-flex w-fit", categoryMeta[alert.category].className)}>
              {categoryMeta[alert.category].label}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {alert.status === 'resolved' && (
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-emerald-300 border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 rounded">
                Resolved
              </span>
            )}
            <span className="text-emerald-400 font-mono text-sm font-bold flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> {alert.potentialSavings}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-2 group-hover:text-brand-cyan transition-colors">{alert.title}</h3>
        <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed">{alert.description}</p>

        <div className="space-y-4">
          <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border">
            <div className="text-[10px] uppercase font-mono text-gray-500 mb-2">Recommended Action</div>
            <div className="text-sm font-medium flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-brand-cyan" /> {alert.action}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onImplement}
              disabled={alert.status === 'resolved'}
              className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-mono uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              Implement
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 rounded-lg border border-brand-border bg-brand-bg py-2 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-border h-px bg-linear-to-r from-transparent via-brand-border to-transparent" />

      <div className="px-6 py-4 flex flex-col">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full group/btn"
        >
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-cyan uppercase tracking-widest">
            <MessageSquare className="w-4 h-4" /> 
            Contextual Advisor
          </div>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded ? "rotate-180" : "")} />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-4">
                <div className="max-h-48 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {chatHistory.length === 0 && (
                    <div className="text-[11px] text-gray-600 font-mono italic">
                      "Ask me about technical implementation, cost-benefit trade-offs, or migration risk."
                    </div>
                  )}
                  {chatHistory.map((chat, i) => (
                    <div key={i} className={cn(
                      "p-3 rounded-lg text-[12px] leading-relaxed",
                      chat.role === 'user' ? "bg-brand-cyan/5 border border-brand-cyan/10 ml-4" : "bg-gray-800/50 border border-brand-border mr-4"
                    )}>
                      <span className="font-mono text-[9px] uppercase tracking-widest opacity-30 block mb-1">
                        {chat.role === 'user' ? 'YOU' : 'STACK_INTEL'}
                      </span>
                      {chat.content}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-brand-cyan/50 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> THINKING_ON_ARCH...
                    </div>
                  )}
                </div>

                <form onSubmit={handleAsk} className="relative mt-2">
                  <input 
                    type="text" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about details..."
                    className="w-full bg-brand-bg border border-brand-border rounded-xl pl-4 pr-12 py-2.5 text-xs outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/30 transition-all"
                  />
                  <button 
                    disabled={!question.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-brand-cyan hover:bg-brand-cyan/10 rounded-lg disabled:opacity-30"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
