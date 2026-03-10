# Prompt Test Auto-Creation Capability Spec

## Purpose

Enable automatic creation of prompt test records in the PromptTests collection when users execute tests via the Prompts admin interface. This eliminates the need for manual record creation and ensures complete test history persistence.

## Requirements

### Requirement: Automatic test record creation
The system SHALL automatically create a PromptTests record when a user executes a prompt test via the Test Prompt button or API endpoint.

#### Scenario: Successful test creates record
- **WHEN** a user executes a prompt test that completes successfully
- **THEN** the system SHALL automatically create a PromptTests record
- **AND** the record SHALL contain all test execution data (input, output, timing, cost)
- **AND** the record SHALL be created before the test result is returned to the user

#### Scenario: Failed test creates failed record
- **WHEN** a user executes a prompt test that fails (connection error, timeout, etc.)
- **THEN** the system SHALL create a PromptTests record with executionStatus "failed"
- **AND** the record SHALL include error information in the actualOutput field
- **AND** the record SHALL include detailed error reason in a new failureReason field
- **AND** the system SHALL still return the test result to the user

### Requirement: Detailed failure reason tracking
The system SHALL record detailed failure reasons to help users understand why tests failed and how to fix them.

#### Scenario: Categorize failure reasons
- **WHEN** a prompt test fails
- **THEN** the system SHALL categorize the failure into one of these types:
  - `connection_error`: Unable to reach the provider API (network issues, DNS failures)
  - `authentication_failed`: Invalid API key, credentials expired, or access denied
  - `rate_limit_exceeded`: Provider rate limit or quota exceeded
  - `timeout`: Provider took too long to respond
  - `model_not_found`: Requested model does not exist in the provider
  - `validation_error`: Invalid parameters or request format
  - `provider_error`: Provider-side error (500, 503, etc.)
  - `unknown`: Unexpected or uncategorized error

#### Scenario: Record failure reason for connection errors
- **WHEN** a test fails due to connection issues
- **THEN** the system SHALL set failureReason to "connection_error"
- **AND** the system SHALL include connection details in actualOutput (e.g., "ECONNREFUSED", "fetch failed")

#### Scenario: Record failure reason for authentication errors
- **WHEN** a test fails with 401 or 403 status
- **THEN** the system SHALL set failureReason to "authentication_failed"
- **AND** the system SHALL include helpful message in actualOutput (e.g., "Check the provider API key")

#### Scenario: Record failure reason for rate limits
- **WHEN** a test fails with 429 status
- **THEN** the system SHALL set failureReason to "rate_limit_exceeded"
- **AND** the system SHALL note the rate limit in actualOutput

#### Scenario: Record failure reason for timeouts
- **WHEN** a test times out
- **THEN** the system SHALL set failureReason to "timeout"
- **AND** the system SHALL include the timeout duration in actualOutput

#### Scenario: Record failure reason for model not found
- **WHEN** a provider reports the model doesn't exist
- **THEN** the system SHALL set failureReason to "model_not_found"
- **AND** the system SHALL include the model ID in actualOutput

#### Scenario: Record failure reason for provider errors
- **WHEN** a provider returns 500 or 503 error
- **THEN** the system SHALL set failureReason to "provider_error"
- **AND** the system SHALL include the HTTP status code in actualOutput

#### Scenario: Unknown failures
- **WHEN** a test fails with an unexpected error
- **THEN** the system SHALL set failureReason to "unknown"
- **AND** the system SHALL include the error message in actualOutput

#### Scenario: failureReason is optional for successful tests
- **WHEN** a test completes successfully
- **THEN** the system MAY set failureReason to null
- **AND** the system SHALL NOT require failureReason for completed tests

#### Scenario: Record creation failure does not affect test result
- **WHEN** the system fails to create a PromptTests record (database error, validation error)
- **THEN** the system SHALL log the error
- **AND** the system SHALL still return the test result to the user
- **AND** the test result SHALL not be affected by the record creation failure

### Requirement: Automatic title generation
The system SHALL automatically generate a descriptive title for each test record using the format "{Prompt Title} - {Model ID} - {Timestamp}".

#### Scenario: Title includes prompt information
- **WHEN** a test record is created for a prompt titled "Claude 3 Opus"
- **THEN** the record title SHALL start with "Claude 3 Opus - "
- **AND** the system SHALL use the prompt's title field

#### Scenario: Title includes model information
- **WHEN** a test is executed using model "claude-3-opus-20240229"
- **THEN** the record title SHALL contain "claude-3-opus-20240229"
- **AND** the model ID SHALL appear after the prompt title

