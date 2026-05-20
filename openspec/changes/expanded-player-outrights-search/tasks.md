## 1. Data Model And Contract

- [x] 1.1 Add player option metadata support for source tier, active state, featured/sort order, and optional team/country display text.
- [x] 1.2 Update outright option types/API response mapping so player option metadata is available to the frontend.
- [x] 1.3 Backfill existing player options with safe default metadata during migration.

## 2. Catalog Expansion

- [x] 2.1 Create a structured player catalog module grouped by market and source tier.
- [x] 2.2 Add players from published FIFA official squad articles and preliminary squad articles.
- [x] 2.3 Add curated likely shortlist entries for teams without published squad lists, clearly marked as likely.
- [x] 2.4 Define the top 5 featured players per individual market.

## 3. Safe Seeding And Refresh

- [x] 3.1 Update player option seeding to upsert active options instead of deleting and recreating them.
- [x] 3.2 Mark missing player options inactive on refresh while preserving records referenced by predictions.
- [x] 3.3 Keep team option replacement behavior separate from player option preservation behavior.
- [x] 3.4 Ensure running `npm.cmd run seed` refreshes the expanded catalog without removing existing player predictions.

## 4. Frontend Search UX

- [x] 4.1 Update player outright cards to show only featured options by default.
- [x] 4.2 Add a search field for player markets that filters the full option catalog.
- [x] 4.3 Pin selected player options when they are not part of the featured or current search results.
- [x] 4.4 Display clear labels for preliminary, likely, and inactive/outside-list player options.
- [x] 4.5 Cap rendered search results and show refine-search copy when too many results match.

## 5. Tests And Verification

- [x] 5.1 Add backend tests for player metadata seeding and non-destructive refresh behavior.
- [x] 5.2 Add backend tests proving existing player predictions survive catalog refreshes.
- [x] 5.3 Add frontend tests for featured-only default view, search filtering, selected pinning, and inactive labels.
- [x] 5.4 Run backend typecheck/tests and frontend typecheck/build.
- [x] 5.5 Run the provider-backed seed locally or against beta Neon and verify option counts, featured players, and stale prediction preservation.
