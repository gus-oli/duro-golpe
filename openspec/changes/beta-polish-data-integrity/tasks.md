## 1. Data Integrity And Team Localization

- [x] 1.1 Add a backend team localization map keyed by stable FIFA/team codes for all World Cup 2026 teams currently known to the provider seed.
- [x] 1.2 Update provider-backed team ingestion to persist localized display names while preserving provider identifiers, FIFA codes, and official crest/flag URLs.
- [x] 1.3 Make smoke/demo seed flows non-destructive for provider-backed national teams, especially Brazil and France.
- [x] 1.4 Add or update seed tests covering provider seed followed by smoke seed without replacing real team metadata.
- [ ] 1.5 Verify matches UI renders Brazil and France with real localized names and non-smoke flags after reseeding.

## 2. Outright Option Cleanup

- [x] 2.1 Update team-based outright seeding to include only real selectable national teams and exclude knockout placeholders or smoke-only teams.
- [x] 2.2 Add a safe cleanup path for existing placeholder outright options such as `A definir R1603B`.
- [x] 2.3 Expand individual outright catalogs for top scorer, best player, and revelation with broader curated candidate lists.
- [x] 2.4 Ensure outright option upserts remain idempotent and preserve valid existing predictions.
- [x] 2.5 Add backend tests or seed verification for team-market filtering and expanded individual catalogs.

## 3. Brazilian Copy And Brand Polish

- [x] 3.1 Run a PT-BR copy pass across primary frontend surfaces and replace obvious unaccented strings.
- [x] 3.2 Align user-facing backend and email messages with natural PT-BR wording where those messages surface to users.
- [x] 3.3 Replace the weak header text treatment with a compact, stronger `Duro Golpe` wordmark in the authenticated shell.
- [ ] 3.4 Verify the updated wordmark remains readable and compact on desktop and mobile.

## 4. Hosted Password Reset Operations

- [x] 4.1 Register or document the `password_reset_tokens` migration path so hosted Neon environments can be verified reliably.
- [x] 4.2 Update the hosted beta runbook with the exact reset-password verification steps.
- [x] 4.3 Document Brevo API key storage and the Render free IP allowlist trade-off, recommending disabling fragile API IP allowlisting for beta.
- [ ] 4.4 Validate the password reset request path against hosted configuration after the table and Brevo settings are correct.

## 5. Validation And Release Checks

- [x] 5.1 Run backend tests/typecheck for seeds, outrights, auth, and password reset affected by this change.
- [x] 5.2 Run frontend typecheck/build and fix any lint or build regressions.
- [ ] 5.3 Manually verify matches, outrights, password reset, header branding, and PT-BR copy in the deployed beta.
- [ ] 5.4 Capture any remaining non-blocking polish issues as follow-up tasks instead of expanding this bugfix change.
