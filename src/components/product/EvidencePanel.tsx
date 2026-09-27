import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Clock3, Loader2, Send, X } from 'lucide-react';
import type { OperatingMode } from '../../config/operatingMode';
import type { ProductAlert, StackItem } from '../../types';
import { affectedComponent } from './FindingCard';
import { StatusBadge } from './ProductUI';

type Message = { role: 'user' | 'assistant'; content: string };

export default function EvidencePanel({ finding, stack, mode, onClose, onImplement, onDismiss, onAsk }: { finding: ProductAlert; stack: StackItem[]; mode: OperatingMode; onClose: () => void; onImplement: () => void; onDismiss: () => void; onAsk: (question: string, onChunk: (value: string) => void, onDone: () => void, onError: (error: unknown) => void) => Promise<void> }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState('');
  const isDemo = mode === 'demo';

  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [finding.id, onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = question.trim();
    if (!value || asking) return;
    setQuestion(''); setAskError(''); setAsking(true);
    setMessages((previous) => [...previous, { role: 'user', content: value }, { role: 'assistant', content: '' }]);
    await onAsk(value, (chunk) => setMessages((previous) => previous.map((message, index) => index === previous.length - 1 ? { ...message, content: message.content + chunk } : message)), () => setAsking(false), (error) => { setAsking(false); setAskError(error instanceof Error ? error.message : 'Guidance is unavailable.'); });
  };

  return <div className="evidence-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="evidence-panel" role="dialog" aria-modal="true" aria-labelledby="evidence-title">
    <header><div><p className="product-eyebrow">Evidence &amp; action</p><h2 id="evidence-title">Inspect impact</h2></div><button ref={closeButton} aria-label="Close evidence panel" onClick={onClose}><X /></button></header>
    <section className="evidence-status"><div><CheckCircle2 /><span>Evidence state</span><strong>{isDemo ? 'Simulated' : 'Model-provided'}</strong></div><p>{isDemo ? 'This demonstration did not query or capture an official source.' : 'The current prototype response does not include a structured verification state.'}</p></section>
    <dl className="evidence-meta"><div><dt><Clock3 /> Generated</dt><dd>{new Date(finding.timestamp).toLocaleString()}</dd></div><div><dt>Operating mode</dt><dd>{mode}</dd></div><div><dt>Affected component</dt><dd>{affectedComponent(finding, stack)}</dd></div><div><dt>Source URL</dt><dd>Unavailable</dd></div></dl>
    <section><p className="product-eyebrow">Impact calculation</p><div className="impact-calculation"><span>{isDemo ? 'Demo-projected impact' : 'Model-provided estimate'}</span><strong>${finding.potentialSavings.toLocaleString()} <small>/ month</small></strong><p>No structured before/after values or deterministic formula were returned. Treat this as a projection until verified.</p></div></section>
    <section><p className="product-eyebrow">Recommended action</p><div className="evidence-recommendation">{finding.action}</div><div className="evidence-field-grid"><label>Owner<select defaultValue="unassigned"><option value="unassigned">Unassigned</option></select></label><label>Status<select value={finding.status} onChange={() => undefined} aria-label="Finding status"><option value="active">Needs review</option><option value="resolved">Implemented</option><option value="dismissed">Dismissed</option></select></label></div><p className="session-note">Changes in this prototype are stored for this browser session only.</p><div className="evidence-actions">{finding.status === 'active' && <button className="product-button product-button--dark" onClick={onImplement}>Mark implemented</button>}<button className="product-button product-button--outline" onClick={onDismiss}>Dismiss</button></div></section>
    <section className="evidence-ai"><div><p className="product-eyebrow">Ask about this finding</p><StatusBadge tone={isDemo ? 'yellow' : 'neutral'}>{isDemo ? 'Demo guidance' : `${mode} guidance`}</StatusBadge></div>{messages.length > 0 && <div className="evidence-conversation" aria-live="polite">{messages.map((message, index) => <p key={index} className={message.role}><strong>{message.role === 'user' ? 'You' : 'StackSense'}</strong>{message.content || (asking && index === messages.length - 1 ? 'Preparing guidance…' : '')}</p>)}</div>}{askError && <p className="field-error" role="alert">{askError} You can retry your question.</p>}<form onSubmit={submit}><label htmlFor="finding-question">Question</label><div><input id="finding-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about cost, risk, or implementation" /><button aria-label="Ask StackSense" disabled={!question.trim() || asking}>{asking ? <Loader2 className="spin" /> : <Send />}</button></div></form></section>
  </aside></div>;
}
