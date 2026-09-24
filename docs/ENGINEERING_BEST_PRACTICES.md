# StackSense Engineering Best Practices

## Purpose

This document defines the engineering and product-quality standards for taking StackSense from a hackathon prototype to a trustworthy SaaS product. StackSense should help technical founders discover relevant changes in their technology stack, understand the evidence, estimate impact, and coordinate a response.

The product must never present model-generated speculation as verified intelligence. Reliability, traceability, and honest system status take precedence over visual spectacle.

## Product principles

### Evidence before recommendations

Every production finding must be grounded in a captured source. A finding should include:

- The official source URL and source type.
- The relevant vendor, product, plan, and version.
- The observation date and, when available, the effective date.
- A short evidence excerpt or structured before-and-after values.
- Confidence and verification state.
- The affected StackSense workspace components.
- A reproducible impact calculation.

Gemini may extract, classify, compare, summarize, and recommend. It must not be treated as the factual source.

### Honest operating modes

StackSense should expose explicit modes:

- `live`: uses current, captured sources and persistent product data.
- `demo`: uses deterministic seeded fixtures and is visibly labelled.
- `degraded`: a live dependency is unavailable; existing verified data remains visible.

Never silently replace a failed live request with plausible mock content. API errors must use appropriate status codes and structured error responses.

### Business impact must be explainable

Projected savings, runway impact, and risk scores must expose their inputs and formula. Keep projected, approved, implemented, and verified savings separate. Marking an action complete must not automatically prove financial impact.

### Start narrow and earn breadth

The first production release should support a small, well-tested catalog of vendors and official sources. Prefer high-quality monitoring for 10–20 products over superficial coverage of hundreds.

## Architecture standards

### Clear service boundaries

Separate the backend into focused modules:

- HTTP routes and request validation.
- Authentication and workspace authorization.
- Stack catalog and workspace data.
- Source adapters and snapshot capture.
- Change detection and deduplication.
- Gemini extraction and recommendation orchestration.
- Deterministic cost and impact calculators.
- Scan scheduling and job execution.
- Notifications and report generation.
- Observability and audit logging.

Route handlers should translate HTTP requests and responses only. Business logic belongs in services with testable interfaces.

### Shared contracts

Maintain one source of truth for API contracts. Use runtime validation and inferred TypeScript types for all external input and model output. Do not maintain loosely related duplicate interfaces in frontend and backend code.

Recommended response envelopes:

```ts
type ApiSuccess<T> = {
  data: T;
  requestId: string;
};

type ApiError = {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    details?: unknown;
  };
  requestId: string;
};
```

### Durable domain model

Use stable identifiers and timestamps for users, workspaces, memberships, stack components, sources, source snapshots, scan runs, findings, evidence, recommendations, actions, decisions, reports, and verified savings.

Persist state transitions as an audit trail. Avoid overwriting the evidence or calculation associated with an earlier decision.

### Configuration

- Validate required environment variables during server startup.
- Keep all provider secrets on the server.
- Never inject Gemini or infrastructure secrets into the frontend bundle.
- Provide a committed `.env.example` containing names and descriptions only.
- Keep local, preview, demo, staging, and production configuration explicit.
- Use the same documented ports and origins across scripts, CORS, and setup instructions.

## AI and source-processing standards

### Retrieval pipeline

A production scan should follow a traceable pipeline:

1. Resolve stack components to known vendor/product identities.
2. Select allowlisted official sources for each component.
3. Capture source content and metadata.
4. Normalize and hash the snapshot.
5. Compare it with the last successful snapshot.
6. Extract structured changes.
7. Deduplicate and rank changes.
8. Match changes to the workspace configuration.
9. Calculate deterministic impact where possible.
10. Generate a recommendation grounded in the evidence.

### Model boundaries

- Treat source text and user text as untrusted input.
- Use structured output schemas for every machine-consumed response.
- Validate model output before persistence or rendering.
- Record model, prompt version, request identifier, latency, and token usage.
- Set timeouts, retry limits, and per-workspace budgets.
- Keep deterministic calculations outside prompts.
- Evaluate prompts against versioned fixtures before release.
- Do not claim certainty when evidence is ambiguous.

### Evidence quality states

Use visible states such as:

- `verified`: directly supported by an official source and validated fields.
- `review_needed`: evidence exists but extraction or applicability is uncertain.
- `informational`: relevant source update without a required action.
- `stale`: the source has not been refreshed within its expected interval.
- `retracted`: the finding was invalidated or superseded.

