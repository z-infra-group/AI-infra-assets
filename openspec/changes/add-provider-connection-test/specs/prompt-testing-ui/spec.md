# Prompt Testing UI Capability Spec

## Purpose

Enable administrators to test prompts directly from the admin panel by sending them to configured LLM providers and viewing the generated responses. This provides immediate feedback on prompt quality and effectiveness without leaving the CMS.

## Requirements

### Requirement: Test prompt via admin UI
The system SHALL provide a mechanism to test prompts via API endpoint from the admin panel.

#### Scenario: Successful prompt test
- **WHEN** an authorized user sends a POST request to `/api/test-prompt` with a valid promptId
- **THEN** the system SHALL retrieve the prompt content and configuration
- **AND** the system SHALL select a model from the prompt's modelScores
- **AND** the system SHALL call the corresponding provider's API
- **AND** the system SHALL return the generated response with metadata (tokens, cost, responseTime)

#### Scenario: Prompt test with provider connection failure
- **WHEN** the selected provider API returns a connection error
- **THEN** the system SHALL return a failure response
- **AND** the system SHALL include an error message indicating the connection issue
- **AND** the system SHALL suggest testing the provider connection first

#### Scenario: Prompt test with API key failure
- **WHEN** the provider API returns a 401 or 403 status code
- **THEN** the system SHALL return a failure response
- **AND** the system SHALL include an error message "Authentication failed: Check provider API key"
- **AND** the system SHALL NOT expose the raw API key

#### Scenario: Prompt test timeout
- **WHEN** the provider API does not respond within 60 seconds
- **THEN** the system SHALL abort the request
- **AND** the system SHALL return a failure response with error "Request timeout: The provider took too long to respond"
- **AND** the timeout duration SHALL be configurable via environment variable

#### Scenario: Unauthorized user attempts test
- **WHEN** a user who is not the owner of the prompt attempts to test it
- **THEN** the system SHALL deny the request with a 403 Forbidden status
- **AND** the system SHALL NOT execute the test

### Requirement: Model selection for testing
The system SHALL select an appropriate model for testing based on the prompt's modelScores.

#### Scenario: Select highest-scored model
- **WHEN** a prompt has multiple modelScores
- **THEN** the system SHALL select the model with the highest score
- **AND** the system SHALL use this model for the test API call

#### Scenario: Prompt with no model scores
- **WHEN** a prompt has no modelScores configured
- **THEN** the system SHALL return a validation error
- **AND** the system SHALL instruct the user to configure at least one model score

#### Scenario: Model not found in providers
- **WHEN** the selected modelId does not match any configured provider
- **THEN** the system SHALL return an error message "Model not found: Please configure the corresponding provider"
- **AND** the system SHALL list available models for configuration

### Requirement: Provider API integration
The system SHALL integrate with configured LLM providers to execute prompt tests.

#### Scenario: Call OpenAI provider
- **WHEN** testing a prompt with an OpenAI model
- **THEN** the system SHALL send a POST request to the `/v1/chat/completions` endpoint
- **AND** the system SHALL include the prompt content in the messages array
- **AND** the system SHALL apply temperature, maxTokens, and other parameters from the prompt
- **AND** the system SHALL parse the response to extract generated text and usage metadata

#### Scenario: Call Anthropic provider
- **WHEN** testing a prompt with an Anthropic model
- **THEN** the system SHALL send a POST request to the `/v1/messages` endpoint
- **AND** the system SHALL format the prompt according to Anthropic's message format
- **AND** the system SHALL include anthropic-version header
- **AND** the system SHALL parse the response to extract generated text and usage metadata

#### Scenario: Call Ollama provider
- **WHEN** testing a prompt with an Ollama model
- **THEN** the system SHALL send a POST request to the `/api/generate` or `/api/chat` endpoint
- **AND** the system SHALL format the prompt according to Ollama's API format
- **AND** the system SHALL handle streaming and non-streaming responses
- **AND** the system SHALL parse the response to extract generated text

#### Scenario: Call other provider types
- **WHEN** testing a prompt with Google, Azure, or other provider types
- **THEN** the system SHALL use the appropriate API format for that provider
- **AND** the system SHALL handle provider-specific request/response formats
- **AND** the system SHALL standardize the output format for consistent UI display

### Requirement: Response metadata tracking
The system SHALL track and return metadata about the prompt test execution.

#### Scenario: Track response time
- **WHEN** a prompt test executes
- **THEN** the system SHALL measure time from request start to response complete
- **AND** the system SHALL return responseTime in milliseconds
- **AND** the system SHALL include this in the test result

