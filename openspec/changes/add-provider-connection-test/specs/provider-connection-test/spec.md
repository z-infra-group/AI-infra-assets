# Provider Connection Test Capability Spec

## Purpose

Enable administrators to validate LLM provider configurations before using them in production. Test API connectivity, authentication, and retrieve available model lists to ensure provider settings are correct.

## Requirements

### Requirement: Test provider connection
The system SHALL provide a mechanism to test LLM provider connections via API endpoint.

#### Scenario: Successful connection test
- **WHEN** an authorized user sends a POST request to `/api/test-llm-provider` with a valid providerId
- **THEN** the system SHALL attempt to connect to the provider's API endpoint
- **AND** the system SHALL return a success response with status, responseTime, and modelCount
- **AND** the system SHALL complete the test within 10 seconds

#### Scenario: Connection test with authentication failure
- **WHEN** the provider API returns a 401 or 403 status code
- **THEN** the system SHALL return a failure response
- **AND** the system SHALL include an error message "Authentication failed: Invalid API key or credentials"
- **AND** the system SHALL NOT expose the raw API key in logs or responses

#### Scenario: Connection test timeout
- **WHEN** the provider API does not respond within 10 seconds
- **THEN** the system SHALL abort the connection attempt
- **AND** the system SHALL return a failure response with error "Connection timeout: The server took too long to respond (10s limit)"
- **AND** the system SHALL not wait indefinitely

#### Scenario: Network error during connection test
- **WHEN** the provider API endpoint is unreachable or network error occurs
- **THEN** the system SHALL return a failure response with error "Connection error: Unable to reach the endpoint"
- **AND** the system SHALL provide actionable feedback to the user

#### Scenario: Unauthorized user attempts test
- **WHEN** a user who is not the owner of the provider attempts to test the connection
- **THEN** the system SHALL deny the request with a 403 Forbidden status
- **AND** the system SHALL NOT execute the connection test

### Requirement: Provider-specific test strategies
The system SHALL implement different test strategies based on the provider type.

#### Scenario: Test OpenAI provider
- **WHEN** testing a provider with providerType "openai"
- **THEN** the system SHALL send a GET request to the `/v1/models` endpoint
- **AND** the system SHALL include an `Authorization: Bearer ${apiKey}` header
- **AND** the system SHALL parse the response to count available models

#### Scenario: Test Anthropic provider
- **WHEN** testing a provider with providerType "anthropic"
- **THEN** the system SHALL send a POST request to the `/v1/messages` endpoint with a minimal message payload
- **AND** the system SHALL include an `x-api-key: ${apiKey}` header and anthropic-version header
- **AND** the system SHALL verify successful response

#### Scenario: Test Google provider
- **WHEN** testing a provider with providerType "google"
- **THEN** the system SHALL send a GET request to the `/v1beta/models` endpoint
- **AND** the system SHALL include an `Authorization: Bearer ${apiKey}` header
- **AND** the system SHALL parse the response to count available models

#### Scenario: Test Ollama provider
- **WHEN** testing a provider with providerType "ollama" or custom provider with Ollama-compatible endpoint
- **THEN** the system SHALL send a GET request to the `/api/tags` endpoint
- **AND** the system SHALL NOT include authentication headers (authType may be 'none')
- **AND** the system SHALL parse the response to count available models

#### Scenario: Test LM Studio provider
- **WHEN** testing a provider with providerType "lm-studio" or similar local provider
- **THEN** the system SHALL send a GET request to the `/v1/models` endpoint
- **AND** the system SHALL NOT include authentication headers
- **AND** the system SHALL parse the response to count available models

#### Scenario: Test Azure OpenAI provider
- **WHEN** testing a provider with providerType "azure-openai"
- **THEN** the system SHALL send a GET request to the `/openai/deployments` endpoint
- **AND** the system SHALL include an `api-key: ${apiKey}` header
- **AND** the system SHALL use the configured apiEndpoint and apiVersion

