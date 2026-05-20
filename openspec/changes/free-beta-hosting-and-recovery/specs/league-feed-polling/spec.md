## ADDED Requirements

### Requirement: League mural SHALL support adaptive polling while visible
The league mural SHALL refresh through polling when the league page is visible, SHALL pause active polling when the page is hidden, and SHALL refetch immediately when the page regains focus.

#### Scenario: Visible league feed polls for fresh posts
- **WHEN** an authenticated user keeps a league page visible
- **THEN** the feed SHALL periodically request fresh mural posts without requiring a full page reload

#### Scenario: Hidden league feed pauses active polling
- **WHEN** the user changes tabs or otherwise hides the league page
- **THEN** the mural polling loop SHALL pause until visibility returns

#### Scenario: Focus resumes freshness
- **WHEN** the user returns focus to the league page
- **THEN** the feed SHALL request fresh mural posts immediately

### Requirement: League mural SHALL merge polled posts without flicker
The feed SHALL merge newly fetched posts into the current client state by post identity, avoiding duplicate entries and avoiding a full-list redraw that disrupts reading.

#### Scenario: Poll returns previously seen and new posts
- **WHEN** a polling response includes a mix of existing and new mural posts
- **THEN** the client SHALL deduplicate by post identity and preserve the existing reading context while inserting the unseen posts

### Requirement: League mural SHALL preserve optimistic local posting
When a user submits a mural message, the feed SHALL show that post immediately in the client view and reconcile it safely with later polling responses.

#### Scenario: User posts before the next poll cycle
- **WHEN** an authenticated user successfully submits a mural post
- **THEN** the new post SHALL appear in the feed immediately and later polling responses SHALL NOT create a duplicate entry for the same post
