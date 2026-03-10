# LLM Provider Model Configuration Capability Spec

## Purpose

Enable LLM providers to have embedded model configurations, supporting the same model (e.g., GPT-4) across multiple providers with different pricing and capabilities. This capability provides a simple, maintainable approach for provider-model relationships while reserving space for future migration to a more flexible middle-table design.

## Requirements

### Requirement: Provider models as embedded array
The system SHALL store model configurations as an embedded array within each provider record, eliminating the need for separate relationship management.

#### Scenario: Add models to provider
- **WHEN** an administrator adds models to a provider's models array
- **THEN** the system SHALL store modelId, displayName, maxTokens, contextLength, and costPerMillTokens for each model
- **AND** the system SHALL support multiple models in the array
- **AND** the system SHALL NOT require a separate LLMModels relationship

#### Scenario: Same model in multiple providers
- **WHEN** administrators create model configurations with the same modelId (e.g., "gpt-4") in different providers
- **THEN** the system SHALL allow each provider to have its own configuration for that model
- **AND** the system SHALL enable different pricing, maxTokens, or contextLength per provider
- **AND** the system SHALL treat each configuration as independent

#### Scenario: Empty models array
- **WHEN** a provider is created without models
- **THEN** the system SHALL allow empty models array
- **AND** the provider SHALL remain valid

#### Scenario: Model configuration fields
- **WHEN** configuring a model in the provider's models array
- **THEN** the system SHALL require modelId and displayName
- **AND** the system SHALL accept optional maxTokens, contextLength, and costPerMillTokens
- **AND** the system SHALL validate all numeric fields are non-negative

### Requirement: Direct API access to provider models
The system SHALL allow direct access to a provider's models without additional queries or relationship joins.

#### Scenario: Get provider models via API
- **WHEN** an authenticated client fetches a provider via REST or GraphQL API
- **THEN** the response SHALL include the models array with all configurations
- **AND** the system SHALL NOT require additional queries to access model data
- **AND** the system SHALL return models in the same format as stored

#### Scenario: Query providers by model
- **WHEN** a user queries providers filtered by modelId
- **THEN** the system SHALL support filtering using the syntax `models.modelId`
- **AND** the system SHALL return providers that have the specified model in their models array

#### Scenario: Prompt testing uses provider models
- **WHEN** a user tests a prompt using the test-prompt endpoint
- **THEN** the system SHALL read model configuration directly from the provider's models array
- **AND** the system SHALL NOT query the LLMModels collection for configuration

### Requirement: Optional LLMModels catalog
The system SHALL maintain an optional LLMModels collection as a catalog/reference, not as a configuration source.

#### Scenario: LLMModels as optional reference
- **WHEN** an administrator creates or updates an LLMModel record
- **THEN** the system SHALL NOT require a provider relationship
- **AND** the system SHALL treat LLMModels as an optional catalog for general model information
- **AND** the system SHALL NOT use LLMModels for runtime configuration

#### Scenario: Model catalog independence
- **WHEN** a provider has models configured
- **THEN** the system SHALL NOT require corresponding LLMModel records
- **AND** the provider's models array SHALL be the authoritative source
- **AND** missing LLMModel catalog entries SHALL NOT affect provider functionality

#### Scenario: Future migration compatibility
- **WHEN** models are stored in provider arrays
- **THEN** the system SHALL use modelId as text-based references
- **AND** this SHALL allow future migration to relationship-based references
- **AND** the system SHALL preserve data for a potential ProviderModelConfig middle table

### Requirement: No bidirectional synchronization
The system SHALL NOT require synchronization between provider models and LLMModels catalog.

#### Scenario: Independent model management
- **WHEN** an administrator updates a provider's models array
- **THEN** the system SHALL NOT require updates to LLMModels collection
- **AND** the system SHALL treat the two data sources as independent

#### Scenario: Catalog changes don't affect providers
- **WHEN** an administrator creates, updates, or deletes LLMModel catalog entries
- **THEN** the system SHALL NOT modify provider records
- **AND** provider functionality SHALL remain unaffected

### Requirement: Data consistency within provider
The system SHALL ensure data consistency within a single provider's models array.

#### Scenario: Unique modelId within provider
- **WHEN** an administrator adds multiple models with the same modelId to a single provider
- **THEN** the system SHALL allow duplicate modelIds
- **AND** the system SHALL treat each as a separate configuration entry
- **AND** this SHALL support versioning or configuration variants

#### Scenario: Model array ordering
- **WHEN** a provider has multiple models in the models array
- **THEN** the system SHALL preserve the administrator-defined order
- **AND** the system SHALL display models in the configured order in the admin panel

### Requirement: Admin panel editing experience
The system SHALL provide an intuitive admin panel interface for editing provider models.

#### Scenario: Inline model array editing
- **WHEN** an administrator edits a provider in the admin panel
- **THEN** the system SHALL display the models array as an inline editable field
- **AND** the system SHALL allow adding, removing, and reordering model configurations
- **AND** each model item SHALL show modelId and displayName

#### Scenario: Model configuration validation
- **WHEN** an administrator saves a provider with invalid model configurations
- **THEN** the system SHALL display validation errors for the specific model fields
- **AND** the system SHALL prevent saving until errors are resolved

#### Scenario: Models tab organization
- **WHEN** viewing a provider's edit screen
- **THEN** the system SHALL organize models in a dedicated "Models" tab
- **AND** the system SHALL group related fields (modelId, displayName, pricing) together