## Backend and API practices

- Authenticate every workspace endpoint.
- Authorize access at the workspace boundary on every request.
- Enforce request-size, field-length, array-length, and nesting limits.
- Apply rate limits and model-usage quotas.
- Use idempotency keys for scan creation and action mutations.
- Add request cancellation and upstream timeouts.
- Return `4xx` for invalid input and `5xx`/`503` for service failures.
- Do not return demo data from production error handlers.
- Use structured logs without secrets or raw sensitive content.
- Provide liveness and readiness endpoints.
- Version public API contracts.
- Set secure HTTP headers and a narrow CORS allowlist.

## Frontend practices

### State and data

- Use server state as the source of truth for workspaces, scans, findings, and actions.
- Reserve local storage for non-sensitive preferences and recoverable drafts.
- Model loading, empty, partial, stale, error, offline, and success states explicitly.
- Cancel obsolete requests and prevent duplicate mutations.
- Preserve user context when retrying a failed operation.

### Trustworthy presentation

- Show the source, date, confidence, and affected tool near every finding.
- Label projections and assumptions clearly.
- Never display decorative uptime, latency, authentication, or synchronization values as if they are real telemetry.
- Make demo data visually unmistakable.
- Prefer clear language over terminal-style jargon in primary workflows.

### Accessibility and responsiveness

- Meet WCAG 2.2 AA contrast and interaction requirements.
- Use semantic landmarks and a logical heading hierarchy.
- Associate every input with a programmatic label and error message.
- Give icon-only controls accessible names.
- Provide visible keyboard focus and complete keyboard operation.
- Respect `prefers-reduced-motion`.
- Maintain at least 44px touch targets where practical.
- Support phone, tablet, laptop, and wide desktop layouts without horizontal overflow.

### Performance

- Set bundle and route-level performance budgets.
- Lazy-load report, chart, and diagram features.
- Import only the diagram types that the product supports.
- Avoid loading large visualization libraries on initial routes.
- Self-host or deliberately manage font loading and fallbacks.
- Measure Core Web Vitals in production.

## Security practices

- Keep secrets server-side and rotate exposed credentials immediately.
- Use Firebase Authentication or an equivalent identity provider with verified tokens.
- Enforce tenant isolation in both application logic and database rules.
- Sanitize or safely render all model-generated markdown, HTML, SVG, and diagrams.
- Avoid permissive Mermaid security modes for untrusted diagrams.
- Apply dependency updates and security auditing in CI.
- Maintain an abuse model for expensive model and scan endpoints.
- Define data retention, export, and deletion behavior.
- Record sensitive administrative actions in an audit log.

## Testing strategy

### Unit tests

Cover calculators, normalizers, source matching, change detection, ranking, validation, and state transitions.

### Contract and integration tests

Test every endpoint against valid input, invalid input, authorization failures, provider timeouts, partial results, and rate limits. Use deterministic Gemini and source fixtures.

### End-to-end tests

Cover onboarding, adding a stack component, running a scan, reviewing evidence, assigning an action, recording a decision, verifying savings, and generating a digest.

### Quality gates

Every pull request should run:

- Formatting and linting.
- Type checking.
- Unit and integration tests.
- Production build.
- Dependency audit.
- Accessibility smoke tests.
- Critical end-to-end tests.
- Bundle-size checks.

## Documentation standards

- Keep the README aligned with the implemented product.
- Clearly separate current capabilities, demo behavior, and roadmap items.
- Document local frontend and backend setup together.
- Maintain API, data-model, deployment, and incident-response documentation.
- Record significant architectural choices in short Architecture Decision Records.
- Do not leave placeholder URLs, screenshots, team information, or credentials in release documentation.

## Git and delivery practices

- Use short-lived branches and focused commits.
- Keep generated files and secrets out of version control.
- Require review for schema, authentication, billing, model, and security changes.
- Use conventional, outcome-oriented commit messages.
- Deploy through reviewed automation rather than local manual commands.
- Maintain separate preview, staging, and production environments.
- Tag releases and publish concise release notes with migrations and rollback steps.

## Definition of done

A feature is complete only when:

- Its user outcome and acceptance criteria are documented.
- Its data and error states are designed.
- Authorization and abuse cases are addressed.
- Runtime schemas and types agree.
- Automated tests cover the critical behavior.
- Accessibility and responsive behavior are verified.
- Observability is sufficient to diagnose failure.
- Documentation matches the shipped implementation.

