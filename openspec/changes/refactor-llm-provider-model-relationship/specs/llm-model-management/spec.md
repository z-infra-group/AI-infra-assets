# LLM Model Management Capability Spec - Delta

## MODIFIED Requirements

### Requirement: Create model with optional provider relationship
The system SHALL allow administrators to create model records with an optional provider relationship. LLMModels now serves as an optional catalog/reference rather than a required configuration source.

#### Scenario: Create model for catalog
- **WHEN** an administrator creates a new model
- **THEN** the system SHALL require modelId and displayName
- **AND** the system SHALL allow optional provider relationship
- **AND** the system SHALL NOT auto-generate slug (slug field removed)
- **AND** the system SHALL treat the model as a catalog entry, not configuration

#### Scenario: Provider is optional
- **WHEN** an administrator creates a model without selecting a provider
- **THEN** the system SHALL accept the submission
- **AND** the model SHALL remain valid
- **AND** the system SHALL treat the model as a general catalog entry

#### Scenario: Link model to provider for reference
- **WHEN** an administrator creates a model with a provider relationship
- **THEN** the system SHALL store the provider reference
- **AND** the system SHALL indicate this is for catalog purposes only
- **AND** the system SHALL NOT use this relationship for runtime configuration

### Requirement: Model identification fields
The system SHALL store model identification information including modelId, displayName, and description. The slug field has been removed.

#### Scenario: Create model with required identification
- **WHEN** an administrator creates a model
- **THEN** the system SHALL require modelId and displayName
- **AND** the system SHALL NOT auto-generate slug (slug field removed)
- **AND** the system SHALL accept an optional description

### Requirement: Provider relationship (optional)
The system SHALL maintain an optional relationship between models and providers for catalog purposes only.

#### Scenario: Link model to provider (optional)
- **WHEN** a model is created with a provider relationship
- **THEN** the system SHALL store the provider reference
- **AND** the system SHALL validate the provider exists
- **AND** the system SHALL indicate this is a catalog reference, not a configuration dependency

#### Scenario: Query models by provider
- **WHEN** a user queries models filtered by provider
- **THEN** the system SHALL return models linked to that provider
- **AND** the system SHALL support this filtering via REST and GraphQL
- **AND** the system SHALL return only catalog entries, not runtime configurations

#### Scenario: Provider deletion handles models
- **WHEN** a provider is deleted
- **THEN** the system SHALL NOT cascade delete related catalog models
- **AND** models SHALL remain with a null provider reference
- **AND** this SHALL NOT affect provider functionality (configurations are in provider.models)

### Requirement: Admin panel display
The system SHALL display model catalog information in the admin panel with appropriate formatting.

#### Scenario: Display models in list
- **WHEN** an administrator views the models collection
- **THEN** the system SHALL display model displayName, modelId
- **AND** the system SHALL show supportsStreaming and supportsFunctionCalling as badges
- **AND** the system SHALL indicate provider as optional (with visual indicator for null)

#### Scenario: Display model details
- **WHEN** an administrator views a specific model
- **THEN** the system SHALL display all model fields
- **AND** the system SHALL organize fields in tabs (Basic Info, Capabilities, Pricing, Metadata)
- **AND** the system SHALL show provider as optional field (not required)

#### Scenario: Show provider in model details
- **WHEN** viewing a model with a provider relationship
- **THEN** the system SHALL display the linked provider
- **AND** the system SHALL allow navigation to the provider
- **AND** the system SHALL indicate this is a catalog reference

### Requirement: API access to models
The system SHALL expose model catalog data via REST and GraphQL APIs.

#### Scenario: REST API returns models
- **WHEN** an authenticated client fetches models via REST API
- **THEN** the response SHALL include all model fields
- **AND** the response SHALL include provider information if populated
- **AND** the response SHALL indicate this is catalog data, not configuration

#### Scenario: GraphQL API returns models
- **WHEN** an authenticated client queries models via GraphQL
- **THEN** the system SHALL include models in the schema
- **AND** the client SHALL be able to query specific fields including provider (optional)

### Requirement: SEO integration (REMOVED)
**Reason**: Admin-only collections do not require SEO fields as they are not publicly accessible. SEO fields have been removed to maintain consistency with other admin-only collections like LLMProviders.

**Migration**: Any existing SEO field data will be lost when migrating to this schema. SEO metadata is not needed for internal admin collections.

## REMOVED Requirements

### Requirement: Unique slug enforcement
**Reason**: Admin-only collections do not require URL-friendly identifiers. The modelId serves as the primary identifier for catalog lookups.

**Migration**: Any existing slug values will be removed from the database. Use modelId and displayName for identification in the admin UI.

### Requirement: Provider is required (MODIFIED)
**Reason**: LLMModels is now an optional catalog, not a required configuration source. Providers store their own model configurations in an embedded array.

**Migration**: Existing models with provider relationships will remain valid, but provider is now optional for new models.
