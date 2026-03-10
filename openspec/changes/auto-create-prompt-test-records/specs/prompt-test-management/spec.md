# Prompt Test Management Capability Spec - Delta

## MODIFIED Requirements

### Requirement: Create test record
The system SHALL allow authenticated users to create test records, including automatic creation via prompt testing API and manual creation via admin interface.

#### Scenario: Manual test creation
- **WHEN** an authenticated user manually creates a test record via admin panel
- **THEN** the system SHALL accept the test record data
- **AND** the system SHALL require prompt and author relationships
- **AND** the system SHALL set initial executionStatus to "pending"

#### Scenario: Automatic test creation via API
- **WHEN** a user executes a prompt test via the test-prompt API endpoint
- **THEN** the system SHALL automatically create a test record
- **AND** the system SHALL populate all available fields from the test result
- **AND** the system SHALL set the author to the authenticated user
- **AND** the system SHALL set executionStatus based on test outcome (completed or failed)

### Requirement: Test record fields support both manual and automatic creation
The system SHALL support the same field structure for manually created and automatically created test records.

#### Scenario: Field mapping for automatic creation
- **WHEN** a test record is automatically created from test execution
- **THEN** the system SHALL map prompt to the tested prompt's ID
- **AND** the system SHALL map author to the executing user's ID
- **AND** the system SHALL map modelUnderTest to the model ID used
- **AND** the system SHALL map actualOutput to the generated text
- **AND** the system SHALL map testConfig to the LLM parameters used
- **AND** the system SHALL map executionStatus, executedAt, executionTime, tokensUsed, and cost from the test result

#### Scenario: Auto-generated title for automatic creation
- **WHEN** a test record is automatically created
- **THEN** the system SHALL generate a title in the format "{Prompt Title} - {Model ID} - {Timestamp}"
- **AND** the title SHALL not require user input
- **AND** manually created records MAY use custom titles

#### Scenario: Required fields validation
- **WHEN** a test record is created (manually or automatically)
- **THEN** the system SHALL require prompt and author relationships
- **AND** the system SHALL validate these relationships exist
- **AND** the system SHALL reject creation if validation fails

### Requirement: List and filter test records
The system SHALL allow users to list and filter test records, with support for distinguishing automatic and manual records if needed.

#### Scenario: List all test records for a prompt
- **WHEN** a user queries test records filtered by prompt
- **THEN** the system SHALL return both manually created and automatically created records
- **AND** the system SHALL not distinguish between creation methods in the default list view

#### Scenario: Filter by execution status
- **WHEN** a user filters test records by executionStatus
- **THEN** the system SHALL return records matching the specified status
- **AND** the system SHALL support filtering by "completed", "failed", "pending", or "running"

#### Scenario: Filter by author
- **WHEN** a user filters test records by author
- **THEN** the system SHALL return records created by the specified user
- **AND** this SHALL include both manual and automatically created records

### Requirement: Update test record
The system SHALL allow users to update test records, with appropriate access control.

#### Scenario: Author can update own records
- **WHEN** a user updates a test record they created (manual or automatic)
- **THEN** the system SHALL save the changes
- **AND** the system SHALL preserve the original author

#### Scenario: Update metadata fields
- **WHEN** a user updates metadata fields (score, feedback, isVerified)
- **THEN** the system SHALL accept the updates
- **AND** the system SHALL allow these updates for both manual and automatic records

## ADDED Requirements

### Requirement: API-triggered test record creation
The system SHALL support creating test records programmatically via the prompt testing API, extending beyond manual admin panel creation.

#### Scenario: API creates record with full context
- **WHEN** the test-prompt API endpoint executes a test
- **THEN** the system SHALL create a PromptTests record via Local API
- **AND** the system SHALL pass the request context (req) to maintain authentication
- **AND** the system SHALL use overrideAccess: false to enforce access control
- **AND** the record SHALL be created in the same transaction context as the test execution

#### Scenario: Error isolation
- **WHEN** test record creation fails after test execution succeeds
- **THEN** the system SHALL log the creation error
- **AND** the system SHALL still return the successful test result to the user
- **AND** the test execution SHALL not be rolled back due to record creation failure

#### Scenario: Performance requirement
- **WHEN** automatic record creation is enabled
- **THEN** the additional latency SHALL be less than 200ms compared to disabled mode
- **AND** the system SHALL use Local API (not HTTP) to minimize overhead
- **AND** the user experience SHALL remain responsive
