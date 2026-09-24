# StackSense Development Plan

## Product objective

Build StackSense into an evidence-backed technical stack intelligence product for startup founders. It should monitor official vendor sources, detect changes relevant to a workspace, quantify business and technical impact, and turn findings into accountable actions and founder-ready reporting.

## Product boundary

### Recommended v1

- Authenticated workspaces and members.
- Manual stack entry with vendor/product/plan/version metadata.
- A curated catalog of 10–20 supported vendors.
- Scheduled capture of official pricing pages, changelogs, release feeds, and advisories.
- Evidence-backed findings with confidence and freshness.
- Deterministic cost-impact calculations with editable assumptions.
- Finding triage, ownership, due dates, decisions, and status history.
- Weekly founder digest and scan history.
- A seeded, clearly labelled demonstration workspace.

### Defer until the monitoring loop is proven

- Automatic migrations or infrastructure changes.
- Arbitrary-web monitoring without a curated source policy.
- Draggable floating windows and command palettes.
- Generalized architecture inference from tool names.
- Broad CRM, email, calendar, and project-management integrations.
- Investor diligence generation as a primary product surface.

## Product decisions requiring owner confirmation

Before implementation begins, confirm:

1. Whether the initial buyer is an individual technical founder or a startup team.
2. Whether the first catalog focuses on AI/cloud infrastructure or general SaaS.
3. Whether Founder Sync is a core workflow or a reporting feature.
4. Whether StackSense remains advisory-only in v1.
5. The vendors that must be supported for the first credible release.

## Phase 0 — Product contract

### Work

- Confirm target user, initial vendor catalog, and v1 outcome.
- Rewrite the product promise around verified source monitoring.
- Define product terminology: scan, source, snapshot, finding, evidence, recommendation, action, projected savings, and verified savings.
- Create low-fidelity flows for onboarding, scan review, finding triage, and digest generation.
- Establish measurable activation and retention events.

### Exit criteria

- One approved product brief.
- One agreed v1 scope and explicit non-goals.
- One canonical user journey.
- Initial vendor/source catalog approved.

## Phase 1 — Stabilize the prototype

### Work

- Align development ports, API origins, environment variables, and README instructions.
- Add `.env.example` files without secrets.
- Remove the browser-side Gemini key configuration and unused frontend Gemini service.
- Introduce explicit live, demo, and degraded modes.
- Ensure invalid requests fail before provider or demo branching.
- Replace silent fallback responses with structured errors in live mode.
- Remove fictional telemetry, hardcoded identity data, and non-functional controls.
- Update vulnerable dependencies, especially Vite and Mermaid.
- Use safe diagram rendering or replace Mermaid input with a constrained graph representation.
- Add ESLint, formatting, a test runner, and CI.

### Exit criteria

- A fresh clone installs and starts from documented commands.
- Typecheck, lint, tests, audit policy, and production build run in CI.
- Demo data is always labelled.
- The UI never disguises a failed live request as a successful scan.

## Phase 2 — Domain model and platform foundation

### Work

- Add authentication and workspace membership.
- Add persistent storage for stack components, scan runs, snapshots, findings, evidence, actions, decisions, reports, and savings.
- Adopt shared runtime schemas for frontend/backend contracts.
- Split backend routes, services, provider clients, schemas, and repositories.
- Add request IDs, structured logging, readiness checks, timeouts, retries, and cancellation.
- Add workspace quotas and rate limits for expensive operations.

### Suggested core entities

- `User`
- `Workspace`
- `Membership`
- `StackComponent`
- `Source`
- `SourceSnapshot`
- `ScanRun`
- `Finding`
- `Evidence`
- `Recommendation`
- `Action`
- `DecisionEvent`
- `SavingsEstimate`
- `Report`

### Exit criteria

- Complete workspace state survives reloads and sessions.
- Cross-workspace access is rejected by automated tests.
- Each mutation has validation, authorization, and an audit event.

## Phase 3 — Evidence-backed monitoring engine

### Work

- Build a source-adapter interface.
- Implement adapters for the approved initial vendor catalog.
- Capture normalized source content, metadata, hashes, and retrieval status.
- Compare snapshots and identify meaningful changes.
- Use Gemini structured output to extract and classify changes.
- Match changes to workspace components and versions.
- Deduplicate findings across scans.
- Add confidence, freshness, evidence, and verification states.
- Calculate impact from captured pricing plus explicit workspace assumptions.
- Add scheduled scans and retry/dead-letter behavior.

