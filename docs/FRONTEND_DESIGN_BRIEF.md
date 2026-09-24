# StackSense Frontend Design Brief

## Purpose

This brief adapts the requested brutalist-lite visual direction to StackSense. It covers both the public product landing page and the authenticated product preview shown within it. StackSense is not an ecommerce product: conversion should lead to a product demo, workspace creation, or waitlist signup, while product UI should emphasize evidence, confidence, and accountable decisions.

## Final implementation prompt

### Summary

Create a bold, modern B2C/prosumer SaaS landing page for **StackSense**, an evidence-backed technical stack intelligence product for startup founders and small engineering teams. StackSense monitors official vendor pricing pages, changelogs, release notes, and deprecation notices; matches relevant changes to a founder's stack; and turns them into sourced findings, explainable cost impact, and concrete actions.

The page must communicate trust and operational clarity rather than ecommerce. Its conversion goal is to encourage visitors to start a workspace, explore an interactive product demo, or join the early-access list. Use a high-contrast editorial layout, aggressive display typography, golden-yellow highlights, grid-patterned sections, problem/solution contrast, and a bento-style product-capability grid.

Do not invent customer counts, uptime, savings totals, testimonials, vendor partnerships, or live monitoring data. Any sample finding must be visibly labelled as demo data. Do not imply that an unsupported integration is live.

### Brand and style

Use a brutalist-lite SaaS aesthetic that feels confident, technical, and editorial without becoming a cyberpunk terminal theme.

- Display font: **Anton** for primary headings, uppercase, normal letter spacing, line-height approximately `0.9`.
- Body/interface font: **Satoshi**, weights 400, 500, and 700. Provide robust local/system fallbacks.
- Primary charcoal: `#171e19`.
- Secondary dark: `#272727`.
- Sage: `#b7c6c2`.
- White: `#ffffff`.
- Primary accent: golden yellow `#ffe17c`.
- Error/critical red: use sparingly and ensure WCAG AA contrast.
- Light-section borders: `rgba(23, 30, 25, 0.10)`.
- Dark-section borders: `rgba(183, 198, 194, 0.10)`.
- Grid pattern: `background-size: 40px 40px` with two subtle linear gradients using `#b7c6c220` 1px lines.
- Highlight important headline words with a `#ffe17c` rectangle rotated approximately 15 degrees behind the text. Keep the text itself horizontal and readable.
- Cards should use `300ms cubic-bezier(0.4, 0, 0.2, 1)` transitions for transform, border, and shadow.
- Respect `prefers-reduced-motion`; transitions must never be required to understand content.

The page should feel premium and energetic, but every claim should remain concrete. Avoid fake system telemetry, random terminal strings, excessive glow, glassmorphism, stock ecommerce imagery, shopping language, pricing-discount badges, or decorative dashboards with meaningless numbers.

### Global requirements

- Build a responsive page for phone, tablet, laptop, and wide desktop.
- Use semantic landmarks and a logical heading hierarchy.
- Meet WCAG 2.2 AA contrast targets.
- Provide visible keyboard focus and accessible names for icon-only controls.
- Keep touch targets at least 44px where practical.
- Avoid horizontal overflow at every breakpoint.
- Use motion only to reinforce hierarchy or status.
- All mock product data must be marked `Demo` or `Example`.
- Use real StackSense terminology: stack component, source, scan, finding, evidence, impact, recommendation, action, and verified savings.

### Page structure and conversion flow

The page follows this narrative:

1. Immediate product promise.
2. Trusted explanation of what is monitored.
3. The founder's current problem versus the StackSense workflow.
4. Evidence-first product preview.
5. Core capabilities.
6. How verified monitoring works.
7. Founder outcomes and use cases.
8. Product principles/trust statement.
9. Final workspace/demo CTA.

### Navigation

Create a fixed `h-20` header with a `#ffffff` background at approximately 90% opacity and backdrop blur.

- Left: `STACKSENSE` in Anton, uppercase, approximately `text-3xl`, followed by a yellow period.
- Center desktop links: `Product`, `How it works`, `Use cases`, `Trust`, and `Roadmap` in Satoshi small/medium.
- Right: a text-only `Sign in` link and a pill button labelled `Explore demo` or `Start monitoring`, using charcoal background, white text, `px-6`, and fully rounded corners.
- Mobile: replace center links with an accessible menu trigger and preserve the primary CTA.

Do not show ecommerce links such as Shop, Cart, Orders, or Pricing Sale.

### Hero section

Use a centered composition on the 40px grid background with generous vertical spacing.

