## ADDED Requirements

### Requirement: Email/password auth SHALL support password reset requests
The system SHALL allow a user to request a password reset link by providing an email address, and SHALL respond with a non-enumerating success message regardless of whether the account exists.

#### Scenario: Known account requests a reset
- **WHEN** a user submits the email address of an existing account
- **THEN** the system SHALL create a short-lived reset token, queue a reset email, and return a generic success response

#### Scenario: Unknown account requests a reset
- **WHEN** a user submits an email address that does not belong to an account
- **THEN** the system SHALL return the same generic success response without revealing whether the account exists

### Requirement: Password reset emails SHALL be delivered through Brevo
The system SHALL support Brevo as the transactional email provider for password reset delivery in the zero-cost beta environment.

#### Scenario: Reset email is sent through Brevo
- **WHEN** the password reset flow is configured with valid Brevo credentials and sender settings
- **THEN** the system SHALL deliver the password reset email through Brevo

### Requirement: Password reset tokens SHALL be single-use and short-lived
The system SHALL treat password reset tokens as single-use secrets with a bounded expiration window, and SHALL reject reuse or expired tokens.

#### Scenario: User opens a valid reset link
- **WHEN** a user submits a valid unexpired password reset token with a new password
- **THEN** the system SHALL update the stored password and invalidate the reset token

#### Scenario: User reuses or opens an expired token
- **WHEN** a user submits a used or expired password reset token
- **THEN** the system SHALL reject the reset attempt and require a new reset request

### Requirement: Private beta auth SHALL use email/password only
The supported private beta auth surface SHALL rely on email/password login and password reset, and SHALL not expose Google OAuth as a supported entrypoint for this phase.

#### Scenario: User visits login during the zero-cost beta phase
- **WHEN** the login experience is rendered for the supported hosted beta deployment
- **THEN** the product SHALL present email/password authentication without offering Google login as a supported path
