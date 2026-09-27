import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="product-page-header"><div>{eyebrow && <p className="product-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="product-page-description">{description}</p>}</div>{actions && <div className="product-page-actions">{actions}</div>}</header>;
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'yellow' | 'green' | 'red' }) {
  return <span className={`product-status product-status--${tone}`}>{children}</span>;
}

export function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return <article className="product-metric"><p>{label}</p><strong>{value}</strong>{note && <span>{note}</span>}</article>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <section className="product-empty"><span aria-hidden="true">S.</span><h2>{title}</h2><p>{description}</p>{action}</section>;
}

export function ErrorState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return <section className="product-error" role="alert"><div><h2>{title}</h2><p>{message}</p></div>{action}</section>;
}
