## Context

The current frontend already supports the core launch flows, but its presentation is fragmented, visually flat, and too close to scaffold-level styling. The product needs a stronger identity before deployment, especially across the pages that define first impression and repeat engagement: home, matches, match detail, leagues, and outrights.

This redesign is cross-cutting inside the frontend because the same visual problems repeat across routes and components:
- weak typography hierarchy
- inconsistent spacing and surface treatment
- limited atmosphere or motion
- mobile and desktop layouts that feel utilitarian rather than intentional

Constraints:
- Preserve current backend contracts and user flows.
- Keep the implementation inside the existing Next.js frontend.
- Avoid introducing a heavyweight design system dependency.
- Maintain responsive performance and accessibility while increasing visual ambition.

## Goals / Non-Goals

**Goals:**
- Establish a distinctive World Cup-inspired visual direction with consistent tokens for color, spacing, radius, shadows, and motion.
- Create reusable layout primitives so hero sections, match cards, ranking blocks, and forms feel part of one product.
- Redesign the key launch routes with stronger hierarchy, richer atmosphere, and better mobile/desktop behavior.
- Preserve existing functionality, navigation, and API integrations while improving perceived product quality.
- Support live and locked states with clear visual feedback that feels matchday-oriented rather than generic CRUD UI.

**Non-Goals:**
- Rewriting the app into a different framework or design system.
- Changing backend APIs, data models, or auth behavior.
- Introducing a complex theming engine with runtime personalization.
- Completing every secondary route before the key launch surfaces are upgraded.

## Decisions

### 1. Build a lightweight visual system in the existing Tailwind layer

We will define the redesign through CSS variables in `globals.css` plus a small set of reusable utility compositions and shared presentational components.

Why:
- The project already uses Tailwind and can move quickly without introducing another dependency layer.
- Design consistency matters more here than an enterprise-grade component framework.

Alternatives considered:
- Adopt a UI kit such as shadcn or another component library. Rejected because it would pull the product toward generic patterns and add migration overhead.
- Style every page independently. Rejected because it would repeat the current inconsistency.

### 2. Use a bold matchday atmosphere instead of minimal neutral SaaS styling

The frontend will use a visual direction inspired by stadium light, tournament graphics, national-team energy, and broadcast overlays. This includes layered backgrounds, expressive typography, score-centric modules, and stronger color contrast.

Why:
- The product theme is sports prediction for the World Cup; the UI should emotionally match that use case.
- A bold, thematic direction will make the product feel deliberate instead of unfinished.

Alternatives considered:
- Keep a plain white-and-green utility layout. Rejected because it blends in and reads as placeholder UI.
- Go full novelty/ornamental. Rejected because readability and data scanning still matter more than spectacle.

### 3. Redesign by route family, not by isolated component swaps

Implementation will prioritize coherent screen-level experiences for:
- landing
- matches list
- match detail
- leagues and ranking
- outrights

Shared components will support these routes, but design decisions are made at the page-composition level first.

Why:
- The biggest quality issue is not just button styling; it is the end-to-end feel of each main surface.
- Route-first redesign reduces the chance of polished fragments inside weak page layouts.

Alternatives considered:
- Start from a component library only. Rejected because it can still produce generic compositions.

### 4. Keep interaction logic intact and scope the redesign to presentation plus layout composition

We will not change business rules, form contracts, or backend integrations as part of this redesign, except where markup reshaping requires minor wiring adjustments.

Why:
- The launch readiness work just stabilized the flows and should not be reopened unnecessarily.
- Separating visual redesign from domain logic keeps risk manageable.

Alternatives considered:
- Use the redesign to also refactor data fetching and interaction architecture. Rejected because it broadens the blast radius and slows delivery.

### 5. Represent live, locked, and ranking states with dedicated visual language

Status states such as live score, prediction lock, ranking movement, and outright lock will receive explicit surface treatments using chips, glow, border states, iconography, and emphasis blocks.

Why:
- These states are core to the product value and currently read like plain text.
- Stronger state visuals improve scanability and make the product feel more dynamic during active tournament use.

Alternatives considered:
- Leave states as text labels only. Rejected because they are too easy to miss and weaken the live sports feel.

## Risks / Trade-offs

- [A more expressive UI can drift into visual noise] -> Mitigation: keep information hierarchy and contrast as acceptance criteria for every redesigned screen.
- [Cross-cutting page redesign may create regressions in stabilized flows] -> Mitigation: preserve existing forms and route contracts, and verify key flows after each screen rewrite.
- [Shared tokens may not fit every page on first pass] -> Mitigation: define a small visual system first, then adjust using real screens instead of abstract token tweaking.
- [Themed visuals can become cliché or generic sports branding] -> Mitigation: favor a specific broadcast/stadium-inspired direction and avoid default template aesthetics.
- [Desktop polish can outpace mobile quality] -> Mitigation: treat mobile layouts as first-class in every route task and verify responsive behavior during implementation.

## Migration Plan

1. Define frontend visual tokens, typography choices, background treatments, and reusable surface primitives.
2. Redesign the landing page to establish the new direction.
3. Rebuild the matches list and match detail pages using the new primitives.
4. Rebuild league and outrights surfaces to match the same design language.
5. Normalize supporting components and states such as cards, buttons, forms, live badges, and empty states.
6. Verify responsive behavior and ensure launch smoke flows still pass.

Rollback strategy:
- Because this change is frontend-only, rollback can be done by reverting the application release to the previous frontend build if a visual regression blocks launch.

## Open Questions

- Do we want the primary palette to lean more Brazil/tournament green and gold, or toward a more neutral broadcast-night palette with accents?
- Should the landing page include a stronger narrative hero with tournament copy, or stay more utility-driven and route users immediately into matches?
- Do we want to introduce custom web fonts, or stay within high-quality system-safe choices for launch speed?