### Exit criteria

- Every live finding links to a captured official source.
- Re-running an unchanged source does not create a duplicate finding.
- Savings calculations can be reproduced without a model call.
- Failed sources produce a partial/degraded scan, not fabricated findings.

## Phase 4 — Frontend redesign

### Information architecture

- `Today`: priority findings, scan status, action queue, opportunity summary.
- `Stack`: components, plans, versions, ownership, spend, and monitoring status.
- `Changes`: evidence feed and scan history.
- `Savings`: projected, approved, implemented, and verified impact.
- `Reports`: weekly digest and founder-ready exports.
- `Settings`: team, sources, notifications, billing, and integrations.

### Core redesign work

- Implement the design system described in `FRONTEND_DESIGN_BRIEF.md`.
- Build a responsive navigation shell.
- Replace theatrical terminal output with a factual scan-progress component.
- Create evidence-first finding cards and a dedicated finding detail page.
- Add source metadata, confidence, freshness, and affected-component context.
- Add an explicit triage workflow: review, accept, assign, dismiss, resolve, verify.
- Build explainable savings and health views.
- Build polished empty, loading, partial, error, offline, and demo states.
- Redesign onboarding around accurate stack configuration rather than simulated subsystem initialization.
- Add accessible keyboard interaction and reduced-motion behavior.

### Exit criteria

- All primary workflows work at phone, tablet, laptop, and wide-desktop sizes.
- No horizontal overflow or fixed navigation obstruction.
- WCAG 2.2 AA automated checks pass, followed by keyboard review.
- Every number presented as business impact is traceable to inputs.

## Phase 5 — Actions, reporting, and founder collaboration

### Work

- Add action ownership, status, due date, comments, and decision history.
- Separate proposed, approved, implemented, and verified savings.
- Generate weekly reports from persisted findings and decisions.
- Add export/copy functionality before outbound delivery integrations.
- Reframe Founder Sync around real workspace actions and risks.
- Add notification preferences and quiet handling of non-actionable scans.

### Exit criteria

- A founder can understand what changed and what requires a decision without reading raw technical details.
- A technical owner can trace every report statement back to findings and evidence.
- Reports remain reproducible after later scans.

## Phase 6 — Launch hardening

### Work

- Complete threat modelling and tenant-isolation review.
- Add dependency, secret, and container scanning.
- Add model-quality evaluation suites and regression fixtures.
- Add end-to-end tests for the critical journey.
- Establish performance budgets and optimize large bundles.
- Add product analytics, error tracking, scan telemetry, and cost monitoring.
- Define backup, retention, export, deletion, incident, and rollback procedures.
- Create staging and production deployment pipelines.

### Exit criteria

- Critical user journey passes automatically in CI and staging.
- Operational dashboards cover source health, scan success, latency, model usage, and cost.
- Release and rollback procedures are documented and tested.
- No high-severity production dependency advisories remain without an explicit accepted-risk record.

## Test plan

### Unit

- Source normalization and hashing.
- Snapshot diffing.
- Vendor/product resolution.
- Change deduplication and ranking.
- Cost and runway calculations.
- Validation and state transitions.

### Integration

- Authentication and workspace authorization.
- Source adapter success, timeout, malformed response, and rate-limit behavior.
- Gemini structured-output validation.
- Scan orchestration with partial failures.
- Report generation from persisted data.

### End-to-end

1. Create or enter a workspace.
2. Configure a stack component.
3. Run or observe a scan.
4. Open a finding and verify evidence.
5. Accept and assign its action.
6. Record implementation and verified impact.
7. Generate a weekly report.

## Suggested implementation order

1. Product contract and honest demo/live behavior.
2. Configuration, dependency, and security cleanup.
3. Shared schemas, authentication, and persistence.
4. One complete source adapter and end-to-end finding pipeline.
5. New application shell and evidence-first finding experience.
6. Expand vendor coverage through the adapter interface.
7. Actions, reports, and founder collaboration.
8. Launch hardening and production operations.

The first vertical slice should use one real vendor source and exercise the complete path from capture to evidence, finding, action, and report. This validates the product architecture before expanding breadth.

