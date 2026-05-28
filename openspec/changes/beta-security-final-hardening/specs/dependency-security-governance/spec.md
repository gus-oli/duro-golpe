## ADDED Requirements

### Requirement: Production dependencies SHALL not ship with untriaged high or critical advisories
The release process SHALL block private-beta deployment when production dependency scanning reports high or critical vulnerabilities that are not fixed or explicitly documented as temporary exceptions.

#### Scenario: Production audit finds a high or critical vulnerability with a fix
- **WHEN** the release security gate runs and reports a fixable high or critical production vulnerability
- **THEN** the gate SHALL fail until the dependency is upgraded or otherwise remediated

#### Scenario: Production audit finds an unfixable advisory
- **WHEN** the release security gate reports a high or critical advisory with no available fix
- **THEN** the advisory SHALL be documented with exploitability analysis, owner, mitigation, and revisit date before deployment proceeds

### Requirement: Security dependency upgrades SHALL preserve product contracts
Dependency upgrades performed for security remediation SHALL preserve the supported auth, match, league, outright, mural, scoring, and provider-ingestion behavior.

#### Scenario: Security upgrade changes runtime dependencies
- **WHEN** production dependencies or the lockfile are upgraded for security remediation
- **THEN** backend tests, frontend build/typecheck, and relevant launch smoke coverage SHALL pass before the change is considered release-ready

### Requirement: JWT and database libraries SHALL remain on patched supported versions
The application SHALL keep JWT verification and database query libraries on patched supported versions because those libraries directly protect authentication and SQL safety.

#### Scenario: JWT package advisory exists
- **WHEN** dependency scanning reports an advisory affecting JWT signing or verification
- **THEN** the release process SHALL prioritize remediation before non-security product work

#### Scenario: ORM SQL injection advisory exists
- **WHEN** dependency scanning reports an advisory affecting SQL escaping, identifier handling, or parameterization in the ORM layer
- **THEN** the release process SHALL prioritize remediation and run SQL injection regression tests before deployment