#### Scenario: Test AWS Bedrock provider
- **WHEN** testing a provider with providerType "aws-bedrock"
- **THEN** the system SHALL skip model list retrieval due to complex SigV4 signing
- **AND** the system SHALL perform basic connectivity check only if credentials are present
- **OR** the system SHALL return a message indicating advanced testing is not supported

#### Scenario: Test custom provider
- **WHEN** testing a provider with providerType "custom"
- **THEN** the system SHALL send a GET request to the configured apiEndpoint
- **AND** the system SHALL apply authentication based on authType (api-key, bearer, oauth, none)
- **AND** the system SHALL attempt to parse the response as a model list

### Requirement: Fallback to connection status
When model list retrieval fails, the system SHALL attempt to report basic connection status.

#### Scenario: Successful connection but model list fails
- **WHEN** the provider API returns a successful status but model list parsing fails
- **THEN** the system SHALL report success with connection status "connected"
- **AND** the system SHALL set modelCount to null
- **AND** the system SHALL include responseTime

#### Scenario: Connection established but unauthorized endpoint
- **WHEN** the provider API is reachable but returns 404 for the specific test endpoint
- **THEN** the system SHALL report partial success with message "Endpoint reachable but test path not found"
- **AND** the system SHALL suggest verifying apiEndpoint configuration

### Requirement: Test result response format
The system SHALL return test results in a consistent JSON format.

#### Scenario: Successful test response
- **WHEN** a connection test completes successfully
- **THEN** the system SHALL return JSON with:
  - `success: true`
  - `status: "connected"` or `"authenticated"`
  - `responseTime: number` (milliseconds)
  - `modelCount: number` or null
- **AND** the response SHALL include HTTP 200 status

#### Scenario: Failed test response
- **WHEN** a connection test fails
- **THEN** the system SHALL return JSON with:
  - `success: false`
  - `error: string` (user-friendly error message)
  - `status: "failed"` or `"timeout"` or `"error"`
- **AND** the response SHALL include appropriate HTTP status code

#### Scenario: Response time measurement
- **WHEN** a connection test executes
- **THEN** the system SHALL measure time from request start to response complete
- **AND** the system SHALL return responseTime in milliseconds
- **AND** the system SHALL include this in both success and failure responses

### Requirement: Security and privacy
The system SHALL protect sensitive information during connection testing.

#### Scenario: API key redaction
- **WHEN** logging or returning test results
- **THEN** the system SHALL NOT include the full API key
- **AND** the system SHALL mask API keys as `sk-****...` or similar in logs
- **AND** the system SHALL NOT include API keys in error messages

#### Scenario: Error message sanitization
- **WHEN** returning error messages from provider APIs
- **THEN** the system SHALL sanitize error messages to remove sensitive data
- **AND** the system SHALL translate technical errors to user-friendly messages
- **AND** the system SHALL NOT expose internal implementation details

### Requirement: Rate limiting consideration
The system SHALL consider provider rate limits when executing tests.

#### Scenario: Prevent rapid repeated tests
- **WHEN** a user initiates multiple connection tests in quick succession
- **THEN** the system SHALL allow repeated tests (client should implement debounce)
- **AND** the system SHALL document that tests count against provider API quotas
- **AND** the system SHALL NOT implement server-side rate limiting (trust admin users)

#### Scenario: Test quota awareness
- **WHEN** a connection test is executed
- **THEN** the system SHALL send minimal API requests to avoid consuming quota
- **AND** the system SHALL prefer lightweight endpoints (e.g., /v1/models over inference calls)

### Requirement: Timeout configuration
The system SHALL enforce a timeout on connection tests.

#### Scenario: Default timeout
- **WHEN** a connection test is executed without custom timeout
- **THEN** the system SHALL use a 10-second timeout
- **AND** the system SHALL abort the request if timeout is exceeded

#### Scenario: Configurable timeout
- **WHEN** an environment variable `PROVIDER_TEST_TIMEOUT` is set
- **THEN** the system SHALL use the configured timeout value in seconds
- **AND** the system SHALL fallback to 10 seconds if the variable is invalid or missing
