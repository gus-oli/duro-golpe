## ADDED Requirements

### Requirement: Protected-route redirects SHALL preserve the public request origin behind a reverse proxy
The frontend SHALL construct redirects for protected routes using the public request origin when the application is served behind a reverse proxy that forwards host and protocol information.

#### Scenario: Unauthenticated user visits a protected route through the public host
- **WHEN** an unauthenticated browser requests a protected page such as `/matches` through the hosted public entrypoint
- **THEN** the frontend SHALL redirect the browser to the login page on the same public host instead of redirecting to an internal upstream host such as `localhost`

### Requirement: Redirect logic SHALL remain compatible with direct local access
The frontend SHALL continue to produce valid login redirects when proxy forwarding headers are absent in local or direct-access environments.

#### Scenario: Local development request without forwarded headers
- **WHEN** a developer accesses a protected route directly in a local environment without reverse-proxy forwarding headers
- **THEN** the frontend SHALL still redirect to a valid local login URL rather than failing or producing an invalid origin

### Requirement: Hosted deployment verification SHALL include auth redirect correctness
The hosted deployment validation process SHALL check that protected-route navigation and login redirects stay on the public entrypoint.

#### Scenario: Hosted verification checks a protected route redirect
- **WHEN** operators validate a hosted release behind the reverse proxy
- **THEN** the verification checklist SHALL confirm that navigation to a protected route redirects to the public login URL and not to an internal upstream address
