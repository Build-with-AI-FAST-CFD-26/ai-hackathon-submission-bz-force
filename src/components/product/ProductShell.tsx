import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BellRing, CircleDollarSign, FileText, Gauge, Home, Layers3, Menu, Settings, X } from 'lucide-react';
import type { OperatingMode } from '../../config/operatingMode';

const navigation = [
  { label: 'Today', to: '/app', icon: Gauge, end: true },
  { label: 'Stack', to: '/app/stack', icon: Layers3 },
  { label: 'Changes', to: '/app/changes', icon: BellRing },
  { label: 'Savings', to: '/app/savings', icon: CircleDollarSign },
  { label: 'Reports', to: '/app/reports', icon: FileText },
  { label: 'Settings', to: '/app/settings', icon: Settings },
] as const;

const sectionNames: Record<string, string> = {
  '/app': 'Today', '/app/stack': 'Stack', '/app/changes': 'Changes',
  '/app/savings': 'Savings', '/app/reports': 'Reports', '/app/settings': 'Settings',
};

function ModeBadge({ mode }: { mode: OperatingMode }) {
  return <span className={`product-mode product-mode--${mode}`}>{mode === 'demo' ? 'Demo workspace' : mode === 'live' ? 'Live workspace' : 'Degraded'}</span>;
}

export default function ProductShell({ mode, children, panel }: { mode: OperatingMode; children: ReactNode; panel?: ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const section = sectionNames[location.pathname] ?? 'Not found';

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    drawer.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        requestAnimationFrame(() => menuButton.current?.focus());
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const nav = (
    <nav aria-label="Product navigation" className="product-nav-list">
      {navigation.map(({ label, to, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === '/app'} aria-label={label} title={label} className={({ isActive }) => `product-nav-link${isActive ? ' is-active' : ''}`}>
          <Icon aria-hidden="true" /><span className="product-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className={`product-shell${panel ? ' has-context' : ''}`}>
      <header className="product-topbar">
        <div className="product-shell-dots" aria-label="Product frame marker"><i /><i /><i /></div>
        <div className="product-topbar-title">StackSense — {section}</div>
        <div className="product-topbar-actions"><ModeBadge mode={mode} /><button ref={menuButton} className="product-mobile-menu" aria-label="Open product navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu /></button></div>
      </header>
      <aside className="product-rail">
        <Link to="/app" className="product-mark" aria-label="StackSense Today">S<span>.</span></Link>
        {nav}
        <Link className="product-landing-link" to="/" aria-label="Return to public landing page" title="Return to landing page"><Home aria-hidden="true" /><span className="product-nav-label">Landing page</span></Link>
      </aside>
      {mobileOpen && <div className="product-mobile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileOpen(false); }}><div className="product-mobile-drawer" ref={drawer} role="dialog" aria-modal="true" aria-label="Product navigation"><div><strong>STACKSENSE<span>.</span></strong><button aria-label="Close product navigation" onClick={() => { setMobileOpen(false); requestAnimationFrame(() => menuButton.current?.focus()); }}><X /></button></div>{nav}<Link to="/" className="product-mobile-landing"><Home /> Return to landing page</Link></div></div>}
      <main className="product-workspace" id="main-content">{children}</main>
      {panel}
      <nav className="product-bottom-nav" aria-label="Mobile product navigation">
        {navigation.slice(0, 5).map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} end={to === '/app'} aria-label={label} className={({ isActive }) => isActive ? 'is-active' : ''}><Icon /><span>{label}</span></NavLink>)}
      </nav>
    </div>
  );
}
