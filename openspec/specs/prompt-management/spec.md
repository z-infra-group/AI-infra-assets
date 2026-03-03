# Prompt Management Capability Spec

## Purpose

Enable users to create, manage, and test LLM prompts within the Payload CMS admin interface. Users can organize prompts with tags, configure model-specific parameters, and control visibility through public/private flags.

## Requirements

### Requirement: Create prompt with user ownership
The system SHALL allow authenticated users to create LLM prompts with automatic user ownership assignment.

#### Scenario: Successful prompt creation
- **WHEN** an authenticated user creates a new prompt
- **THEN** the system SHALL assign the current user as the author
- **AND** the system SHALL set initial status to draft
- **AND** the system SHALL generate a unique slug from the title

### Requirement: Public/private visibility control
The system SHALL allow prompt authors to control prompt visibility via an isPublic flag.

#### Scenario: Create private prompt
- **WHEN** a user creates a prompt with isPublic set to false
- **THEN** the prompt SHALL only be visible to the author
- **AND** the prompt SHALL NOT appear in public listings

#### Scenario: Create public prompt
- **WHEN** a user creates a prompt with isPublic set to true
- **AND** the prompt status is published
- **THEN** the prompt SHALL be visible to all users
- **AND** the prompt SHALL appear in public listings

### Requirement: Prompt CRUD operations
The system SHALL support full CRUD operations for prompts with proper access control.

#### Scenario: Update own prompt
- **WHEN** a user updates a prompt they own
- **THEN** the system SHALL save the changes
- **AND** the system SHALL maintain the author association

#### Scenario: Delete own prompt
- **WHEN** a user deletes a prompt they own
- **THEN** the system SHALL permanently remove the prompt
- **AND** the system SHALL cascade delete associated tests

#### Scenario: Attempt to modify another user's prompt
- **WHEN** a user attempts to update a prompt owned by another user
- **THEN** the system SHALL deny the request
- **AND** the system SHALL return a 403 Forbidden error

### Requirement: Prompt content fields
The system SHALL store prompts with title, description, and content fields.

#### Scenario: Create prompt with all required fields
- **WHEN** a user creates a prompt with title, description, and content
- **THEN** the system SHALL validate all required fields are present
- **AND** the system SHALL store the content as plain text (textarea)

### Requirement: LLM parameter configuration
The system SHALL allow users to configure common LLM parameters as individual fields.

#### Scenario: Configure common parameters
- **WHEN** a user creates or updates a prompt
- **THEN** the system SHALL accept temperature (0-2)
- **AND** the system SHALL accept maxTokens (positive integer)
- **AND** the system SHALL accept topP (0-1)
- **AND** the system SHALL accept frequencyPenalty (-2 to 2)
- **AND** the system SHALL accept presencePenalty (-2 to 2)

#### Scenario: Validate parameter ranges
- **WHEN** a user provides an out-of-range parameter value
- **THEN** the system SHALL reject the submission
- **AND** the system SHALL display validation error

### Requirement: Extensible configuration via JSON
The system SHALL provide an extraConfig JSON field for additional LLM parameters not covered by individual fields.

#### Scenario: Add custom configuration
- **WHEN** a user adds extraConfig JSON (e.g., stop sequences, tools configuration)
- **THEN** the system SHALL validate the JSON is well-formed
- **AND** the system SHALL store the configuration
- **AND** the system SHALL make it available via API

### Requirement: Tag-based organization
The system SHALL allow users to add tags to prompts with automatic "prompt:" prefixing.

#### Scenario: Add tags to prompt
- **WHEN** a user adds tags to a prompt
- **THEN** the system SHALL store the tags
- **AND** the system SHALL support filtering by tags in admin panel

#### Scenario: Tag prefix convention
- **WHEN** displaying or managing tags
- **THEN** the system SHALL indicate tags should use "prompt:" prefix
- **AND** the system SHALL distinguish prompt tags from other collection tags

### Requirement: Draft and versioning support
The system SHALL support draft status and versioning via Payload's built-in features.

#### Scenario: Save prompt as draft
- **WHEN** a user creates or updates a prompt without publishing
- **THEN** the system SHALL save the prompt as a draft
- **AND** the system SHALL auto-save drafts every 100ms
- **AND** the draft SHALL only be visible to the author

#### Scenario: Publish prompt
- **WHEN** a user publishes a draft prompt
- **THEN** the system SHALL set the status to published
- **AND** the system SHALL set publishedAt timestamp if not already set
- **AND** the prompt SHALL become visible according to isPublic flag

#### Scenario: Schedule future publish
- **WHEN** a user schedules a prompt for future publication
- **THEN** the system SHALL automatically publish at the scheduled time
- **AND** the system SHALL set publishedAt to the scheduled time

### Requirement: Read access control
The system SHALL enforce read access based on authentication, publication status, and ownership.

#### Scenario: Authenticated user reads all own prompts
- **WHEN** an authenticated user lists prompts
- **THEN** the system SHALL return all prompts owned by the user (draft and published)
- **AND** the system SHALL return published prompts from other users where isPublic is true

#### Scenario: Unauthenticated user reads public prompts only
- **WHEN** an unauthenticated user lists prompts
- **THEN** the system SHALL return only published prompts where isPublic is true

#### Scenario: Read specific prompt
- **WHEN** a user requests a specific prompt by ID
- **THEN** the system SHALL return the prompt if:
  - User is the author, OR
  - Prompt is published and isPublic is true, OR
  - User is authenticated
- **OTHERWISE** the system SHALL return 404 Not Found

### Requirement: Published date tracking
The system SHALL automatically track publication date when prompts are published.

#### Scenario: Auto-set published date on publish
- **WHEN** a prompt's status changes to published and publishedAt is empty
- **THEN** the system SHALL automatically set publishedAt to current timestamp

#### Scenario: Manual published date
- **WHEN** a user manually sets publishedAt before publishing
- **THEN** the system SHALL preserve the user-provided date
