# Prompt Management Capability Spec - Delta

## ADDED Requirements

### Requirement: Test prompt button in admin panel
The system SHALL provide a "Test Prompt" button in the prompt edit view to allow administrators to test prompt effectiveness.

#### Scenario: Display test button in prompt edit view
- **WHEN** an authenticated user views a prompt in the admin panel edit view
- **THEN** the system SHALL display a "Test Prompt" button in the sidebar
- **AND** the button SHALL only appear for the prompts collection
- **AND** the button SHALL be visible to users with read access to the prompt

#### Scenario: Test button shows loading state
- **WHEN** a user clicks the "Test Prompt" button
- **THEN** the button SHALL display "Testing..." loading state
- **AND** the button SHALL be disabled during the test
- **AND** the button SHALL re-enable after test completion

#### Scenario: Test button shows success result
- **WHEN** a prompt test completes successfully
- **THEN** the system SHALL display a success toast notification
- **AND** the system SHALL display the generated response in a code block
- **AND** the system SHALL display metadata (response time, tokens used, estimated cost)
- **AND** the system SHALL provide a "Copy Response" button

#### Scenario: Test button shows error result
- **WHEN** a prompt test fails
- **THEN** the system SHALL display an error toast notification
- **AND** the notification SHALL include the error message with actionable guidance
- **AND** the system SHALL suggest common fixes (check provider connection, verify API key, etc.)

#### Scenario: Non-owner cannot test
- **WHEN** a user who is not the owner of the prompt views it
- **THEN** the "Test Prompt" button SHALL be disabled
- **OR** the button SHALL not appear for non-owners
- **AND** the system SHALL prevent unauthorized testing

### Requirement: Integration with prompt data
The test prompt component SHALL access current prompt data from the admin context.

#### Scenario: Access prompt ID
- **WHEN** the test prompt component renders
- **THEN** the system SHALL access the current prompt document ID via useDocumentInfo hook
- **AND** the component SHALL pass the prompt ID to the test API endpoint

#### Scenario: Verify collection context
- **WHEN** the test prompt component renders
- **THEN** the system SHALL verify the current collection is "prompts"
- **AND** the component SHALL not render in other collection contexts

#### Scenario: Access current user
- **WHEN** the test prompt component renders
- **THEN** the system SHALL access the current authenticated user via useDocumentInfo hook
- **AND** the component SHALL use this for ownership validation
