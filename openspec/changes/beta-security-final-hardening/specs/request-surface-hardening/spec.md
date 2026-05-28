## ADDED Requirements

### Requirement: Browser proxy mutations SHALL enforce same-origin request validation
The system SHALL reject browser-originated mutating requests to same-origin Next API proxy routes unless the request origin is trusted for the hosted beta environment.

#### Scenario: Same-origin mutation is accepted
- **WHEN** an authenticated browser submits a mutating request from the configured public frontend origin
- **THEN** the proxy route SHALL continue processing the request normally

#### Scenario: Foreign-origin mutation is rejected
- **WHEN** a mutating proxy request includes an `Origin` or `Referer` outside the trusted frontend origins
- **THEN** the proxy route SHALL reject the request before forwarding it to the backend

#### Scenario: Production mutation without browser origin evidence is rejected
- **WHEN** a production mutating proxy request lacks both acceptable `Origin` and acceptable `Referer` evidence
- **THEN** the proxy route SHALL reject the request before applying or forwarding the mutation

### Requirement: High-risk routes SHALL enforce rate limits
The system SHALL throttle public auth-sensitive routes, provider webhook routes, and high-risk authenticated mutations using stable rate-limit buckets.

#### Scenario: Repeated login failures exceed the limit
- **WHEN** a client repeatedly submits login attempts beyond the configured beta threshold
- **THEN** the system SHALL return a 429 response without attempting unlimited password checks

#### Scenario: Password reset request is abused
- **WHEN** a client repeatedly requests password reset e-mails beyond the configured beta threshold
- **THEN** the system SHALL return a 429 response without sending additional reset e-mails for the throttled bucket

#### Scenario: Authenticated mutation burst is throttled
- **WHEN** an authenticated user exceeds the configured mutation rate for actions such as mural posts, batch predictions, profile updates, or league joins
- **THEN** the system SHALL return a 429 response without applying mutations past the threshold

### Requirement: Route params and query inputs SHALL be validated before data access
The system SHALL validate route params and query values with explicit schemas before those values are used in backend service calls or database queries.

#### Scenario: Invalid UUID param is rejected
- **WHEN** a request supplies an invalid UUID for a route parameter that represents a user, match, league, market, option, or post identifier
- **THEN** the system SHALL return a 400 response before executing data access for that route

#### Scenario: Pagination query exceeds the allowed range
- **WHEN** a request supplies page, limit, cursor, or date query values outside the declared bounds
- **THEN** the system SHALL return a 400 response or clamp to the documented safe bound before executing the query

### Requirement: User-controlled redirects SHALL remain same-origin
The system SHALL sanitize user-controlled redirect targets so authentication and logout flows cannot navigate users to attacker-controlled external origins.

#### Scenario: Login receives an external from target
- **WHEN** the login page receives a `from` value pointing to an external origin
- **THEN** successful login SHALL redirect to the safe default application route instead of the external target

#### Scenario: Logout receives an external referer
- **WHEN** logout is requested with an external or malformed `Referer`
- **THEN** logout SHALL clear the auth cookie and redirect only to a safe same-origin route

### Requirement: Hosted browser responses SHALL include security headers
The hosted frontend SHALL emit security response headers that reduce browser exploitation risk without breaking the supported beta UI.

#### Scenario: Hosted page response is served
- **WHEN** the hosted frontend returns an application page
- **THEN** the response SHALL include content sniffing protection, clickjacking protection or frame-ancestors policy, referrer policy, and permissions policy headers

#### Scenario: Production HTTPS response is served
- **WHEN** the hosted frontend runs over production HTTPS
- **THEN** the response SHALL include an HSTS policy compatible with the deployment topology

#### Scenario: Browser loads application scripts and images
- **WHEN** the application page loads its own scripts, styles, fonts, flags, avatars, and player photos
- **THEN** the configured Content Security Policy SHALL allow required product assets while blocking unexpected script execution sources
