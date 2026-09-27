import { lazy, Suspense } from 'react';
import type { ProductAlert, StackItem } from '../../types';
import { affectedComponent } from './FindingCard';
import { EmptyState, MetricCard, PageHeader, StatusBadge } from './ProductUI';

const RunwayProjections = lazy(() => import('../RunwayProjections'));

export default function SavingsView({ alerts, stack, implementedSavings }: { alerts: ProductAlert[]; stack: StackItem[]; implementedSavings: number }) {
  const projected = alerts.filter((item) => item.status === 'active').reduce((sum, item) => sum + item.potentialSavings, 0);
  const monthlySpend = stack.reduce((sum, item) => sum + Number(item.monthlyCost || 0), 0);
  return <div className="product-page"><PageHeader eyebrow="Explainable impact" title="Savings" description="Projected estimates remain separate from session-implemented actions. Verification is unavailable in this prototype." actions={<StatusBadge>Verification unavailable</StatusBadge>} />
    <section className="metric-grid metric-grid--four"><MetricCard label="Projected savings" value={`$${projected.toLocaleString()}`} note="Open monthly estimates" /><MetricCard label="Approved savings" value="Unavailable" note="Approval workflow not persisted" /><MetricCard label="Session implemented" value={`$${implementedSavings.toLocaleString()}`} note="Action state, not proof" /><MetricCard label="Verified savings" value="Unavailable" note="No verification workflow" /></section>
    {alerts.length ? <><section className="savings-ledger"><div className="section-row"><div><p className="product-eyebrow">Savings ledger</p><h2>Impact by finding</h2></div><span>All values are projections unless stated otherwise.</span></div>{alerts.filter((item) => item.status !== 'dismissed').map((item) => <div className="savings-row" key={item.id}><div><strong>{item.title}</strong><span>{affectedComponent(item, stack)}</span></div><StatusBadge tone={item.status === 'resolved' ? 'green' : 'yellow'}>{item.status === 'resolved' ? 'Session implemented' : 'Projected'}</StatusBadge><strong>${item.potentialSavings.toLocaleString()}/mo</strong></div>)}</section><Suspense fallback={<div className="product-loading-card">Loading runway comparison…</div>}><RunwayProjections currentMonthlySpend={monthlySpend} implementedSavings={implementedSavings} /></Suspense></> : <EmptyState title="No savings estimates" description="Savings appear only after a scan returns findings with projected impact. Stack costs alone are not treated as savings." />}
  </div>;
}
