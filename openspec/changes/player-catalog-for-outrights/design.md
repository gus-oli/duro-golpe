## Context

Player-based outright markets currently get their options from `backend/src/outrights/options-catalog.ts`, then `seedOutrightOptions()` writes those labels into `outright_options`. That model worked for a small beta catalog, but it does not scale to "all plausible players" because the same player is repeated across markets, source status is tied to each label, and updates require code edits.

The previous `expanded-player-outrights-search` change already introduced the user-facing shape we want: five featured options, full search, inactive selected options preserved, and source tiers. This change moves the underlying data from static code lists into a persistent player catalog that can be curated, imported, enriched, and resynced safely.

The provider constraint is important: API-Football can help enrich photos and aliases, but the free plan has already blocked 2026 competition access. The catalog therefore cannot depend on API-Football as the source of truth for World Cup 2026 squads.

## Goals / Non-Goals

**Goals:**

- Persist players as first-class data instead of static per-market label arrays.
- Link players to individual outright markets through a candidate table.
- Keep `outright_options` as the stable prediction-facing table so existing predictions keep working.
- Support curated, official, preliminary, provider-enriched, active, and inactive states.
- Allow broader player search without rendering thousands of options by default.
- Use API-Football only for controlled enrichment such as photos, aliases, and provider ids.
- Provide a repeatable operator path to refresh the catalog as squads and pre-lists change.

**Non-Goals:**

- Automatically scrape every federation/FIFA source in real time.
- Depend on paid provider access for the beta.
- Resolve individual award winners automatically.
- Build full player analytics, club stats, fantasy pricing, or eligibility rules beyond market candidacy.
- Replace `outright_predictions` in this change.

## Decisions

### Introduce `players` and `player_market_candidates`

Add a `players` table with canonical player identity: name, normalized name, team/country label, optional team id, provider ids, photo fields, source metadata, active status, and timestamps. Add a `player_market_candidates` table mapping player ids to outright market codes/ids with source tier, confidence, featured flag, sort order, and active status.

Alternative considered: keep expanding `options-catalog.ts`. That keeps implementation cheap today, but every missing player remains a code change and the same player continues to be duplicated across markets.

### Keep `outright_options` as the prediction boundary

The game already stores predictions against `outright_options.option_id`. We should not make user predictions point directly at `players` yet. Instead, a sync step projects active market candidates into `outright_options`, upserting current labels and metadata while marking removed candidates inactive.

Alternative considered: migrate `outright_predictions` to `player_id`. That may be cleaner long term, but it is riskier for the hosted beta and unnecessary while `outright_options` already carries the game contract.

### Use stable player identity plus aliases

Player matching should use `normalized_name`, team/country context, and aliases/provider ids. This avoids creating duplicate rows for accent differences, translated names, or provider variations.

Alternative considered: unique by visible label only. Labels are convenient for UI, but they are a weak identity boundary once we add provider enrichment and cross-market reuse.

### Treat provider data as enrichment

API-Football enrichment should run through backend scripts/jobs. It may populate `apiFootballPlayerId`, photo URL/source, and aliases when lookup succeeds. It must not create final-squad truth by itself for 2026.

Alternative considered: auto-fill players from API-Football search. That risks incomplete or misleading lists on the free plan and can make the product look authoritative when it is only provider-derived.

### Keep market curation explicit

Not every player belongs in every market. `player_market_candidates` decides whether a player is eligible for Artilheiro, Bola de Ouro, Revelacao, or future individual markets. A player can be active in one market and inactive or absent in another.

Alternative considered: every player appears in every individual market. That increases search noise and creates silly choices, especially for markets like Revelacao.

### Sync non-destructively

Refresh/import jobs must not delete player rows or prediction-facing options when a player disappears from current input. They should mark records inactive and keep selected inactive options visible to users who already picked them.

Alternative considered: delete missing rows. That is unsafe because current `outright_predictions.option_id` references can be removed via cascade.

## Risks / Trade-offs

- Provider gaps -> Keep provider-enriched rows clearly distinct from official/preliminary/curated rows.
- Duplicate players -> Use normalized identity plus aliases and team context; add tests around duplicate prevention.
- Bigger `/outrights` payload -> Preserve featured-first rendering and capped search result display; move to backend search later if payload size becomes visible.
- Stale squad status -> Track source tier and active status so the UI can show inactive selected players without erasing predictions.
- Migration complexity -> Add tables and nullable columns first, then backfill from existing `outright_options` before switching seed behavior.

## Migration Plan

1. Add `players`, `player_aliases` or provider id fields, and `player_market_candidates`.
2. Backfill players and market candidates from existing player-type `outright_options`.
3. Add curated import data for obvious contenders across current player markets.
4. Add sync from `player_market_candidates` into `outright_options` using upsert + inactive marking.
5. Update the outright service to read option metadata projected from the player catalog.
6. Update enrichment scripts to populate player rows and then project photo metadata into options.
7. Run migration and sync against Neon before inviting more users to fill individual markets.

Rollback is safest if `outright_options` remains the prediction boundary: disable the new sync and keep existing options. The new player tables can remain unused without breaking current predictions.

## Open Questions

- Should `team_id` be required when a catalog player maps cleanly to a qualified national team, or should `team_label` remain enough until final squads are stable?
- Should provider-enriched players be searchable by default, or only after a curated candidate links them to a market?
- Should the first import include only current qualified teams plus obvious non-qualified superstars, or strictly World Cup-qualified teams?
