## 1. Seed Mode Structure

- [x] 1.1 Add a dedicated `seed:demo` backend script and root command entrypoint separate from `seed` and `seed:smoke`
- [x] 1.2 Refactor shared seed helpers so demo, smoke, and provider seed modes can reuse stable primitives without blurring responsibilities
- [x] 1.3 Update local bootstrap and runbook documentation to explain `seed`, `seed:smoke`, and `seed:demo` with their intended use cases

## 2. Demo Dataset

- [x] 2.1 Define deterministic demo teams, fixtures, and venues with enough breadth to represent scheduled, locked, live, and finished match states
- [x] 2.2 Seed deterministic demo users with known credentials suitable for local login and role-free product exploration
- [x] 2.3 Seed deterministic leagues, memberships, and invite codes so ranking and join flows are immediately usable
- [x] 2.4 Seed match predictions, outright selections, mural posts, and badges so the main product surfaces are populated on first load
- [x] 2.5 Seed or recompute match scores, outright scores, and user totals so rankings and scoring widgets show realistic values immediately
- [x] 2.6 Include outright market state variety so demo data exposes open, locked, and resolved market behavior

## 3. Operator Experience

- [x] 3.1 Make the demo seed idempotent so repeated runs refresh the same dataset instead of creating duplicate junk
- [x] 3.2 Print a clear demo summary at the end of the seed run, including demo accounts, important match ids, and league/invite information
- [x] 3.3 Keep provider credential usage environment-scoped and ensure demo mode works without requiring live API access

## 4. Verification

- [x] 4.1 Verify that a seeded demo user can log in and browse populated matches, leagues, rankings, outrights, mural, scoring, and badges
- [x] 4.2 Verify that smoke mode still provisions only the minimal release-gate dataset after the demo work lands
- [x] 4.3 Run typecheck and any relevant automated checks covering the new seed flow and updated documentation/scripts
