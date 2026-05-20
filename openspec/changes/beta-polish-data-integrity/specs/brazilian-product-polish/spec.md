## ADDED Requirements

### Requirement: User-facing copy SHALL use natural Brazilian Portuguese
Primary UI, validation, error, empty-state, and transactional copy SHALL use natural Brazilian Portuguese with appropriate accents instead of ASCII-only placeholder text.

#### Scenario: User navigates primary product surfaces
- **WHEN** the user visits login, registration, matches, match detail, outrights, profile, mural, and password reset surfaces
- **THEN** visible labels and messages SHALL avoid obvious unaccented strings such as `Nao`, `Voce`, `Inicio`, `conteudo`, and `pontuacao`

#### Scenario: Backend returns user-facing errors
- **WHEN** authentication, prediction, outright, or password-reset flows return expected user-facing errors
- **THEN** those messages SHALL use consistent PT-BR wording and accents when they are shown directly to the user

### Requirement: Product shell SHALL show a stronger Duro Golpe wordmark
The authenticated app shell SHALL present `Duro Golpe` as a recognizable wordmark or compact logo treatment instead of a weak plain text label.

#### Scenario: User sees the authenticated header
- **WHEN** a logged-in user opens the product on desktop or mobile
- **THEN** the header SHALL show a visually distinctive `Duro Golpe` brand treatment that remains readable and compact

#### Scenario: User navigates frequently
- **WHEN** the user moves between matches, outrights, profile, and league surfaces
- **THEN** the wordmark SHALL remain consistent with the lightweight sports companion visual language and SHALL NOT add heavy decorative noise
