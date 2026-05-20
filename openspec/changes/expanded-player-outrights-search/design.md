## Context

Player outright markets currently use small static lists in `backend/src/outrights/options-catalog.ts`, and the frontend renders every option as a button in `frontend/src/components/OutrightCard/OutrightCard.tsx`. That was fine for 20 options, but it will not scale to hundreds or thousands of World Cup players.

The app is also entering a risky timing window: some national teams have published final 26-player lists, some have only preliminary lists, and some have not published any list yet. FIFA lists become final after submission on 2 June 2026, so the catalog must support changes without deleting predictions that users already made.

## Goals / Non-Goals

**Goals:**

- Expand player market options beyond the current small curated lists.
- Distinguish official squad, preliminary squad, and likely shortlist options.
- Keep the default UI lightweight by featuring only the top 5 options per market.
- Let users search the full player catalog when their choice is not featured.
- Preserve existing user predictions when a player later disappears from the active catalog.
- Keep this beta-friendly and maintainable without needing a paid sports data provider.

**Non-Goals:**

- Automatically scrape every federation website in real time.
- Build a full player profile database with club, position, age, stats, or photos.
- Resolve player awards/results automatically.
- Add fantasy-game constraints such as one player per country or budget caps.

## Decisions

### Store player option metadata instead of overloading labels

Add metadata for player outright options: source tier, active state, sort/featured order, and optional team/country display text. Labels remain the canonical visible choice, but metadata drives UI behavior.

Alternative considered: encode source and team in the label only, such as `Kylian Mbappe - France - official`. This is faster to seed, but makes search, copy, and stale-state handling brittle.

### Use a non-destructive catalog refresh for player options

Player option refreshes MUST upsert new/changed options and mark removed player options inactive instead of deleting them. Team options can keep stricter replacement semantics, but player options are user-facing historical choices once predictions exist.

Alternative considered: keep deleting options not present in the latest list. This is unsafe because `outright_predictions.option_id` currently cascades on delete, so a catalog refresh could silently erase user predictions.

### Combine official, preliminary, and curated likely sources

The seed/catalog should prefer official FIFA squad articles where available, then preliminary squad articles, then a manually curated likely shortlist for teams without published lists. Each option exposes a source tier so the product never presents a likely pick as official.

Alternative considered: wait until all final squads are published. That would be cleaner but delays beta play and leaves individual markets thin right now.

### Feature five options per player market and search the rest

Each player market should show a curated top 5 by default. The full catalog is discoverable through local search, with selected options pinned so the user always sees what they picked.

Alternative considered: render every player as a button. This would create a heavy, tiring UI and degrade performance on mobile.

### Keep search client-side for beta, but cap rendering

The API can return the catalog for each market, and the frontend can filter locally while only rendering featured options or a capped search result set. This avoids adding a new search endpoint before the product needs it.

Alternative considered: backend search endpoint with pagination. Better at large scale, but unnecessary until the catalog size or traffic makes the payload problematic.

## Risks / Trade-offs

- Catalog source drift -> Keep source tier visible and add a clear update path after 2 June final squad publication.
- Large payloads on `/outrights` -> Start with client filtering and result caps; move to API search if payload size becomes visible in Vercel/Render timings.
- Stale selected player confusion -> Pin selected inactive options and label them as outside the active/final list.
- Manual likely shortlist bias -> Keep likely entries explicitly marked and prioritize official/preliminary sources in sorting.
- Migration risk on existing Neon data -> Add nullable/defaulted metadata columns and backfill current player options as likely/active before expanding.

## Migration Plan

1. Add metadata columns or an equivalent metadata table for player options with safe defaults.
2. Backfill existing player options as active likely options with sort order.
3. Update player catalog seed to upsert and mark missing player options inactive instead of deleting.
4. Expand catalog data from official/preliminary/likely sources.
5. Update `/outrights` response and UI to support featured, searchable, selected, and inactive states.
6. Run seed against Neon after deploy to refresh options without losing predictions.

Rollback is safe if the migration only adds nullable/defaulted metadata. If the UI change is rolled back, existing options remain selectable as plain labels.

## Open Questions

- Should likely shortlist entries include country labels in the visible label from day one, or only in secondary metadata under the name?
- After 2 June, should inactive players be hidden from search unless already selected, or still searchable with an "outside final squad" warning?
