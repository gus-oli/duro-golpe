# realtime-subscription-hardening Specification

## Purpose
Define the private-beta websocket rules so realtime channels require authentication and enforce scope-aware subscriptions.

## Requirements
### Requirement: Realtime connections SHALL require authenticated access on supported private-beta channels
The system SHALL not expose legacy or compatibility websocket channels that bypass the same authentication expectations as the primary realtime path.

#### Scenario: Client connects without auth to a protected realtime channel
- **WHEN** a client attempts to connect to a protected realtime endpoint without valid authentication
- **THEN** the system SHALL reject or close the connection before subscription begins

### Requirement: Realtime subscriptions SHALL enforce scope-aware authorization
The system SHALL validate whether the current user is allowed to observe the requested league or match channel before subscribing the socket.

#### Scenario: User subscribes to their own league feed
- **WHEN** an authenticated active member subscribes to a league mural feed they belong to
- **THEN** the system SHALL accept the subscription

#### Scenario: User subscribes to another league feed
- **WHEN** an authenticated user attempts to subscribe to a league mural feed outside their allowed scope
- **THEN** the system SHALL deny the subscription or close the socket without streaming those events
