## Context

The current frontend has two different problems that amplify each other.

First, the information architecture is too shallow. The visible product loop is effectively:

```text
Home -> Login -> Matches -> Match Detail -> Prediction -> dead end
```

Meanwhile, leagues, outrights, ranking, mural, and badges exist but are difficult to discover without manually guessing routes. The app behaves more like a match list than a social World Cup product.

Second, the visual direction now in the codebase leans toward a heavy, broadcast-style "matchday spectacle" with large hero surfaces, layered backgrounds, and strong atmospheric styling. That direction came from `world-cup-front-redesign`, but the lived product use case is closer to a SofaScore/FotMob-style companion: frequent scanning, repeated visits, dense utility, and quick route changes. We are not trying to remove football identity; we are trying to make the product feel lighter, clearer, and more usable all day.

Constraints:
- Preserve current backend contracts, prediction logic, and auth flow stability.
- Keep the implementation inside the existing Next.js frontend and Tailwind/CSS variable stack.
- Avoid introducing a heavyweight design system dependency.
- Improve discoverability and cross-linking without reopening backend domain scope.

## Goals / Non-Goals

**Goals:**
- Establish a lighter sports companion visual system with a neutral base, compact surfaces, stronger scanability, and controlled accent usage.
- Add a persistent authenticated shell so users can always reach Partidas, Ligas, Especiais, and account-related surfaces.
- Turn the post-login experience into a usable hub instead of dropping users into isolated pages.
- Recompose Home, Matches, Match Detail, Leagues, and Outrights so they feel like one connected product.
- Surface competition and social follow-up more clearly through ranking, badges, mural entry points, and post-prediction next steps.

**Non-Goals:**
- Reworking backend APIs, scoring rules, or league data models.
- Building a full enterprise design system or adopting a third-party UI framework.
- Adding entirely new social capabilities beyond better surfacing of what already exists.
- Finishing every secondary route before the main authenticated journey feels coherent.

## Decisions

### 1. Replace the current heavy thematic direction with a lighter sports companion system

We will treat the unfinished `world-cup-front-redesign` direction as superseded for the main authenticated journey. The new visual language will favor neutral backgrounds, compact cards, persistent navigation, and score-first hierarchy over large atmospheric hero sections and layered scenic surfaces.

Why:
- The product is used like a sports companion, not like a one-time landing page experience.
- The current UI feels tiring during repeated use and hides information below large visual blocks.

Alternatives considered:
- Continue polishing the existing broadcast-style direction. Rejected because the philosophy itself is now the mismatch, not just the level of polish.
- Revert fully to plain utility styling. Rejected because we still want football identity and emotional energy, just delivered through semantics and status rather than heavy scenery.

### 2. Make the authenticated shell the primary organizing unit

We will organize the main experience around a persistent shell that exposes the product's real pillars:
- Partidas
- Ligas
- Especiais
- Conta or equivalent account entry point

This shell will be present across authenticated surfaces and will become the user's stable frame of reference.

Why:
- The largest current usability gap is discoverability, not backend capability.
- A persistent shell makes the product feel like a cohesive app instead of a set of standalone pages.

Alternatives considered:
- Keep route-specific CTAs only. Rejected because isolated CTAs do not solve the broader orientation problem.
- Add links only to the landing page. Rejected because discoverability must persist after login, not just before it.

### 3. Treat post-login entry as a product hub, not a redirect side effect

After authentication, the user should land in an experience that answers:
- what can I do now?
- what match is open?
- where is my league?
- are there special predictions still open?

This may be implemented by reshaping the existing home/landing split, the matches entry flow, or a dedicated authenticated dashboard surface, but the contract is the same: post-login must orient and route, not merely drop the user into `/matches`.

Why:
- Right now the product loses momentum immediately after authentication.
- This is the cheapest place to surface leagues and outrights without inventing new features.

Alternatives considered:
- Keep `/matches` as the de facto dashboard. Rejected because it overburdens one screen and still hides the rest of the product.

### 4. Use route composition and cross-linking to reveal existing social value

We will not treat mural, badges, ranking, and outrights as hidden specialist features. Instead, Match Detail, Leagues, and the authenticated hub will cross-link into them deliberately. Post-action states, especially after submitting a prediction, will point users to their next relevant destination.

Why:
- The product already has the building blocks for a social loop; the missing piece is product choreography.
- Surfacing next steps is lower risk than inventing new backend logic.

Alternatives considered:
- Build new social modules first. Rejected because the hidden value should be exposed before new value is added.

### 5. Clean up route promises while building the shell

The current middleware protects `/profile`, but the surface does not exist. This change will resolve that inconsistency by either providing a minimal account destination inside the shell or explicitly removing the promise from the navigation and route guard strategy.

Why:
- A persistent shell cannot contain dead ends or phantom routes.
- This is a product coherence issue, not just a technical cleanup.

Alternatives considered:
- Ignore the inconsistency for now. Rejected because navigation work makes the missing route impossible to hide.

## Risks / Trade-offs

- [The new lighter visual system could erase too much of the football identity] -> Mitigation: keep football semantics in score modules, status chips, competition language, flags, group labels, and league hierarchy.
- [A shell-level rewrite may create regressions in stabilized auth and prediction flows] -> Mitigation: preserve route contracts and forms, then verify login, browse, predict, league, and outright flows explicitly.
- [Combining visual direction and navigation could broaden scope] -> Mitigation: keep the change focused on the authenticated journey and the main launch surfaces, not every route in the app.
- [Superseding `world-cup-front-redesign` can create temporary overlap or confusion] -> Mitigation: make the new proposal explicit that it replaces the earlier visual philosophy and use implementation tasks to reconcile conflicting styles.
- [A denser interface can drift into clutter] -> Mitigation: use scanability, single primary action per screen, and information-above-the-fold as review criteria for every surface.

## Migration Plan

1. Define the new visual tokens and shared shell primitives in the frontend layer.
2. Introduce the persistent authenticated shell and clean up route promises such as account/profile.
3. Rework the post-login entry point so it surfaces core actions and competition context.
4. Update Matches and Match Detail to fit the lighter system and expose next-step navigation.
5. Update Leagues and Outrights to feel like first-class surfaces inside the shell.
6. Verify the end-to-end flows and reconcile leftover assumptions from `world-cup-front-redesign`.

Rollback strategy:
- Because this is a frontend-only change, rollback can be done by restoring the previous frontend build if navigation or layout regressions block beta use.

## Open Questions

- Should the post-login hub replace the current public home for authenticated users, or should the app introduce a separate authenticated dashboard route?
- Should the account destination be a minimal profile/settings page now, or should the shell omit that entry until a fuller account surface exists?
- How much of the current World Cup visual vocabulary should survive as accent language versus being removed entirely?