- Eyebrow badge: uppercase, tracking-widest, text-xs, with a yellow status dot. Copy: `TECH STACK INTELLIGENCE FOR FOUNDERS`.
- Headline: Anton, responsive from `text-6xl` to `text-9xl`, uppercase, maximum three lines. Recommended copy: `KNOW WHAT CHANGED. BEFORE IT COSTS YOU.` Apply the rotated yellow highlight behind `COSTS YOU` or `CHANGED`.
- Subheadline: Satoshi, `text-lg` to `text-xl`, charcoal at roughly 70% opacity, `max-w-2xl`. Explain that StackSense watches official vendor sources, matches changes to the user's stack, and produces evidence-backed actions.
- Primary CTA group: `Explore the demo` as the large yellow button and `See how evidence works` as a secondary text/outline action.
- Optional early-access form: email input and yellow Anton button labelled `Request early access`. Do not use checkout language.
- Under the CTA, include a compact trust line: `Official sources • Explainable impact • Human-approved actions`.

Add a product-preview strip below the hero showing three example status chips: `Pricing change`, `Deprecation`, and `Security advisory`. Label the entire strip `Demo findings`.

### Source confidence strip

Instead of fabricated social-proof logos, create a restrained strip explaining supported source types:

- Official pricing pages
- Product changelogs
- Release feeds
- Deprecation notices
- Security advisories

Use simple line icons and the caption `StackSense is designed to cite the source behind every finding.` If actual supported vendors are not known, do not display vendor logos.

### Problem and solution contrast

Create a full-width two-column section that stacks on mobile.

#### Left: The old way

- Background `#171e19`, white text.
- Anton heading: `THE OLD WAY`.
- Muted sage supporting copy.
- Red X icons next to concrete pains:
  - Changelogs scattered across dozens of tabs.
  - Pricing changes discovered after the bill arrives.
  - Deprecations buried until an integration breaks.
  - Recommendations with no source or cost calculation.
  - Technical risk that never reaches the business founder.

#### Right: The StackSense way

- Background `#272727` with a yellow accent border.
- Anton heading: `THE STACKSENSE WAY`.
- Yellow check-circle icons and crisp white copy:
  - Monitor known official sources on a schedule.
  - Match changes to the tools and plans you actually use.
  - Show evidence, freshness, and confidence.
  - Explain cost, risk, effort, and urgency.
  - Assign an owner and track the decision to verified impact.

Keep both columns aligned from the top and give them equal visual weight.

### Evidence-first product mockup

Create a browser-style mockup frame showcasing the authenticated StackSense product. It must look like an operational intelligence workspace, not a design editor or ecommerce admin.

Frame:

- Border using charcoal at 10% opacity, rounded corners, and `shadow-2xl`.
- Header with subdued red/yellow/green traffic-light dots.
- Centered title: `StackSense — Today`.
- A visible `Demo workspace` badge.

Body layout:

- Left sidebar: `Today`, `Stack`, `Changes`, `Savings`, `Reports`, `Settings`.
- Main canvas: priority findings and recent scan summary.
- Right evidence panel: source and action details for the selected finding.

Main finding example:

- Label: `PRICING CHANGE`.
- Title: `Example API input price decreased`.
- Affected component chip.
- Impact row: `Projected monthly savings`, `Confidence`, and `Effective date`.
- Evidence block with official-source icon, source title, capture timestamp, and a short excerpt placeholder.
- Explicit `Demo data` label.
- Actions: `Review evidence`, `Assign action`, and `Dismiss`.

Right evidence panel controls/content:

- `Source status: Verified`.
- `Freshness: Captured today`.
- `Before` and `After` values.
- Editable usage assumption.
- Calculation preview showing how projected savings were derived.
- Owner selector and status selector as static mock controls.

Include a restrained floating cursor with a founder label only if it supports the collaboration story. Do not imitate live collaboration unless it is labelled as a preview.

### Bento capability grid

Use a responsive 3-column grid with desktop auto-rows around 400px. Cards 1 and 4 may span two columns. On small screens, collapse to one column without preserving forced heights.

Use light `#f8f9fa` cards and selected charcoal cards for contrast. Headings use Anton around `text-3xl`. Each card needs a product-specific abstract visualization.

1. **Evidence attached** — span two columns. Show a source snapshot, highlighted changed line, capture date, and verified badge.
2. **Impact you can inspect** — show a compact before/after cost calculator with editable assumptions and projected versus verified labels.
3. **Your stack, not generic advice** — show tool chips connected to only the findings that affect them.
4. **From finding to action** — span two columns. Show a lightweight workflow: Review → Approve → Assign → Implement → Verify.
5. **Founder-ready reports** — show a clean weekly digest preview translating technical events into runway, risk, and velocity.
6. **Human-approved AI** — show structured extraction and a review checkpoint; explain that Gemini assists analysis while official sources remain the evidence.