#### Scenario: Track token usage
- **WHEN** a provider returns usage metadata (promptTokens, completionTokens)
- **THEN** the system SHALL extract and return this information
- **AND** the system SHALL calculate total tokens used
- **AND** the system SHALL handle providers that don't return usage data

#### Scenario: Estimate cost
- **WHEN** a prompt test completes with token usage data
- **THEN** the system SHALL estimate the cost based on the model's pricing
- **AND** the system SHALL use costPerMillTokens from the model configuration
- **AND** the system SHALL return the estimated cost in USD

#### Scenario: Standardized response format
- **WHEN** a prompt test completes (success or failure)
- **THEN** the system SHALL return a JSON response with:
  - `success: true/false`
  - `generatedText: string` or `error: string`
  - `responseTime: number` (milliseconds)
  - `tokensUsed: object` (promptTokens, completionTokens, totalTokens) or null
  - `estimatedCost: number` (USD) or null
  - `modelUsed: string` (modelId)

### Requirement: Test result display in admin panel
The system SHALL display prompt test results in a user-friendly format.

#### Scenario: Display successful test result
- **WHEN** a prompt test completes successfully
- **THEN** the system SHALL display the generated text in a formatted code block
- **AND** the system SHALL display metadata (response time, tokens used, estimated cost)
- **AND** the system SHALL show which model was used
- **AND** the system SHALL provide a "Copy Response" button

#### Scenario: Display error result
- **WHEN** a prompt test fails
- **THEN** the system SHALL display an error message with actionable guidance
- **AND** the system SHALL suggest common fixes (check provider connection, verify API key, etc.)
- **AND** the system SHALL not expose raw API errors to the user

#### Scenario: Loading state during test
- **WHEN** a prompt test is in progress
- **THEN** the system SHALL display a loading indicator
- **AND** the "Test Prompt" button SHALL be disabled
- **AND** the system SHALL show estimated wait time for context

### Requirement: Security and privacy
The system SHALL protect sensitive information during prompt testing.

#### Scenario: Prompt content redaction
- **WHEN** logging prompt test requests or responses
- **THEN** the system SHALL NOT log the full prompt content in production
- **AND** the system SHALL truncate or hash sensitive content in logs
- **AND** the system SHALL NOT include prompt content in error messages

#### Scenario: API key protection
- **WHEN** calling provider APIs during testing
- **THEN** the system SHALL NOT include API keys in any client-accessible responses
- **AND** the system SHALL make all API calls server-side
- **AND** the system SHALL use secure credential storage

### Requirement: Test button in admin panel
The system SHALL provide a "Test Prompt" button in the prompt edit view.

#### Scenario: Display test button
- **WHEN** an authenticated user views a prompt in the admin panel edit view
- **THEN** the system SHALL display a "Test Prompt" button in the sidebar
- **AND** the button SHALL only appear for the prompts collection
- **AND** the button SHALL be visible to users with read access to the prompt

#### Scenario: Test button for non-owner
- **WHEN** a user who is not the owner views a prompt
- **THEN** the "Test Prompt" button SHALL be disabled
- **OR** the button SHALL not appear for non-owners
- **AND** the system SHALL prevent unauthorized testing

#### Scenario: Button states
- **WHEN** the user interacts with the test button
- **THEN** the button SHALL display appropriate states (idle, loading, success, error)
- **AND** the button SHALL be disabled during testing
- **AND** the button SHALL re-enable after test completion

### Requirement: Configuration and parameters
The system SHALL use prompt configuration when executing tests.

#### Scenario: Apply temperature setting
- **WHEN** a prompt has a temperature value configured
- **THEN** the system SHALL include this temperature in the provider API call
- **AND** the system SHALL use a default of 0.7 if not set

#### Scenario: Apply maxTokens setting
- **WHEN** a prompt has a maxTokens value configured
- **THEN** the system SHALL include this maxTokens in the provider API call
- **AND** the system SHALL use a reasonable default if not set

#### Scenario: Apply extra configuration
- **WHEN** a prompt has extraConfig JSON configured
- **THEN** the system SHALL merge this configuration with the API request
- **AND** the system SHALL validate the configuration is valid JSON
- **AND** the system SHALL handle invalid configuration gracefully

### Requirement: Cost awareness
The system SHALL provide cost information for prompt tests.

#### Scenario: Display cost estimate
- **WHEN** a prompt test completes with token usage
- **THEN** the system SHALL calculate and display the estimated cost
- **AND** the system SHALL warn if the cost exceeds a threshold (e.g., $0.10)
- **AND** the system SHALL help users understand the cost implications

#### Scenario: Free testing for local models
- **WHEN** testing a prompt with a local model (Ollama, LM Studio)
- **THEN** the system SHALL display cost as $0.00
- **AND** the system SHALL indicate this is a local model with no API cost
