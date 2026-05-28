## ADDED Requirements

### Requirement: Private beta sessions SHALL use bounded access-token sessions without refresh tokens
The system SHALL use a bounded access-token session model for the private beta and SHALL NOT issue refresh tokens through the supported browser auth flow.

#### Scenario: User logs in through the supported browser flow
- **WHEN** a user successfully logs in through the supported browser login endpoint
- **THEN** the system SHALL create a bounded access-token session without creating a refresh token cookie, refresh token response field, or refresh endpoint dependency

#### Scenario: Session reaches its configured expiration
- **WHEN** the access-token session is older than the configured beta lifetime
- **THEN** authenticated requests SHALL be rejected and the user SHALL need to log in again

### Requirement: Credential changes SHALL invalidate older sessions
The system SHALL invalidate sessions issued before a user's password credential was changed or reset.

#### Scenario: User changes password from profile
- **WHEN** a user successfully changes their password while logged in
- **THEN** access tokens issued before that credential change SHALL no longer authorize protected requests

#### Scenario: User resets password through recovery flow
- **WHEN** a user successfully resets their password with a valid recovery token
- **THEN** access tokens issued before that reset SHALL no longer authorize protected requests

### Requirement: Password reset tokens SHALL be single-use and time-bound
Password reset tokens SHALL be generated with sufficient randomness, stored only as a server-side hash, expire after the configured TTL, and become unusable after successful password reset.

#### Scenario: Reset token is used successfully
- **WHEN** a valid unexpired reset token is submitted with a new password
- **THEN** the system SHALL update the password, mark that token as used, and reject later attempts to reuse the same token

#### Scenario: Reset token is expired
- **WHEN** a password reset confirmation is submitted after the token's expiration time
- **THEN** the system SHALL reject the reset without changing the user's password

### Requirement: Session verification SHALL fail closed
The system SHALL reject protected requests when the session token is missing, malformed, expired, signed with the wrong secret, or older than the user's current credential/session marker.

#### Scenario: Malformed session cookie is supplied
- **WHEN** a protected request includes a malformed or unverifiable auth cookie
- **THEN** the system SHALL return an unauthorized response without executing protected business logic

#### Scenario: Stale session cookie is supplied after credential change
- **WHEN** a protected request includes a validly signed token whose issued session marker is stale
- **THEN** the system SHALL return an unauthorized response without executing protected business logic