#### Scenario: Title includes timestamp
- **WHEN** a test record is created
- **THEN** the record title SHALL include a timestamp in the format "YYYY-MM-DD HH:MM"
- **AND** the timestamp SHALL reflect when the test was executed
- **AND** the timestamp SHALL ensure title uniqueness

#### Scenario: Complete title format
- **WHEN** a test record is created for prompt "GPT-4 Helper" using model "gpt-4" at 2026-03-10 14:30
- **THEN** the record title SHALL be "GPT-4 Helper - gpt-4 - 2026-03-10 14:30"

### Requirement: Field mapping from test result
The system SHALL map test result data to the appropriate PromptTests collection fields.

#### Scenario: Map prompt and author
- **WHEN** a test record is created
- **THEN** the system SHALL set the prompt field to reference the tested prompt
- **AND** the system SHALL set the author field to the user who executed the test
- **AND** both fields SHALL be required relationships

#### Scenario: Map execution details
- **WHEN** a test completes successfully
- **THEN** the system SHALL set executionStatus to "completed"
- **AND** the system SHALL set executedAt to the test execution timestamp
- **AND** the system SHALL set executionTime to the response time in milliseconds
- **AND** the system SHALL set tokensUsed to the total tokens consumed
- **AND** the system SHALL set cost to the estimated cost in USD

#### Scenario: Map test output
- **WHEN** a test generates text output
- **THEN** the system SHALL set actualOutput to the generated text
- **AND** the system SHALL store the full output (no truncation)
- **AND** the system SHALL support multi-line text output

#### Scenario: Map model information
- **WHEN** a test is executed
- **THEN** the system SHALL set modelUnderTest to the model ID used
- **AND** the system SHALL set testConfig to include LLM parameters (temperature, maxTokens, topP)

#### Scenario: Map test configuration
- **WHEN** a test is executed with specific parameters
- **THEN** the system SHALL store temperature in testConfig.temperature
- **AND** the system SHALL store maxTokens in testConfig.maxTokens
- **AND** the system SHALL store topP in testConfig.topP
- **AND** the system SHALL store other relevant LLM parameters in testConfig

### Requirement: Author ownership assignment
The system SHALL assign the test record author as the user who executed the test.

#### Scenario: Author is current user
- **WHEN** an authenticated user executes a prompt test
- **THEN** the system SHALL set the author field to the current user's ID
- **AND** the system SHALL establish a relationship to the users collection

#### Scenario: Unauthenticated test execution
- **WHEN** an unauthenticated user attempts to execute a prompt test
- **THEN** the system SHALL deny the test execution
- **AND** the system SHALL NOT create a test record
- **AND** the system SHALL return a 401 Unauthorized error

### Requirement: Functionality toggle
The system SHALL support an environment variable to enable or disable automatic test record creation.

#### Scenario: Enabled by default
- **WHEN** the ENABLE_AUTO_PROMPT_TEST_RECORD environment variable is not set
- **THEN** the system SHALL create test records automatically
- **AND** the default behavior SHALL be to create records

#### Scenario: Disabled via environment variable
- **WHEN** ENABLE_AUTO_PROMPT_TEST_RECORD is set to "false"
- **THEN** the system SHALL NOT create test records
- **AND** the test SHALL execute normally and return results
- **AND** the system SHALL skip the record creation step entirely

### Requirement: Backward compatibility
The system SHALL maintain compatibility with manually created PromptTests records.

#### Scenario: Manual records coexist
- **WHEN** a user manually creates a PromptTests record via the admin panel
- **THEN** the system SHALL accept and store the manual record
- **AND** the system SHALL treat manual records the same as auto-created records
- **AND** the system SHALL NOT distinguish between manual and auto-created records in queries

#### Scenario: No schema changes required
- **WHEN** automatic record creation is implemented
- **THEN** the system SHALL use the existing PromptTests collection schema
- **AND** the system SHALL NOT require any schema modifications
- **AND** existing manual records SHALL continue to work unchanged

### Requirement: Performance requirements
The system SHALL create test records with minimal impact on test execution performance.

#### Scenario: Acceptable response time increase
- **WHEN** a test executes with automatic record creation enabled
- **THEN** the total response time SHALL increase by less than 200ms compared to disabled mode
- **AND** the user SHALL perceive the test as completing in near real-time

#### Scenario: Local API usage
- **WHEN** creating a test record
- **THEN** the system SHALL use Payload Local API (req.payload.create)
- **AND** the system SHALL NOT make HTTP requests to create records
- **AND** the system SHALL minimize overhead by using the same request context
