## 1. Visual Strategy and Shared Shell Foundation

- [x] 1.1 Audit the current `world-cup-front-redesign` styling assumptions and define the replacement sports-companion token system in shared frontend styling
- [x] 1.2 Build or refactor shared shell primitives for persistent navigation, compact page framing, status chips, and lightweight surface treatments
- [x] 1.3 Resolve the account/profile contract so the new shell does not expose a phantom destination

## 2. Post-Login Entry and Product Navigation

- [x] 2.1 Introduce the authenticated product shell with direct access to Partidas, Ligas, Especiais, and the agreed account destination
- [x] 2.2 Rework the authenticated entry experience so post-login users see actionable routes into matches, leagues, and outrights instead of landing in an isolated flow
- [x] 2.3 Update redirects and route framing so the shell behaves consistently across the primary authenticated surfaces

## 3. Connected Matchday Surface Refresh

- [x] 3.1 Refine the matches list into a denser sports-companion surface with better scanability and clear cross-links into the rest of the product
- [x] 3.2 Rework match detail so the prediction flow remains primary but exposes relevant next steps such as league or mural follow-up
- [x] 3.3 Recompose league and ranking surfaces so competition, badges, and social follow-up feel central inside the new shell
- [x] 3.4 Recompose outrights so market discovery, status, and action states fit the lighter sports-companion system

## 4. Verification and Change Reconciliation

- [x] 4.1 Verify manually that login, post-login entry, matches, prediction submission, league access, and outrights all work coherently inside the new shell
- [x] 4.2 Run frontend validation and smoke checks needed to confirm the navigation and redesign changes did not break the stabilized release path
- [x] 4.3 Reconcile or explicitly supersede the unfinished `world-cup-front-redesign` expectations so the active frontend direction is unambiguous
