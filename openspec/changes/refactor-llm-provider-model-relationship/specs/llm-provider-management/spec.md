# LLM Provider Management Capability Spec - Delta

## MODIFIED Requirements

### Requirement: Provider identification fields
The system SHALL store provider identification information including displayName, providerType, and icon. The slug field has been removed as admin-only collections do not require URL-friendly identifiers.

#### Scenario: Create provider with required identification
- **WHEN** an administrator creates a provider
- **THEN** the system SHALL require displayName and providerType
- **AND** the system SHALL NOT auto-generate slug (slug field removed)
- **AND** the system SHALL accept an optional icon URL

### Requirement: Model list as embedded array
The system SHALL allow providers to have a list of models with complete model configuration stored in an embedded array field. This replaces the previous relationship-based approach.

#### Scenario: Add models to provider
- **WHEN** an administrator adds models to a provider's models array
- **THEN** the system SHALL store modelId, displayName, maxTokens, contextLength, and costPerMillTokens for each model
- **AND** the system SHALL support multiple models in the array
- **AND** the system SHALL NOT create relationship references to LLMModels collection

#### Scenario: Empty models array
- **WHEN** a provider is created without models
- **THEN** the system SHALL allow empty models array
- **AND** the provider SHALL remain valid

#### Scenario: Same model in multiple providers
- **WHEN** multiple providers have configurations for the same modelId
- **THEN** the system SHALL allow each provider to have independent configurations
- **AND** the system SHALL NOT require unique modelIds across providers
- **AND** this SHALL enable the same model (e.g., "gpt-4") to exist in OpenAI, Azure, and custom providers

### Requirement: API access to providers
The system SHALL expose provider data via REST and GraphQL APIs with models included as embedded data.

#### Scenario: REST API returns providers
- **WHEN** an authenticated client fetches providers via REST API
- **THEN** the response SHALL include all provider fields except apiKey
- **AND** the response SHALL include models as an array of configurations (not relationship IDs)
- **AND** the system SHALL NOT require separate queries to access model data

#### Scenario: GraphQL API returns providers
- **WHEN** an authenticated client queries providers via GraphQL
- **THEN** the system SHALL include providers in the schema
- **AND** the client SHALL be able to query specific fields including models array

### Requirement: Admin panel display
The system SHALL display provider information in the admin panel with models as an inline editable array.

#### Scenario: Display provider details
- **WHEN** an administrator views a specific provider
- **THEN** the system SHALL display all configuration fields
- **AND** the system SHALL organize fields in tabs (Basic Info, API Config, Models, Limits)

#### Scenario: Display models array
- **WHEN** viewing a provider's models tab
- **THEN** the system SHALL display the models as an inline editable array
- **AND** each item SHALL show modelId, displayName, maxTokens, contextLength, and costPerMillTokens
- **AND** the system SHALL allow adding, editing, and removing model configurations

### Requirement: SEO integration (REMOVED)
**Reason**: Admin-only collections do not require SEO fields as they are not publicly accessible. SEO fields have been removed to maintain consistency with other admin-only collections like LLMModels.

**Migration**: Any existing SEO field data will be lost when migrating to this schema. SEO metadata is not needed for internal admin collections.

## REMOVED Requirements

### Requirement: Unique slug enforcement
**Reason**: Admin-only collections do not require URL-friendly identifiers. The displayName serves as the primary identifier in the admin panel.

**Migration**: Any existing slug values will be removed from the database. Use displayName for identification in the admin UI.
