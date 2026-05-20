## 1. Smoke Orchestration

- [x] 1.1 Replace the root launch smoke shell chaining with a dedicated orchestration script that runs `seed:smoke`, resolves the seeded match UUID, and invokes Playwright with `E2E_MATCH_ID`
- [x] 1.2 Keep `WEBHOOK_SECRET` and related prerequisites environment-scoped while surfacing clearer failure messages for missing launch smoke prerequisites
- [x] 1.3 Update the launch runbook and root script documentation to reflect the new self-provisioned smoke workflow and remaining backend prerequisites

## 2. Selector Contract Hardening

- [x] 2.1 Audit the current launch smoke selectors and classify which ones can move to roles/labels versus which need explicit durable automation anchors
- [x] 2.2 Add stable semantic or `data-*` hooks on match detail, league, ranking, and outrights surfaces where the smoke suite currently depends on ambiguous text, DOM order, or CSS classes
- [x] 2.3 Refactor `launch-smoke.spec.ts` to validate launch behavior through the hardened selector contract instead of incidental styling or duplicate text matches
- [x] 2.4 Refactor `live-score.spec.ts` only where needed to align with the same durable contract while preserving its current behavior focus

## 3. Verification

- [x] 3.1 Run backend and frontend typecheck after the smoke contract changes
- [x] 3.2 Re-run `npm run test:launch-smoke` against the redesigned frontend and confirm the launch gate passes without manual `E2E_MATCH_ID` handoff
- [x] 3.3 Sanity-check that the hardened smoke still fails meaningfully when a real prerequisite is missing, rather than masking setup problems
