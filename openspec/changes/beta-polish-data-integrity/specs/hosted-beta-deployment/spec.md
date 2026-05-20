## MODIFIED Requirements

### Requirement: Hosted beta environment SHALL provide a documented bootstrap and verification flow
The system SHALL document how operators provision a fresh hosted beta environment, run migrations, choose the correct seed mode, configure password reset infrastructure, and verify that the public application is functioning.

#### Scenario: Fresh hosted beta environment is bootstrapped
- **WHEN** an operator follows the documented hosted beta bootstrap procedure
- **THEN** the operator SHALL be able to configure the environment, apply migrations, load the selected seed dataset, and reach the public application without undocumented manual steps

#### Scenario: Password reset storage is verified before release
- **WHEN** the hosted beta environment enables password reset
- **THEN** the documented flow SHALL verify that the `password_reset_tokens` table and indexes exist before asking users to request reset links

#### Scenario: Brevo is configured for Render free runtime
- **WHEN** the backend sends password reset email through Brevo from Render free
- **THEN** the documented flow SHALL cover Brevo API key placement and the operational risk of IP allowlisting, including the recommendation to disable fragile API IP allowlisting or maintain Render IP updates manually
