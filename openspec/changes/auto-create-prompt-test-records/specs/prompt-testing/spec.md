# Prompt Testing Capability Spec - Delta

## MODIFIED Requirements

### Requirement: Execution status tracking
The system SHALL track the execution status of each test, including automatic creation of test records when tests are executed via the Test Prompt button or API.

#### Scenario: Test status lifecycle
- **WHEN** a test is created manually
- **THEN** the system SHALL set status to "pending"
- **WHEN** a test is queued for execution
- **THEN** the system MAY update status to "running"
- **WHEN** a test completes successfully
- **THEN** the system SHALL set status to "completed"
- **WHEN** a test fails during execution
- **THEN** the system SHALL set status to "failed"

#### Scenario: Automatic test record creation
- **WHEN** a user executes a prompt test via the Test Prompt button or test-prompt API
- **THEN** the system SHALL automatically create a PromptTests record
- **AND** the system SHALL set the initial executionStatus to "completed" (or "failed" if test failed)
- **AND** the system SHALL set executedAt to the current timestamp
- **AND** the system SHALL populate executionTime, tokensUsed, and cost from the test result
- **AND** the system SHALL set the author to the user who executed the test

#### Scenario: Automatic record creation failure handling
- **WHEN** automatic PromptTests record creation fails
- **THEN** the system SHALL log the error
- **AND** the system SHALL NOT prevent the test result from being returned to the user
- **AND** the user SHALL still receive the test output and metadata

## REMOVED Requirements

None (all existing requirements are preserved, this change only adds automatic record creation capability).

## ADDED Requirements

### Requirement: Automatic test record generation
The system SHALL automatically generate PromptTests records when users execute tests, preserving test history without requiring manual record creation.

#### Scenario: Test execution creates persistent record
- **WHEN** an authenticated user executes a prompt test via Test Prompt button
- **THEN** the system SHALL automatically create a PromptTests record
- **AND** the record SHALL include the test input (prompt content), output (generated text), and metadata (timing, cost, tokens)
- **AND** the record SHALL be created before the test result is returned to the user
- **AND** the record SHALL be queryable in the PromptTests collection

#### Scenario: Record title auto-generation
- **WHEN** a test record is automatically created
- **THEN** the system SHALL generate a title in the format "{Prompt Title} - {Model ID} - {Timestamp}"
- **AND** the title SHALL uniquely identify the test execution
- **AND** the title SHALL be human-readable and searchable

#### Scenario: Failed tests also create records
- **WHEN** a prompt test execution fails (timeout, connection error, API error)
- **THEN** the system SHALL create a PromptTests record with executionStatus "failed"
- **AND** the actualOutput field SHALL contain the error message
- **AND** the record SHALL preserve other available metadata (executionTime, attempted model)

#### Scenario: Toggle for automatic record creation
- **WHEN** the ENABLE_AUTO_PROMPT_TEST_RECORD environment variable is set to "false"
- **THEN** the system SHALL NOT automatically create PromptTests records
- **AND** tests SHALL execute normally and return results
- **AND** users can still manually create test records if needed
