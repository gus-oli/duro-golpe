## Why

The current frontend is functionally usable, but it still looks like an internal MVP and weakens confidence at the exact moment we want to move toward public launch. We need a cohesive World Cup-inspired experience that feels energetic, premium, and legible across the core user journey.

## What Changes

- Redesign the visual identity of the frontend around a World Cup matchday atmosphere, with stronger typography, richer backgrounds, and a more intentional color system.
- Rebuild the landing page, matches listing, match detail, league ranking, and outrights pages with consistent layout primitives and clearer information hierarchy.
- Introduce a reusable UI foundation for hero sections, cards, chips, buttons, inputs, empty states, and live-status treatments so the product stops looking screen-by-screen inconsistent.
- Improve mobile and desktop responsiveness for the primary matchday flows without changing backend contracts or core business rules.
- Preserve existing product functionality while upgrading the presentation, readability, and perceived quality of the experience.

## Capabilities

### New Capabilities
- `world-cup-visual-experience`: Defines the visual system, motion language, and thematic styling needed for a premium World Cup-inspired frontend.
- `matchday-product-surfaces`: Defines the layout and interaction standards for the main user-facing pages, including home, matches, match detail, leagues, and outrights.

### Modified Capabilities

## Impact

- Affected code: `frontend/src/app/**`, `frontend/src/components/**`, `frontend/src/hooks/**` where presentation depends on page structure.
- Likely adds or updates shared styling primitives in the frontend and may reshape component composition on key pages.
- No backend API changes are required.
- No database or contract migrations are required.
