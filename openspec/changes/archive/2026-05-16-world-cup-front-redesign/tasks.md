> Historical note: the active frontend direction is now `sports-companion-product-shell`. The remaining verification items here are no longer the canonical path for the product shell redesign.

## 1. Visual Foundation

- [x] 1.1 Define the new World Cup visual direction in frontend tokens, including color variables, background treatments, spacing, radius, shadow, and motion primitives
- [x] 1.2 Replace scaffold-like global styling with a reusable base layer in `globals.css` that supports the redesigned atmosphere without breaking accessibility
- [x] 1.3 Create or refactor shared presentational primitives for hero sections, section headers, cards, chips, buttons, inputs, and empty states
- [x] 1.4 Add consistent visual treatments for live, locked, success, warning, and ranking states across shared components

## 2. Primary Route Redesign

- [x] 2.1 Rebuild the landing page with a strong tournament-themed hero, clearer product story, and better-authored primary actions
- [x] 2.2 Redesign the matches listing page for fast scanability, stronger fixture cards, and responsive matchday layout
- [x] 2.3 Redesign the match detail page so teams, score context, prediction interaction, and lock/live states become the primary focus
- [x] 2.4 Redesign the league experience, including ranking presentation and competitive hierarchy, to feel like a first-class product surface
- [x] 2.5 Redesign the outrights page so market cards, selection states, and lock behavior feel premium and easy to understand

## 3. Responsive and Interaction Polish

- [x] 3.1 Review and adjust the redesigned launch surfaces for mobile-first usability and desktop polish across key breakpoints
- [x] 3.2 Ensure current forms, navigation, and interaction flows still work correctly after layout and markup changes
- [x] 3.3 Add tasteful motion and staged reveals where they improve product feel without reducing readability or performance

## 4. Verification

- [x] 4.1 Run frontend typecheck and fix any regressions introduced by the redesign
- [ ] 4.2 Verify the launch-critical user flows manually on the redesigned screens: landing, browse matches, submit prediction, league join/ranking, and outrights
- [ ] 4.3 Re-run the launch smoke suite and confirm the redesign did not break the stabilized release path
