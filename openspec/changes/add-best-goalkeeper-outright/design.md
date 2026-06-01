## Context

The product already supports team and player outright markets through `outright_markets`, `outright_options`, `outright_predictions`, and `outright_market_results`. Player markets already have source-tier metadata, featured defaults, search, inactive-state preservation, optional photos, and single-selection scoring.

The active catalog currently has seven markets totaling 600 outright points and a 3200-point theoretical ceiling. Adding `Melhor Goleiro` changes the game rules but does not require a new prediction model or database shape.

## Goals / Non-Goals

**Goals:**

- Add an eighth outright market for the official FIFA/adidas Golden Glove winner.
- Keep the market consistent with existing player-market UX and backend contracts.
- Update scoring totals, reference copy, tests, and operational resolution docs.
- Preserve current prediction safety and non-destructive player-option refresh behavior.

**Non-Goals:**

- Build the broader persistent player catalog.
- Add live odds or betting provider integration.
- Automatically resolve the award from FIFA pages or a sports-data provider.
- Add goalkeeper-specific stats, clean-sheet tracking, or eligibility rules beyond curated market options.

## Decisions

### Reuse the existing outright market model

`BEST_GOALKEEPER` should be another `PLAYER` market in the existing catalog. It should use `selectionMin=1`, `selectionMax=1`, `outright_predictions`, and `outright_market_results` just like `TOP_SCORER`, `GOLDEN_BALL`, and `REVELATION`.

Alternative considered: add a goalkeeper-specific table or prediction type. That would add migration and scoring complexity without changing the game behavior.

### Assign 70 points and increase the total ceiling

The new market should be worth 70 points, matching `Revelacao`. This increases outright points from 600 to 670 and the theoretical maximum from 3200 to 3270.

Alternative considered: reduce existing market values to keep 3200. That would avoid changing the ceiling, but it would alter settled product copy and make the new feature more invasive than the user asked for.

### Place the market with individual awards

Display order should put `Melhor Goleiro` near the individual FIFA awards, after `Bola de Ouro` and before `Finalistas`. This keeps the card list easy to scan without changing how team markets behave.

Alternative considered: append it to the end. That is safer for order-sensitive tests, but it hides a first-class official award among team/tiebreaker markets.

### Seed a curated goalkeeper shortlist in the current catalog

For this change, goalkeeper options should live in the existing player option catalog and seed path. Each option should include `teamLabel`, `sourceTier`, `isFeatured`, and sort order. Existing search and selected-option pinning should work without a new UI pattern.

Alternative considered: wait for `player-catalog-for-outrights`. That is the better long-term model, but it is larger than the current ask and would delay the market addition.

### Keep resolution manual and official-source based

The operator should resolve the market with the existing outright resolution command once FIFA confirms the Golden Glove winner. The runbook should name the official award source to use.

Alternative considered: provider-driven auto-resolution. Award endpoints are not already integrated, and incorrect automatic award resolution would be worse than a manual operator step.

## Risks / Trade-offs

- [Current tests expect seven markets] -> Update catalog, scoring, frontend reference, and smoke/unit expectations together.
- [User confusion about the new 3270 ceiling] -> Update `/pontuacao`, score constants, and copy in the same implementation.
- [Goalkeeper shortlist feels incomplete] -> Seed enough obvious contenders and keep search/source labels consistent with other player markets.
- [Official award naming differs in 2026 copy] -> Treat FIFA/adidas Golden Glove or FIFA Golden Glove wording as the authority for this market.
- [Hosted data already seeded] -> Ensure seeding is idempotent and adds the new market without deleting existing predictions.

## Migration Plan

1. Add `BEST_GOALKEEPER` to the market code/catalog constants with 70 points and `PLAYER` option type.
2. Add goalkeeper options to the current player market catalog and seed them through the existing non-destructive player option refresh.
3. Run migrations only if generated metadata requires it; otherwise rely on existing tables.
4. Run the seed command in hosted data after deploy so the market and options appear.
5. Roll back by hiding/removing the catalog entry before users select it; after selections exist, prefer locking or marking options inactive rather than deleting records.

## Open Questions

- Which exact shortlist should be featured in the first five goalkeeper options?
- Should `Melhor Goleiro` remain open until the same outright lock time as other tournament-long player markets?
