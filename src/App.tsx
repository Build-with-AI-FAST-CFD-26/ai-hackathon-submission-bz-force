import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight, ArrowRight, BadgeCheck, BellRing, BookOpenText, Check, CheckCircle2,
  ChevronDown, CircleDollarSign, Clock3, Code2, FileCheck2, FileText, Gauge, GitBranch,
  Layers3, Menu, MousePointer2, Newspaper, PanelLeftClose, RefreshCw, ShieldCheck,
  Sparkles, Target, TrendingDown, TriangleAlert, UserRound, X, XCircle,
} from 'lucide-react';

const navItems = [
  ['Product', '#product'], ['How it works', '#how-it-works'], ['Use cases', '#use-cases'],
  ['Trust', '#trust'], ['Roadmap', '#roadmap'],
] as const;

const sourceTypes = [
  { icon: CircleDollarSign, label: 'Official pricing pages' },
  { icon: Newspaper, label: 'Product changelogs' },
  { icon: RefreshCw, label: 'Release feeds' },
  { icon: Clock3, label: 'Deprecation notices' },
  { icon: ShieldCheck, label: 'Security advisories' },
];

const oldWay = [
  'Changelogs scattered across dozens of tabs.',
  'Pricing changes discovered after the bill arrives.',
  'Deprecations buried until an integration breaks.',
  'Recommendations with no source or transparent calculation.',
  'Technical risk that never reaches the business founder.',
];

const stackSenseWay = [
  'Monitor known official sources on a schedule.',
  'Match changes to the products and plans the team actually uses.',
  'Show evidence, freshness, and confidence.',
  'Explain cost, risk, effort, and urgency.',
  'Assign an owner and track the decision through verified impact.',
];

function Wordmark({ light = false }: { light?: boolean }) {
  return <a className={`wordmark ${light ? 'wordmark--light' : ''}`} href="#top" aria-label="StackSense home">STACKSENSE<span>.</span></a>;
}

function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Wordmark />
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="header-actions">
          <Link className="signin-link" to="/app">Sign in</Link>
          <Link className="button button--dark button--header" to="/app">Explore demo</Link>
          <button className="menu-button" type="button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(value => !value)}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
        {navItems.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}<ArrowDownRight aria-hidden="true" /></a>)}
        <Link to="/app" onClick={() => setOpen(false)}>Sign in<ArrowDownRight aria-hidden="true" /></Link>
      </nav>}
    </header>
  );
}

function Hero() {
  return <section className="hero grid-bg" id="top" aria-labelledby="hero-title">
    <div className="hero-inner">
      <div className="eyebrow"><span />TECH STACK INTELLIGENCE FOR FOUNDERS</div>
      <h1 id="hero-title">KNOW WHAT <span className="highlight-word">CHANGED.</span><br />BEFORE IT COSTS YOU.</h1>
      <p className="hero-copy">StackSense watches official vendor sources, matches meaningful changes to your actual stack, and turns cited evidence into a prioritized action your team can inspect.</p>
      <div className="hero-actions">
        <Link className="button button--yellow" to="/app">Explore the demo <ArrowRight aria-hidden="true" /></Link>
        <a className="text-link" href="#evidence">See how evidence works <ArrowDownRight aria-hidden="true" /></a>
      </div>
      <p className="trust-line"><BadgeCheck aria-hidden="true" /> Official sources <span>•</span> Explainable impact <span>•</span> Human-approved actions</p>
      <div className="demo-findings" aria-label="Demo finding types"><strong>DEMO FINDINGS</strong>{['Pricing change', 'Deprecation', 'Security advisory'].map(item => <span key={item}>{item}</span>)}</div>
    </div>
  </section>;
}

function SourceStrip() {
  return <section className="source-strip" aria-label="Source categories">
    <p>StackSense is designed to cite the source behind every finding.</p>
    <div className="source-list">{sourceTypes.map(({ icon: Icon, label }) => <div className="source-item" key={label}><Icon aria-hidden="true" /><span>{label}</span></div>)}</div>
  </section>;
}

