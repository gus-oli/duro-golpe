## ADDED Requirements

### Requirement: League mural SHALL behave like a chat timeline
The league mural SHALL render messages in chronological chat order, with older messages above and the newest messages at the bottom.

#### Scenario: User opens the mural
- **WHEN** the mural feed loads
- **THEN** messages SHALL appear from oldest to newest within the loaded window

#### Scenario: New message arrives while user is at the bottom
- **WHEN** a new mural post is received and the user is already near the bottom of the feed
- **THEN** the feed SHALL append the message at the bottom and keep the latest message visible

#### Scenario: New message arrives while user is reading older posts
- **WHEN** a new mural post is received and the user is not near the bottom of the feed
- **THEN** the feed SHALL avoid forcing scroll and SHALL expose a discreet affordance to jump to new messages

### Requirement: League mural SHALL use adaptive polling without exposing technical timing
The league mural SHALL provide a near realtime experience through adaptive polling while avoiding visible technical labels about polling intervals.

#### Scenario: User is active in the mural
- **WHEN** the browser tab is visible and the user is near the bottom of the mural
- **THEN** the client SHALL poll frequently enough to feel close to realtime without requiring websocket support

#### Scenario: User posts a message
- **WHEN** the user successfully posts a mural message
- **THEN** the client SHALL temporarily increase refresh frequency so replies appear quickly

#### Scenario: Tab is hidden or user is idle
- **WHEN** the browser tab is hidden or the user is no longer engaged with the mural
- **THEN** the client SHALL reduce or pause polling to protect the free backend tier

#### Scenario: Mural renders status chrome
- **WHEN** the mural header or footer is displayed
- **THEN** it SHALL NOT show technical copy such as "polling 15s" or similar interval/debug labels

### Requirement: League mural SHALL avoid duplicate or wasteful feed updates
The mural client SHALL merge fetched posts without duplicates and SHOULD fetch incrementally where the backend provides a cursor, timestamp, or id boundary.

#### Scenario: Poll response includes already-rendered posts
- **WHEN** the client receives posts that are already present in local state
- **THEN** the feed SHALL keep one instance of each post

#### Scenario: Backend supports incremental reads
- **WHEN** the client has a known latest post cursor
- **THEN** subsequent refreshes SHOULD request only posts newer than that cursor
