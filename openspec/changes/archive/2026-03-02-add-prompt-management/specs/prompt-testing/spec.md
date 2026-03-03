# Prompt Testing Capability Spec

## ADDED Requirements

### Requirement: Link test to prompt
The system SHALL allow users to create test cases linked to specific prompts.

#### Scenario: Create test for prompt
- **WHEN** an authenticated user creates a new test
- **THEN** the system SHALL require selection of a prompt
- **AND** the system SHALL assign the current user as the test author
- **AND** the system SHALL establish a relationship from test to prompt

#### Scenario: View tests for prompt
- **WHEN** a user views a prompt in the admin panel
- **THEN** the system SHALL display associated tests
- **AND** the system SHALL allow navigation to test details

### Requirement: Test input and output tracking
The system SHALL store test input variables, expected output, and actual output.

#### Scenario: Define test with input variables
- **WHEN** a user creates a test with inputVariables JSON
- **THEN** the system SHALL validate the JSON is well-formed
- **AND** the system SHALL store the variables for template substitution

#### Scenario: Set expected output
- **WHEN** a user defines expectedOutput for a test
- **THEN** the system SHALL store the expected output as text
- **AND** the system SHALL use it for comparison in test scenarios

#### Scenario: Record actual output
- **WHEN** a user or system records actualOutput for a test
- **THEN** the system SHALL store the actual output
- **AND** only authenticated users SHALL be able to update actualOutput

### Requirement: Test configuration override
The system SHALL allow tests to override prompt-level LLM parameters.

#### Scenario: Override temperature for test
- **WHEN** a user specifies testConfig with temperature
- **THEN** the system SHALL use the test-specific temperature when executing the test
- **AND** the system SHALL NOT modify the parent prompt's configuration

#### Scenario: Test without override
- **WHEN** a test does not specify testConfig
- **THEN** the system SHALL use the parent prompt's LLM parameters

### Requirement: Model under test tracking
The system SHALL record which model was used for each test execution.

#### Scenario: Specify model for test
- **WHEN** a user creates or updates a test
- **THEN** the system SHALL allow specification of modelUnderTest
- **AND** the system SHALL store the model ID as a text field

#### Scenario: Default model from prompt
- **WHEN** a test is created without specifying modelUnderTest
- **THEN** the system MAY leave the field empty or default to the first model in prompt's modelScores

### Requirement: Execution status tracking
The system SHALL track the execution status of each test.

#### Scenario: Test status lifecycle
- **WHEN** a test is created
- **THEN** the system SHALL set status to "pending"
- **WHEN** a test is queued for execution
- **THEN** the system MAY update status to "running"
- **WHEN** a test completes successfully
- **THEN** the system SHALL set status to "completed"
- **WHEN** a test fails during execution
- **THEN** the system SHALL set status to "failed"

### Requirement: Execution metadata tracking
The system SHALL capture and store execution metadata for tests.

#### Scenario: Record execution time
- **WHEN** a test is executed
- **THEN** the system SHALL record executionTime in milliseconds
- **AND** the system SHALL allow manual or automatic entry

#### Scenario: Track token usage
- **WHEN** a test is executed with token tracking available
- **THEN** the system SHALL record tokensUsed
- **AND** the system SHALL store the count as a number

#### Scenario: Track execution cost
- **WHEN** a test is executed with cost tracking available
- **THEN** the system SHALL record cost in USD
- **AND** the system SHALL store the value with decimal precision

#### Scenario: Record execution timestamp
- **WHEN** a test status changes to "completed" or "failed"
- **THEN** the system SHALL automatically set executedAt to current timestamp
- **AND** the system SHALL allow manual override if needed

### Requirement: Test scoring and verification
The system SHALL support test scoring and human verification workflow.

#### Scenario: Score test execution
- **WHEN** a user evaluates a completed test
- **THEN** the system SHALL allow score entry from 0-100
- **AND** the system SHALL store the score for reporting

#### Scenario: Provide test feedback
- **WHEN** a user evaluates a test
- **THEN** the system SHALL allow entry of feedback text
- **AND** the system SHALL store the feedback with the test

#### Scenario: Mark test as verified
- **WHEN** a human reviewer approves a test result
- **THEN** the system SHALL allow setting isVerified to true
- **AND** the system SHALL use this flag for reporting and filtering

### Requirement: Test CRUD operations
The system SHALL support full CRUD operations for tests with proper access control.

#### Scenario: Create test for own prompt
- **WHEN** a user creates a test for a prompt they own
- **THEN** the system SHALL create the test
- **AND** the system SHALL assign the user as test author

#### Scenario: Update own test
- **WHEN** a user updates a test they created
- **THEN** the system SHALL save the changes
- **AND** the system SHALL maintain the prompt relationship

#### Scenario: Delete own test
- **WHEN** a user deletes a test they created
- **THEN** the system SHALL remove the test
- **AND** the system SHALL NOT affect the parent prompt

#### Scenario: Prevent unauthorized test modification
- **WHEN** a user attempts to modify a test created by another user
- **THEN** the system SHALL deny the request
- **AND** the system SHALL return a 403 Forbidden error

### Requirement: Test read access control
The system SHALL enforce read access based on prompt visibility and test ownership.

#### Scenario: Read tests for own prompts
- **WHEN** a user lists tests for prompts they own
- **THEN** the system SHALL return all tests (draft and published)

#### Scenario: Read tests for public prompts
- **WHEN** a user lists tests for published public prompts
- **THEN** the system SHALL return published tests

#### Scenario: Filter tests by status
- **WHEN** a user filters tests by execution status
- **THEN** the system SHALL return matching tests
- **AND** the system SHALL support filtering by: pending, running, completed, failed

### Requirement: Draft and versioning support
The system SHALL support draft status and versioning for tests via Payload's built-in features.

#### Scenario: Save test as draft
- **WHEN** a user creates or updates a test without publishing
- **THEN** the system SHALL save the test as a draft
- **AND** the draft SHALL only be visible to the author

#### Scenario: Publish test
- **WHEN** a user publishes a test
- **THEN** the system SHALL set status to published
- **AND** the test SHALL become visible according to parent prompt's visibility

### Requirement: Test description and title
The system SHALL require tests to have title and description fields.

#### Scenario: Create test with required fields
- **WHEN** a user creates a test
- **THEN** the system SHALL require a title
- **AND** the system SHALL allow an optional description
- **AND** the system SHALL use title as the display name in admin panel

### Requirement: Cascading delete behavior
The system SHALL handle prompt deletion with respect to associated tests.

#### Scenario: Prompt deletion cascades to tests
- **WHEN** a prompt is deleted
- **THEN** the system SHALL cascade delete all associated tests
- **AND** the system SHALL log the deletion for audit purposes
