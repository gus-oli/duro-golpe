## Why

The current launch smoke gate is catching real regressions and false regressions at the same time. Recent redesign work exposed that the command is not fully self-contained and that several assertions depend on incidental text, CSS classes, or markup shape instead of stable user-facing behavior.

## What Changes

- Make `npm run test:launch-smoke` provision and hand off its required runtime context automatically, including the smoke match identifier, instead of relying on manual environment setup beyond the documented backend secrets.
- Replace brittle smoke selectors and assertions with a stable automation contract based on semantic roles, explicit surface markers, or other durable identifiers on launch-critical screens.
- Reframe smoke assertions around launch behavior such as authenticated navigation, prediction persistence, locked-market rejection, match lock propagation, and ranking updates rather than incidental visual composition.
- Document the operational contract of the launch smoke command, including what still must be running externally and what the command resolves for itself.

## Capabilities

### New Capabilities
- `launch-smoke-automation`: Covers deterministic orchestration of the launch smoke command, including seed handoff and operator-facing execution behavior.
- `launch-smoke-selector-contract`: Covers the stable selector and assertion contract used by smoke coverage across the redesigned launch-critical frontend surfaces.

### Modified Capabilities

## Impact

- Affected code: root `package.json`, backend smoke seed helpers, Playwright smoke specs, and frontend launch-critical surfaces that need stable automation anchors.
- Affected docs: launch runbook and any local verification instructions referencing the smoke gate.
- No backend API contract changes are required.
- No database migrations are required.
