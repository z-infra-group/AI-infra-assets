# LLM Inference Capability Spec

## Purpose

Provide a unified, extensible interface for LLM inference across multiple providers using the Vercel AI SDK. This capability abstracts away provider-specific differences, enabling consistent API calls to OpenAI, Anthropic, Google, and other LLM providers.

## Requirements

### Requirement: Provider abstraction
The system SHALL provide a unified interface for LLM inference across multiple providers.

#### Scenario: Create provider instance from configuration
- **WHEN** the system receives an LLM provider configuration
- **THEN** the system SHALL create an AI SDK provider instance
- **AND** the system SHALL map provider type to the appropriate AI SDK provider
- **AND** the system SHALL configure authentication (API keys, tokens)
- **AND** the system SHALL configure custom endpoints when provided

#### Scenario: Support multiple provider types
- **WHEN** the system initializes providers
- **THEN** the system SHALL support at minimum: OpenAI, Anthropic, Google, Cohere, Azure OpenAI, Ollama
- **AND** the system SHALL support custom OpenAI-compatible endpoints
- **AND** the system SHALL return an error for unsupported provider types

### Requirement: Text generation
The system SHALL generate text responses using configured LLM providers.

#### Scenario: Generate text with default parameters
- **WHEN** the system receives a text generation request
- **THEN** the system SHALL send the prompt to the configured LLM provider
- **AND** the system SHALL return the generated text
- **AND** the system SHALL return usage metadata (token counts)
- **AND** the system SHALL complete within the configured timeout

#### Scenario: Generate text with custom parameters
- **WHEN** a request includes LLM parameters (temperature, maxTokens, topP, etc.)
- **THEN** the system SHALL pass these parameters to the LLM provider
- **AND** the system SHALL use the custom parameters instead of defaults
- **AND** the system SHALL merge additional configuration from extraConfig

#### Scenario: Generate text with streaming (future)
- **WHEN** a request requests streaming responses
- **THEN** the system SHALL stream tokens as they are generated
- **AND** the system SHALL handle streaming errors gracefully
- **AND** the system SHALL provide final usage metadata after stream completion

### Requirement: Error handling
The system SHALL handle LLM provider errors consistently and return meaningful error messages.

#### Scenario: Handle authentication errors
- **WHEN** an LLM provider returns an authentication error (401, 403)
- **THEN** the system SHALL return a clear error message indicating authentication failure
- **AND** the system SHALL suggest testing the provider connection
- **AND** the system SHALL not expose sensitive API keys in error messages

#### Scenario: Handle rate limit errors
- **WHEN** an LLM provider returns a rate limit error (429)
- **THEN** the system SHALL return an error message indicating rate limiting
- **AND** the system MAY include retry-after information if available

#### Scenario: Handle timeout errors
- **WHEN** an LLM provider does not respond within the configured timeout
- **THEN** the system SHALL abort the request
- **AND** the system SHALL return a timeout error message
- **AND** the system SHALL specify the timeout duration

#### Scenario: Handle network errors
- **WHEN** an LLM provider is unreachable (connection refused, DNS failure)
- **THEN** the system SHALL return a connection error message
- **AND** the system SHALL suggest checking the provider endpoint
- **AND** the system SHALL not crash or hang

#### Scenario: Handle validation errors
- **WHEN** an LLM provider returns a validation error (invalid parameters, model not found)
- **THEN** the system SHALL return a clear error message
- **AND** the system SHALL include provider-specific details when available

### Requirement: Usage metadata
The system SHALL return usage metadata for cost tracking and monitoring.

#### Scenario: Return token counts
- **WHEN** text generation completes successfully
- **THEN** the system SHALL return promptTokens (input tokens)
- **AND** the system SHALL return completionTokens (output tokens)
- **AND** the system SHALL return totalTokens (sum of input and output)

#### Scenario: Handle missing usage data
- **WHEN** an LLM provider does not return usage metadata
- **THEN** the system SHALL set usage fields to null
- **AND** the system SHALL still return the generated text
- **AND** the system SHALL log the missing usage data for monitoring

### Requirement: Cost calculation
The system SHALL calculate the cost of LLM inference based on token usage and provider pricing.

#### Scenario: Calculate cost with per-token pricing
- **WHEN** the model has costPerInputToken and costPerOutputToken defined
- **THEN** the system SHALL calculate input cost as (promptTokens * costPerInputToken) / 1,000,000
- **AND** the system SHALL calculate output cost as (completionTokens * costPerOutputToken) / 1,000,000
- **AND** the system SHALL return total cost as input cost + output cost

#### Scenario: Calculate cost with average pricing
- **WHEN** the model has costPerMillTokens defined but not per-token pricing
- **THEN** the system SHALL calculate cost as (totalTokens * costPerMillTokens) / 1,000,000

#### Scenario: Handle missing pricing data
- **WHEN** pricing data is not available
- **THEN** the system SHALL return cost as 0
- **AND** the system SHALL not fail the text generation request

### Requirement: Security
The system SHALL securely handle API credentials and enforce access controls.

#### Scenario: Never log sensitive data
- **WHEN** logging LLM inference operations
- **THEN** the system SHALL NOT log full prompt content (truncate to 100 chars)
- **AND** the system SHALL NOT log API keys or tokens
- **AND** the system SHALL NOT log generated text in production

#### Scenario: Enforce provider ownership
- **WHEN** a user attempts to use a provider for inference
- **THEN** the system SHALL verify the user owns the provider
- **AND** the system SHALL deny requests for providers owned by other users

#### Scenario: Validate provider is enabled
- **WHEN** a user attempts to use a provider
- **THEN** the system SHALL verify the provider is enabled
- **AND** the system SHALL deny requests for disabled providers

### Requirement: Configuration
The system SHALL support dynamic provider configuration without code changes.

#### Scenario: Load provider from database
- **WHEN** initializing a provider for inference
- **THEN** the system SHALL load the provider configuration from LLMProviders collection
- **AND** the system SHALL use the configured API endpoint
- **AND** the system SHALL use the configured authentication type

#### Scenario: Support custom endpoints
- **WHEN** a provider is configured with a custom apiEndpoint
- **THEN** the system SHALL use the custom endpoint instead of the default
- **AND** the system SHALL maintain compatibility with the provider's API format

#### Scenario: Support multiple auth types
- **WHEN** a provider uses different authentication (api-key, bearer-token, oauth)
- **THEN** the system SHALL apply the appropriate authentication method
- **AND** the system SHALL handle auth-specific header requirements

### Requirement: Extensibility
The system SHALL be extensible to support new providers and features.

#### Scenario: Add new provider type
- **WHEN** adding support for a new LLM provider
- **THEN** the system SHALL require only adding a new case in the provider factory
- **AND** the system SHALL not require changes to the inference interface
- **AND** the system SHALL use the same error handling and usage metadata extraction

#### Scenario: Support provider-specific features
- **WHEN** a provider offers unique features (e.g., specific parameters)
- **THEN** the system SHALL allow passing these via extraConfig
- **AND** the system SHALL merge extraConfig with the base request
- **AND** the system SHALL not break if extraConfig is provider-specific

#### Scenario: Future streaming support
- **WHEN** implementing streaming responses in the future
- **THEN** the system SHALL use AI SDK's streaming functions
- **AND** the system SHALL maintain backward compatibility with non-streaming mode
- **AND** the system SHALL require minimal code changes to the test-prompt route
