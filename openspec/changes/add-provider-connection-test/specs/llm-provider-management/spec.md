# LLM Provider Management Capability Spec - Delta

## ADDED Requirements

### Requirement: Test connection button in admin panel
The system SHALL provide a "Test Connection" button in the LLM provider edit view to allow administrators to validate provider configurations.

#### Scenario: Display test button in provider edit view
- **WHEN** an administrator views a provider in the admin panel edit view
- **THEN** the system SHALL display a "Test Connection" button in the sidebar
- **AND** the button SHALL only appear for the llm-providers collection
- **AND** the button SHALL be visible to users with read access to the provider

#### Scenario: Test button shows loading state
- **WHEN** a user clicks the "Test Connection" button
- **THEN** the button SHALL display "Testing..." loading state
- **AND** the button SHALL be disabled during the test
- **AND** the button SHALL re-enable after test completion

#### Scenario: Test button shows success result
- **WHEN** a connection test completes successfully
- **THEN** the system SHALL display a success toast notification
- **AND** the notification SHALL include response time and model count
- **AND** the system SHALL display a success indicator next to the button

#### Scenario: Test button shows error result
- **WHEN** a connection test fails
- **THEN** the system SHALL display an error toast notification
- **AND** the notification SHALL include the error message
- **AND** the system SHALL display an error indicator next to the button

#### Scenario: Non-owner cannot test
- **WHEN** a user who is not the owner views a provider
- **THEN** the "Test Connection" button SHALL be disabled
- **OR** the button SHALL not appear for non-owners
- **AND** the system SHALL prevent unauthorized testing

### Requirement: Integration with provider data
The test connection component SHALL access current provider data from the admin context.

#### Scenario: Access provider ID
- **WHEN** the test connection component renders
- **THEN** the system SHALL access the current provider document ID via useDocumentInfo hook
- **AND** the component SHALL pass the provider ID to the test API endpoint

#### Scenario: Verify collection context
- **WHEN** the test connection component renders
- **THEN** the system SHALL verify the current collection is "llm-providers"
- **AND** the component SHALL not render in other collection contexts

#### Scenario: Access current user
- **WHEN** the test connection component renders
- **THEN** the system SHALL access the current authenticated user via useDocumentInfo hook
- **AND** the component SHALL use this for ownership validation