function ContrastSection() {
  return <section className="contrast-section" aria-label="The old way compared with the StackSense way">
    <article className="contrast-panel contrast-panel--old"><div className="section-kicker">THE PROBLEM</div><h2>THE OLD WAY</h2><p>Important changes arrive everywhere and belong to no one.</p><ul>{oldWay.map(item => <li key={item}><XCircle aria-hidden="true" />{item}</li>)}</ul></article>
    <article className="contrast-panel contrast-panel--new"><div className="section-kicker">THE WORKFLOW</div><h2>THE STACKSENSE WAY</h2><p>One evidence trail from source change to founder decision.</p><ul>{stackSenseWay.map(item => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}</ul></article>
  </section>;
}

function ProductMockup() {
  const sidebar = [[Gauge, 'Today'], [Layers3, 'Stack'], [BellRing, 'Changes'], [CircleDollarSign, 'Savings'], [FileText, 'Reports']] as const;
  return <section className="product-section" id="product" aria-labelledby="product-title">
    <div className="section-heading"><div><span className="section-kicker section-kicker--dark">EVIDENCE-FIRST BY DESIGN</span><h2 id="product-title">SEE THE SOURCE.<br />THEN MAKE THE CALL.</h2></div><p>Every finding keeps the evidence, assumptions, and next action in the same view—so the team can challenge the math before changing the stack.</p></div>
    <div className="browser-frame" id="evidence">
      <div className="browser-topbar"><div className="traffic-lights" aria-hidden="true"><span /><span /><span /></div><strong>StackSense — Today</strong><span className="demo-badge">DEMO WORKSPACE</span></div>
      <div className="workspace">
        <aside className="workspace-sidebar" aria-label="Demo workspace navigation"><div className="workspace-mark">S<span>.</span></div><nav>{sidebar.map(([Icon, label], index) => <button className={index === 0 ? 'active' : ''} key={label} type="button" aria-label={label}><Icon aria-hidden="true" /><span>{label}</span></button>)}</nav><button className="sidebar-collapse" type="button" aria-label="Collapse demo sidebar"><PanelLeftClose aria-hidden="true" /></button></aside>
        <main className="findings-canvas">
          <div className="canvas-heading"><div><span className="mini-label">FRIDAY, SEP 25</span><h3>Today</h3></div><div className="scan-status"><span /> Demo scan complete</div></div>
          <div className="finding-summary"><span>1 priority finding</span><span>Demo data</span></div>
          <article className="finding-card">
            <div className="finding-meta"><span className="type-label">PRICING CHANGE</span><span className="confidence"><BadgeCheck aria-hidden="true" /> HIGH CONFIDENCE</span></div>
            <div className="finding-title-row"><div><h4>Example API input price decreased</h4><span className="component-chip"><Code2 aria-hidden="true" /> Example API • Production</span></div><div className="savings-metric"><small>PROJECTED MONTHLY SAVINGS</small><strong>$128</strong><em>DEMO</em></div></div>
            <div className="evidence-excerpt"><div className="quote-mark">“</div><div><span>EVIDENCE EXCERPT · DEMO</span><p>Input pricing changes from <s>$2.50</s> to <mark>$2.00 per 1M tokens</mark>, effective October 1.</p></div></div>
            <div className="source-row"><div className="source-icon"><FileCheck2 aria-hidden="true" /></div><div><strong>Example API — official pricing</strong><span>Captured today at 09:42 • Effective Oct 1</span></div><a href="#evidence-panel">View source <ArrowDownRight aria-hidden="true" /></a></div>
            <div className="finding-actions"><a href="#evidence-panel">Review evidence</a><Link className="primary" to="/app">Open interactive demo <ArrowRight aria-hidden="true" /></Link><button className="dismiss" type="button">Dismiss</button></div>
          </article>
        </main>
        <aside className="evidence-panel" id="evidence-panel" aria-label="Demo evidence and action panel">
          <div className="panel-heading"><div><span className="mini-label">EVIDENCE & ACTION</span><h3>Inspect impact</h3></div><button type="button" aria-label="Close evidence panel"><X aria-hidden="true" /></button></div>
          <div className="verified-row"><span><CheckCircle2 aria-hidden="true" /> Source status</span><strong>Verified</strong></div>
          <div className="freshness"><Clock3 aria-hidden="true" /><div><strong>Captured today</strong><span>Source snapshot is current</span></div></div>
          <div className="price-compare"><div><span>BEFORE</span><strong>$2.50</strong><small>/ 1M tokens</small></div><ArrowRight aria-hidden="true" /><div><span>AFTER</span><strong>$2.00</strong><small>/ 1M tokens</small></div></div>
          <label className="mock-field">MONTHLY USAGE ASSUMPTION<div><input aria-label="Demo monthly usage assumption" defaultValue="256" /><span>M tokens</span></div></label>
          <div className="calculation"><span>CALCULATION PREVIEW · DEMO</span><code>256M × ($2.50 − $2.00)</code><strong>= $128 / month</strong></div>
          <label className="mock-select">OWNER<select aria-label="Demo owner"><option>Alex — Founder</option></select><ChevronDown aria-hidden="true" /></label>
          <label className="mock-select">STATUS<select aria-label="Demo status"><option>Needs review</option></select><ChevronDown aria-hidden="true" /></label>
          <button className="panel-action" type="button">Save demo action</button><div className="founder-cursor" aria-hidden="true"><MousePointer2 /><span>FOUNDER</span></div>
        </aside>
      </div>
    </div>
    <p className="mockup-note"><span>DEMO</span> Static product preview. Example values are illustrative and do not represent live monitoring or verified savings.</p>
  </section>;
}

function CapabilityGrid() {
  return <section className="capabilities grid-bg" aria-labelledby="capabilities-title">
    <div className="section-heading section-heading--compact"><div><span className="section-kicker section-kicker--dark">CORE CAPABILITIES</span><h2 id="capabilities-title">INTELLIGENCE YOU<br />CAN INTERROGATE.</h2></div></div>
    <div className="bento-grid">
      <article className="bento-card bento-card--wide evidence-card"><div className="card-copy"><span className="card-number">01</span><h3>EVIDENCE ATTACHED</h3><p>Every production finding should remain traceable to its official source and capture time.</p></div><div className="source-snapshot"><div className="snapshot-top"><span><FileText aria-hidden="true" /> SOURCE SNAPSHOT · DEMO</span><span className="verified-pill"><Check /> VERIFIED</span></div><p>Input processing price per 1M tokens</p><code>- $2.50</code><code className="changed-line">+ $2.00 <span>CHANGED</span></code><div className="snapshot-date">Captured Sep 25 · 09:42</div></div></article>
      <article className="bento-card impact-card"><div><span className="card-number">02</span><h3>IMPACT YOU<br />CAN INSPECT</h3></div><div className="mini-calculator"><div><span>Current price</span><strong>$2.50</strong></div><div><span>New price</span><strong>$2.00</strong></div><div><span>Usage assumption</span><strong>256M</strong></div><div className="mini-result"><span>Projected savings · Demo</span><strong>$128/mo</strong><small>UNVERIFIED ESTIMATE</small></div></div></article>
      <article className="bento-card stack-card"><div><span className="card-number">03</span><h3>YOUR STACK.<br />NOT GENERIC ADVICE.</h3><p>Connect each finding only to the components it can actually affect.</p></div><div className="stack-map" aria-label="Demo component mapping"><span>Finding 01</span><i /><div><span className="connected">Example API</span><span>Database</span><span>Web hosting</span><span>Analytics</span></div></div></article>
      <article className="bento-card bento-card--wide workflow-card"><div className="card-copy"><span className="card-number">04</span><h3>FROM FINDING TO ACTION</h3><p>Make the decision path explicit, owned, and verifiable.</p></div><div className="workflow-line">{['Review', 'Approve', 'Assign', 'Implement', 'Verify'].map((step, index) => <div key={step}><span>{index + 1}</span><strong>{step}</strong>{index < 4 && <ArrowRight aria-hidden="true" />}</div>)}</div></article>
      <article className="bento-card report-card"><div><span className="card-number">05</span><h3>FOUNDER-READY REPORTS</h3></div><div className="digest-preview"><div className="digest-head"><span>WEEKLY DIGEST · DEMO</span><span>01 / 04</span></div>{[['Runway impact', '1 opportunity'], ['Risk', '1 decision'], ['Engineering velocity', 'No change'], ['Decisions needed', 'Review pricing']].map(([key, value]) => <div className="digest-row" key={key}><span>{key}</span><strong>{value}</strong></div>)}</div></article>
      <article className="bento-card ai-card"><div><span className="card-number">06</span><h3>HUMAN-APPROVED AI</h3><p>Gemini assists with extraction, classification, and recommendations. Official sources remain the evidence.</p></div><div className="ai-preview"><div><Sparkles aria-hidden="true" /><code>{'{ type: “pricing_change”, confidence: 0.96 }'}</code></div><ArrowDownRight aria-hidden="true" /><span><UserRound aria-hidden="true" /> HUMAN REVIEW CHECKPOINT</span></div></article>
    </div>
  </section>;
}

const steps = [
  ['MAP YOUR STACK', 'Add the vendors, products, plans, versions, owners, and spend assumptions that matter.'],
  ['MONITOR OFFICIAL SOURCES', 'Capture supported pricing pages, changelogs, release feeds, deprecation notices, and security advisories on a schedule.'],
  ['VERIFY THE IMPACT', 'Compare evidence, identify affected stack components, and calculate cost or risk using visible assumptions.'],
  ['TURN CHANGE INTO ACTION', 'Approve, assign, implement, and record verified outcomes for the technical team and founder report.'],
];

function HowItWorks() {
  return <section className="how-section" id="how-it-works" aria-labelledby="how-title"><div className="how-title-wrap"><span className="section-kicker">THE MONITORING PIPELINE</span><h2 id="how-title">FROM SOURCE<br />TO DECISION</h2><p>Four steps. One unbroken evidence trail.</p></div><ol className="steps-list">{steps.map(([title, copy], index) => <li key={title} tabIndex={0}><span className="step-number">0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowDownRight aria-hidden="true" /></li>)}</ol></section>;
}

function Outcomes() {
  const outcomes = [
    { icon: TrendingDown, number: '01', title: 'PROTECT RUNWAY', copy: 'Detect pricing and plan changes, then calculate impact from explicit usage assumptions.' },
    { icon: TriangleAlert, number: '02', title: 'AVOID BREAKAGE', copy: 'Surface relevant deprecations with effective dates, evidence, and affected components.' },
    { icon: Target, number: '03', title: 'ALIGN THE FOUNDERS', copy: 'Translate technical findings into decisions, owners, deadlines, and concise business updates.' },
  ];
  return <section className="outcomes-section" id="use-cases" aria-labelledby="outcomes-title"><div className="section-heading"><div><span className="section-kicker section-kicker--dark">FOUNDER OUTCOMES</span><h2 id="outcomes-title">LESS SURPRISE.<br />MORE CONTROL.</h2></div><p>No invented testimonials. Just the practical jobs StackSense is being designed to do.</p></div><div className="outcomes-grid">{outcomes.map(({ icon: Icon, number, title, copy }, index) => <article className={index === 1 ? 'featured' : ''} key={title}><div className="outcome-top"><Icon aria-hidden="true" /><span>{number}</span></div><h3>{title}</h3><p>{copy}</p><a href="#early-access">Explore this use case <ArrowRight aria-hidden="true" /></a></article>)}</div></section>;
}

function TrustSection() {
  const principles = [[BookOpenText, 'OFFICIAL SOURCES', 'Official sources over unsupported claims.'], [Gauge, 'VISIBLE ASSUMPTIONS', 'Explainable calculations over magic numbers.'], [UserRound, 'HUMAN APPROVAL', 'Human approval before action.'], [GitBranch, 'HONEST STATES', 'Clear demo, degraded, and live states.']] as const;
  return <section className="trust-section" id="trust" aria-labelledby="trust-title"><div className="trust-heading"><span className="section-kicker section-kicker--dark">PRODUCT TRUST PRINCIPLES</span><h2 id="trust-title">AI SHOULD EXPLAIN.<br /><span className="highlight-word">EVIDENCE</span> SHOULD PROVE.</h2></div><div className="principles-grid">{principles.map(([Icon, title, copy], index) => <article key={title}><span className="principle-number">0{index + 1}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="roadmap-note" id="roadmap"><span>ROADMAP PRINCIPLE</span><p>New source coverage and product actions should ship with visible evidence boundaries, honest states, and human control.</p></div></section>;
}

function FinalCta() {
  return <section className="final-cta" id="early-access" aria-labelledby="cta-title"><div className="cta-watermark" aria-hidden="true">SEE THE CHANGE</div><div className="cta-content"><span className="section-kicker section-kicker--dark">READY WHEN THE SOURCE CHANGES</span><h2 id="cta-title">STOP FINDING<br />OUT TOO LATE.</h2><p>Explore the evidence-first product demo and see how StackSense turns a sourced change into a reviewable action.</p><div className="cta-actions"><Link className="button button--dark" to="/app">Explore demo <ArrowRight aria-hidden="true" /></Link><a className="button button--outline" href="#evidence">Review the evidence model</a></div><small>The product opens in demo mode by default. Demo data is always labelled.</small></div></section>;
}

function Footer() {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><Wordmark light /><p>Evidence-backed technical stack intelligence for founders and small engineering teams.</p></div><div className="footer-links"><div><strong>PRODUCT</strong><Link to="/app">Demo workspace</Link><a href="#how-it-works">How it works</a><a href="#use-cases">Use cases</a></div><div><strong>PRINCIPLES</strong><a href="#trust">Trust</a><a href="#roadmap">Roadmap</a><a href="#evidence">Evidence</a></div></div></div><div className="footer-bottom"><p>Built for founders who need the source, not just the summary.</p><span>© {new Date().getFullYear()} StackSense</span></div></footer>;
}

export default function App() {
  return <div className="site-shell"><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content"><Hero /><SourceStrip /><ContrastSection /><ProductMockup /><CapabilityGrid /><HowItWorks /><Outcomes /><TrustSection /><FinalCta /></main><Footer /></div>;
}
