## ADDED Requirements

### Requirement: Users SHALL be able to view their editable account profile
The backend SHALL expose an authenticated account profile endpoint and the frontend SHALL render it on the account/profile surface.

#### Scenario: Authenticated user opens account profile
- **WHEN** an authenticated user opens `/profile`
- **THEN** the frontend SHALL show the user's current display name/apelido and e-mail

#### Scenario: API returns current user profile
- **WHEN** an authenticated user requests `GET /me`
- **THEN** the backend SHALL return only that user's editable account fields

#### Scenario: Unauthenticated user requests profile
- **WHEN** an unauthenticated client requests `GET /me`
- **THEN** the backend SHALL deny the request without exposing account data

### Requirement: Users SHALL be able to edit display name and e-mail
The backend SHALL expose an authenticated profile update endpoint for display name/apelido and e-mail, and the frontend SHALL provide forms with clear success and error states.

#### Scenario: User updates display name
- **WHEN** an authenticated user submits a valid new display name/apelido through `PATCH /me`
- **THEN** the backend SHALL persist the change and the frontend SHALL show the updated value

#### Scenario: User updates e-mail
- **WHEN** an authenticated user submits a valid unused e-mail through `PATCH /me`
- **THEN** the backend SHALL persist the new e-mail for login/account identity

#### Scenario: E-mail is already in use
- **WHEN** an authenticated user attempts to update their e-mail to one already used by another account
- **THEN** the backend SHALL return a conflict response and the frontend SHALL show a clear validation error

#### Scenario: Profile payload is invalid
- **WHEN** an authenticated user submits an invalid display name or e-mail
- **THEN** the backend SHALL reject the request with field-level validation information where practical

### Requirement: Users SHALL be able to change password with current-password validation
The backend SHALL expose an authenticated password-change endpoint that requires the current password before storing a new password hash.

#### Scenario: User changes password successfully
- **WHEN** an authenticated user submits the correct current password and a valid new password to `POST /me/password`
- **THEN** the backend SHALL update the stored password hash and the frontend SHALL show a success state

#### Scenario: Current password is wrong
- **WHEN** an authenticated user submits an incorrect current password to `POST /me/password`
- **THEN** the backend SHALL deny the change without revealing sensitive authentication details

#### Scenario: New password is invalid
- **WHEN** an authenticated user submits a new password that fails password policy
- **THEN** the backend SHALL reject the request and the frontend SHALL show a clear validation error

#### Scenario: Password change does not require e-mail/SMS
- **WHEN** an authenticated user changes their password from `/profile`
- **THEN** the flow SHALL complete without depending on external e-mail or SMS delivery
