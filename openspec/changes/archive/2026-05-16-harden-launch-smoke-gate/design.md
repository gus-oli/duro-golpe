## Context

The launch smoke suite currently plays two roles at once: it is the release gate for critical product behavior, and it is also the first detector of frontend redesign regressions. That makes selector quality and command ergonomics unusually important.

The current setup has two concrete weaknesses:
- the smoke command re-seeds the deterministic backend fixture but does not automatically hand off the generated match UUID to Playwright
- several assertions depend on incidental text matches, CSS classes, or broad markup patterns that are likely to change during legitimate UI work

Constraints:
- Preserve the existing smoke coverage scope and deterministic dataset.
- Keep Chromium-only, one-worker execution for the shared mutable backend flow.
- Avoid turning the smoke suite into a brittle visual snapshot test.
- Avoid introducing a separate heavy automation framework or custom test server just for smoke orchestration.

## Goals / Non-Goals

**Goals:**
- Make `npm run test:launch-smoke` behave like a real single-command gate for the supported local workflow.
- Replace brittle selectors with a stable automation contract across match detail, leagues, and outrights.
- Keep smoke assertions focused on behavior and system state transitions rather than presentational details.
- Clarify operator prerequisites so failures point to actual setup gaps rather than hidden command assumptions.

**Non-Goals:**
- Expanding the smoke suite into a full regression matrix for every route or viewport.
- Converting smoke coverage into screenshot or snapshot testing.
- Reworking backend launch architecture so the smoke command also boots the backend process.
- Replacing semantic Playwright selectors everywhere with `data-testid` by default.

## Decisions

### 1. Introduce a dedicated orchestration layer for the launch smoke command

We will replace the current shell chaining with a small Node-based orchestration script that:
- runs `seed:smoke`
- parses or otherwise resolves the seeded smoke match UUID
- injects `E2E_MATCH_ID` into the Playwright process
- forwards the existing environment, including `WEBHOOK_SECRET`

Why:
- The current root script implies a one-command gate but still requires manual UUID handoff.
- A script wrapper lets us preserve the deterministic seed while making the handoff explicit and testable.

Alternatives considered:
- Keep the manual `E2E_MATCH_ID` export requirement. Rejected because it keeps the gate misleading and easy to misuse.
- Make Playwright query the database directly for the smoke fixture. Rejected because it couples the test process to database access and duplicates smoke environment knowledge in test code.
- Hardcode the smoke UUID. Rejected because the persisted UUID is not stable across environments.

### 2. Prefer semantic selectors first, and add explicit automation anchors only where semantics are insufficient

We will harden the smoke suite using this priority order:
1. accessible roles and labels already meaningful to users
2. scoped containers with stable semantic identity
3. explicit `data-*` automation anchors for surfaces that lack durable semantics

Why:
- Roles and labels keep the smoke aligned with real interaction surfaces.
- Some product-specific values such as invite codes, market identity, and selected options still need explicit durable anchors.
- This avoids coupling smoke to CSS classes or arbitrary text placement.

Alternatives considered:
- Convert all selectors to `data-testid`. Rejected because it weakens accessibility pressure and overfits the UI to tests.
- Keep broad text selectors and use `.first()`. Rejected because it hides ambiguity instead of removing it.

### 3. Reframe assertions around behavior, not presentation details

The smoke suite will assert outcomes such as:
- authenticated access succeeds
- a match detail page for the seeded fixture loads
- prediction values persist after reload
- locked markets reject writes
- match lock disables prediction inputs
- ranking updates after outright resolution

It will avoid asserting:
- specific CSS classes used to style the selected state
- brittle text queries that match multiple nodes
- point text that depends on visual formatting rather than the presence of the updated ranking state

Why:
- The smoke gate should fail on product regressions, not on harmless composition changes.
- UI redesign work will continue to evolve layout and copy.

Alternatives considered:
- Freeze launch surfaces and require markup stability. Rejected because it blocks normal frontend iteration.

### 4. Keep operator prerequisites explicit and narrow

The smoke command will remain responsible for deterministic seed setup and Playwright invocation, but it will not silently assume ownership of long-running backend infrastructure. Documentation and command failure paths should clearly state that:
- infra and backend must be available
- frontend may still be auto-started through Playwright webServer
- `WEBHOOK_SECRET` remains environment-scoped

Why:
- This matches the current architecture and avoids hidden background process management.
- It keeps the change focused on smoke reliability rather than service orchestration.

Alternatives considered:
- Make the smoke command also boot backend and Redis. Rejected because it broadens scope and complicates process lifecycle management on Windows local development.

## Risks / Trade-offs

- [Adding automation anchors can leak test concerns into UI markup] -> Mitigation: prefer semantic selectors first and only add targeted `data-*` markers where durability clearly needs it.
- [Parsing seed output can become fragile if log formatting changes] -> Mitigation: define a stable machine-readable handoff format or stable output contract for the smoke match id.
- [Behavior-focused assertions may miss some visual regressions] -> Mitigation: keep smoke scoped to critical behavior and rely on manual QA for presentation quality checks.
- [Command ergonomics may still confuse operators if backend prerequisites are not clear] -> Mitigation: update the runbook and script comments together with the orchestration change.

## Migration Plan

1. Define the launch smoke command contract and the selector contract in specs.
2. Add the orchestration layer that resolves the smoke match UUID automatically.
3. Refactor Playwright smoke selectors and assertions to use the stable contract.
4. Add any required semantic or `data-*` anchors to launch-critical frontend surfaces.
5. Update the runbook to reflect the new command behavior and remaining prerequisites.
6. Re-run the smoke suite to confirm the gate survives the redesigned frontend.

Rollback strategy:
- Revert the orchestration script and selector-contract changes if the new smoke path proves unstable.
- Because this is a test and operator-experience change, rollback is code-only and does not require data migration.

## Open Questions

- Should the smoke seed print a machine-readable JSON payload in addition to human-readable logs, or is a single stable `Match ID:` line sufficient for the wrapper contract?
- Do we want a small shared selector helper layer inside Playwright, or should the suite stay inline while selectors are hardened?
