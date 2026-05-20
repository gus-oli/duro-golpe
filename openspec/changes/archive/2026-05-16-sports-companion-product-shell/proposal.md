## Why

The frontend currently exposes only a thin slice of the product: login, matches, and match detail. Even though leagues, outrights, ranking, mural, and badges exist in code, the lack of a persistent product shell and the heavy broadcast-style UI make the app feel smaller, more tiring, and less useful than the product we actually built.

## What Changes

- Reorient the frontend visual language away from the current heavy "World Cup spectacle" direction toward a lighter, scan-first sports companion experience inspired by live-score products.
- Introduce an authenticated product shell with persistent navigation and a coherent post-login entry flow so users can reliably reach Partidas, Ligas, Especiais, and account-level surfaces without guessing routes.
- Rework the primary frontend surfaces so Home, Matches, Match Detail, Leagues, and Outrights feel connected instead of isolated, with clearer next steps after major actions such as submitting a prediction.
- Surface league competition, ranking, mural entry points, and badges more explicitly so the social loop becomes visible in the product instead of hidden behind deep routes.
- Supersede the unresolved direction of `world-cup-front-redesign` by replacing its heavier visual assumptions with a lighter football companion system that still preserves sports identity.

## Capabilities

### New Capabilities
- `sports-companion-visual-language`: Defines the lighter, denser, sports-utility visual language for core frontend surfaces.
- `authenticated-product-shell`: Defines persistent post-login navigation, route discoverability, and coherent account-level entry points.
- `connected-matchday-surfaces`: Defines how home, matches, match detail, leagues, outrights, and social follow-up states connect into one usable journey.

### Modified Capabilities

## Impact

- Affected code: `frontend/src/app/**`, `frontend/src/components/**`, `frontend/src/hooks/**`, and shared styling in `frontend/src/app/globals.css`.
- Likely reshapes `layout.tsx`, the landing and post-login experience, navigation primitives, and the page composition for matches, leagues, and outrights.
- No backend API or database contract changes are required.
- May require reconciling or retiring assumptions introduced by the unfinished `world-cup-front-redesign` work.
