## ADDED Requirements

### Requirement: Supported browser auth SHALL store durable session tokens only in HttpOnly cookies
The supported browser authentication flow SHALL keep durable session JWTs out of browser-readable storage and browser-readable auth responses by storing the session in an HttpOnly cookie set by a same-origin server route.

#### Scenario: Browser login succeeds
- **WHEN** a user successfully logs in through the supported browser login route
- **THEN** the browser-visible response body SHALL NOT include the durable session JWT
- **AND** the response SHALL set the session cookie with HttpOnly, SameSite, path, bounded lifetime, and production Secure attributes

#### Scenario: Browser registration succeeds
- **WHEN** a user successfully registers through the supported browser registration route
- **THEN** the browser-visible response body SHALL NOT include the durable session JWT
- **AND** the response SHALL set the session cookie with HttpOnly, SameSite, path, bounded lifetime, and production Secure attributes

#### Scenario: Authenticated client-side code runs after login
- **WHEN** product client-side JavaScript runs in the authenticated browser session
- **THEN** it SHALL NOT read, store, or forward the durable session JWT through localStorage, sessionStorage, document.cookie, or URL query parameters