Hover may lift cards slightly and strengthen the shadow. Do not hide essential content behind hover.

### How it works

Use a two-column desktop layout with a 1:2 ratio and a single-column mobile layout.

- Left: sticky Anton title, approximately `text-7xl`: `FROM SOURCE TO DECISION`.
- Right: four vertical steps rather than ecommerce purchasing steps.

Each step uses a massive Anton numeral around `text-8xl` in yellow at 20% opacity, becoming fully opaque on hover/focus.

1. **Map your stack** — add the vendors, products, plans, versions, owners, and spend assumptions that matter.
2. **Monitor official sources** — capture supported pricing pages, changelogs, release feeds, and advisories on a schedule.
3. **Verify the impact** — compare evidence, match affected components, and calculate cost or risk using visible assumptions.
4. **Turn change into action** — approve, assign, implement, and record verified outcomes for the team and weekly report.

### Use-case section

Create three high-contrast cards for real founder outcomes instead of generic testimonials if verified customer quotes are unavailable.

- `PROTECT RUNWAY` — detect pricing and plan changes, then calculate impact from actual usage assumptions.
- `AVOID BREAKAGE` — surface relevant deprecations with effective dates and affected components.
- `ALIGN THE FOUNDERS` — translate technical findings into decisions, owners, and concise business updates.

If real testimonials are later supplied, use a three-card testimonial layout:

- Center card charcoal with white text and `translate-y-4` on desktop only.
- Side cards white with subtle charcoal borders.
- Yellow stars only when an actual rating was provided.
- 48px grayscale avatars, Anton uppercase names, verified role/company labels.
- Never fabricate names, avatars, quotes, ratings, or companies.

### Trust and product-principles section

Add a clean white section with an Anton heading: `AI SHOULD EXPLAIN. EVIDENCE SHOULD PROVE.`

Use four compact principles:

- Official sources over unsupported claims.
- Explainable calculations over magic numbers.
- Human approval before action.
- Clear demo, degraded, and live states.

This section should visually calm the page before the final CTA and establish product credibility.

### Final CTA

Use a high-energy `#ffe17c` section with oversized Anton decorative text at approximately 10% opacity in the background. Suggested background words: `SEE THE CHANGE`.

Centered content:

- Anton headline, responsive up to `text-8xl`, line-height `0.9`: `STOP FINDING OUT TOO LATE.`
- Satoshi subtext, approximately `text-2xl`, `max-w-2xl`: invite founders to explore the evidence-first demo or request early access.
- Primary charcoal button: `Explore demo`.
- Secondary email form where appropriate: input plus charcoal button `Request access`, with strong shadow and a restrained `hover:scale-[1.03]`.
- Supporting copy: `No credit card. Demo data is clearly labelled.` only if factually true.

### Footer

Use a charcoal footer with:

- StackSense wordmark and concise product description.
- Product links: Product, How it works, Roadmap.
- Company links only if real pages exist.
- Legal links only when implemented.
- A short statement: `Built for founders who need the source, not just the summary.`

Do not include placeholder social links or fabricated compliance badges.

### Product application direction

The authenticated product should reuse the same typography, colors, borders, and interaction rules while reducing display-type scale for operational screens.

- Anton is reserved for page titles, major metrics, and section labels.
- Satoshi handles navigation, tables, forms, evidence, and long-form content.
- Evidence and actions take priority over decorative charts.
- Yellow signals attention or opportunity, not generic selection everywhere.
- Red is reserved for verified critical risk or errors.
- Green is reserved for verified/resolved states.
- Use a collapsible desktop sidebar and accessible mobile navigation.
- Keep finding cards scannable; use a full page or drawer for detailed evidence.

### Required states

Design and implement:

- First-use empty state.
- Configured stack with no findings.
- Scan in progress with factual source-level progress.
- Partial scan with failed sources.
- Live findings.
- Demo findings.
- Stale evidence.
- API or network error with retry.
- Rate-limit/quota state.
- No-access/authorization state.
- Loading skeletons that preserve layout.

### Deliverables

Produce:

1. Responsive landing page.
2. Reusable design tokens and typography setup.
3. Responsive navigation and footer.
4. Evidence-first StackSense browser mockup.
5. Bento capability grid.
6. Problem/solution section.
7. How-it-works section.
8. Use-case or verified-testimonial section.
9. Trust-principles section.
10. Final CTA.
11. Reduced-motion and keyboard-focus behavior.
12. Mobile, tablet, laptop, and wide-desktop verification.

Use real product copy supplied above. Where product data or integrations do not yet exist, label the content as a demo or omit the claim rather than inventing proof.

