# StackSense

StackSense is an evidence-first technical stack intelligence prototype for startup founders and small engineering teams. The public landing page explains the product; the interactive workspace demonstrates stack configuration, scan review, findings, reports, and action tracking.

The prototype is intentionally explicit about its operating state. Demo findings are seeded and labelled, live failures never fall back silently, and degraded mode preserves the workspace while explaining how to retry.

## Routes

- `/` — public StackSense landing page
- `/app` — Today workspace
- `/app/stack` — stack inventory and inferred architecture
- `/app/changes` — current-session findings feed
- `/app/savings` — projected and session-implemented impact
- `/app/reports` — executive summary, digest, diligence, and Founder Sync
- `/app/settings` — mode, connectivity, limitations, and local reset
- Unknown `/app/*` paths — product-scoped recovery view
- Any other path — friendly global not-found page

Firebase Hosting rewrites all paths to `index.html`, so direct navigation and refreshes on `/app` use the client router correctly.

## Local development

Requirements: Node.js 18 or newer.

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

Copy the example configuration files:

```bash
copy .env.example .env.local
copy backend\.env.example backend\.env
```

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`. The backend runs at `http://localhost:8787` and allows the documented frontend origin by default.

## Operating modes

The frontend uses `VITE_OPERATING_MODE`; the backend uses `STACKSENSE_MODE`. Supported values are:

- `demo` — deterministic fixtures only. The interface displays a persistent Demo workspace label and does not claim official sources were scanned.
- `live` — backend provider results only. `GEMINI_API_KEY` is required by the backend. Provider failures return structured errors and never substitute demo findings.
- `degraded` — live analysis is unavailable. Existing workspace data remains visible with a retry action.

Invalid or missing mode values safely fall back to `demo`.

### Frontend configuration

```env
VITE_OPERATING_MODE=demo
VITE_API_BASE_URL=http://localhost:8787
```

### Backend configuration

```env
STACKSENSE_MODE=demo
GEMINI_API_KEY=
PORT=8787
FRONTEND_ORIGIN=http://localhost:3000
```

Provider keys are server-only. Never put a Gemini key in a `VITE_*` variable.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm audit
cd backend
npm audit
```

Tests use deterministic fixtures and do not call Gemini or external websites.

## Current prototype boundary

Implemented:

- Responsive public landing page and route-based product workspace
- Manual stack configuration stored locally for the demo
- Evidence/action drawer with URL-backed finding selection
- Filterable current-session changes, staged savings, reports, and Founder Sync
- Explicit demo, live, and degraded scan states
- Structured backend success and error envelopes
- Demo findings and report fixtures with visible labels
- Backend-only Gemini access in live mode

Not implemented in this milestone:

- Authentication or authorization
- Persistent database storage
- Scheduled source monitoring
- Verified vendor integrations
- Billing, payments, or outbound notification integrations

The product plan and trust requirements are documented in `docs/DEVELOPMENT_PLAN.md`, `docs/ENGINEERING_BEST_PRACTICES.md`, and `docs/FRONTEND_DESIGN_BRIEF.md`.
