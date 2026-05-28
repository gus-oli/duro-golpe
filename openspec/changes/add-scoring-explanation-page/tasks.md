## 1. Scoring reference content

- [x] 1.1 Create shared frontend scoring-reference data that reflects the active match tiers, outright market values, and 3200-point ceiling.
- [x] 1.2 Add the authenticated `/pontuacao` page with sections for match scoring, specials, theoretical maximum, and league tiebreakers.
- [x] 1.3 Include concise worked examples that differentiate exact score, winner plus goal difference, correct outcome, and one-team-goals cases.

## 2. Product navigation

- [x] 2.1 Add `Pontuacao` as a first-class destination in the authenticated shell with active-route treatment.
- [x] 2.2 Ensure the new scoring page inherits the same authenticated shell framing and mobile-safe navigation behavior as other core routes.

## 3. Contextual entry points

- [x] 3.1 Add a visible path to `/pontuacao` from league scoring surfaces where ranking and tiebreaker questions appear.
- [x] 3.2 Add a visible path to `/pontuacao` from concluded match scoring UI where users review earned points.
- [x] 3.3 Add a visible path to `/pontuacao` from the outrights surface where special-market point values affect standings.

## 4. Verification

- [x] 4.1 Add or update frontend coverage for the new route, shell navigation entry, and contextual links.
- [x] 4.2 Verify the scoring page content matches the current 25/15/10/5/0 tiers, seven-market outright catalog, and 3200-point ceiling.
- [ ] 4.3 Run a frontend smoke check across mobile and desktop for `/pontuacao`, authenticated navigation, and the new contextual entry points.
