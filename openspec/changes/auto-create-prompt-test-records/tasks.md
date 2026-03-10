## 1. Core API Implementation

- [x] 1.1 Modify test-prompt route to create PromptTests record
- [x] 1.2 Implement automatic title generation with format "{Prompt Title} - {Model ID} - {Timestamp}"
- [x] 1.3 Map test result fields to PromptTests schema (prompt, author, actualOutput, testConfig, modelUnderTest, executionStatus, executedAt, executionTime, tokensUsed, cost)
- [x] 1.4 Add error handling for record creation failure (log error, don't affect test result)
- [x] 1.5 Implement functionality toggle using ENABLE_AUTO_PROMPT_TEST_RECORD environment variable
- [x] 1.6 Ensure req.payload.create() uses overrideAccess: false for security
- [ ] 1.7 Test successful test creates completed record
- [ ] 1.8 Test failed test creates failed record with error in actualOutput
- [ ] 1.9 Test record creation failure doesn't prevent test result return

## 2. Data Mapping and Validation

- [x] 2.1 Map prompt field from test result (use promptId from request)
- [x] 2.2 Map author field from authenticated user (req.user.id)
- [x] 2.3 Map actualOutput from generatedText in test result
- [x] 2.4 Map testConfig object from LLM parameters (temperature, maxTokens, topP, frequencyPenalty, presencePenalty)
- [x] 2.5 Map modelUnderTest from modelId used in test
- [x] 2.6 Map executionStatus based on test success (completed/failed)
- [x] 2.7 Map executedAt to current timestamp
- [x] 2.8 Map executionTime from responseTime in test result
- [x] 2.9 Map tokensUsed from tokensUsed.totalTokens
- [x] 2.10 Map cost from estimatedCost in test result
- [x] 2.11 Set score, feedback, isVerified to null (manual fields)
- [x] 2.12 Set inputVariables, expectedOutput to null (not used in automated tests)

## 3. Error Handling and Resilience

- [x] 3.1 Wrap record creation in try-catch block
- [x] 3.2 Log record creation errors with sufficient context (promptId, userId, error details)
- [x] 3.3 Ensure test result is still returned even if record creation fails
- [x] 3.4 Add warning in console if estimatedCost exceeds $0.10 threshold
- [ ] 3.5 Handle case where prompt or user is null (should not happen due to prior validation)
- [ ] 3.6 Test error scenarios: database connection failure, validation error, permission denied

## 4. Environment Configuration

- [x] 4.1 Add ENABLE_AUTO_PROMPT_TEST_RECORD environment variable to .env.example
- [x] 4.2 Document environment variable usage in CLAUDE.md or README
- [x] 4.3 Set default value to true (enabled by default)
- [ ] 4.4 Test behavior when variable is not set (should default to enabled)
- [ ] 4.5 Test behavior when variable is set to "false" (should skip record creation)

## 5. Testing and Validation

- [ ] 5.1 Manual test: Execute prompt test via admin "Test Prompt" button
- [ ] 5.2 Verify PromptTests record appears in collection
- [ ] 5.3 Verify record contains all test data (input, output, metadata)
- [ ] 5.4 Verify record title format is correct
- [ ] 5.5 Verify author is set to current user
- [ ] 5.6 Test successful scenario creates "completed" status
- [ ] 5.7 Test failed scenario (invalid API key) creates "failed" status
- [ ] 5.8 Test execution time increase is < 200ms
- [ ] 5.9 Verify manually created records still work
- [ ] 5.10 Test with environment variable disabled (no record created)

## 6. Performance Optimization

- [ ] 6.1 Verify Local API is used (not HTTP requests)
- [ ] 6.2 Measure baseline execution time without record creation
- [ ] 6.3 Measure execution time with record creation
- [ ] 6.4 Ensure additional overhead is < 100ms (target < 200ms)
- [ ] 6.5 Profile database write performance
- [ ] 6.6 Add database indexes if needed for PromptTests queries
- [ ] 6.7 Monitor response times in production

## 7. Documentation

- [x] 7.1 Update CLAUDE.md with automatic test record creation feature
- [x] 7.2 Document environment variable ENABLE_AUTO_PROMPT_TEST_RECORD
- [x] 7.3 Document field mapping from test result to PromptTests schema
- [x] 7.4 Document performance characteristics and expected overhead
- [x] 7.5 Document error handling strategy
- [x] 7.6 Add examples of auto-generated record titles
- [x] 7.7 Document backward compatibility with manual record creation

## 8. Monitoring and Observability

- [ ] 8.1 Add metrics for record creation success rate
- [ ] 8.2 Add metrics for record creation failure rate
- [ ] 8.3 Add metrics for additional latency introduced
- [ ] 8.4 Set up alerting for high failure rates (> 10%)
- [ ] 8.5 Monitor PromptTests collection growth rate
- [ ] 8.6 Create dashboard for test record statistics
- [ ] 8.7 Add logging for debugging record creation issues

## 9. Optional UI Enhancements

- [ ] 9.1 Add "View Record" link to test success toast notification
- [ ] 9.2 Navigate to PromptTests detail page when link clicked
- [ ] 9.3 Add icon or visual indicator for auto-created records
- [ ] 9.4 Add "Test History" section to Prompt detail page
- [ ] 9.5 Display list of recent test records for a prompt
- [ ] 9.6 Add filtering by date, status, model in test history

## 10. Data Management

- [ ] 10.1 Estimate monthly record growth based on usage patterns
- [ ] 10.2 Define data retention policy (optional: archive or delete old records)
- [ ] 10.3 Add archive strategy for records older than 6 months
- [ ] 10.4 Implement cleanup job for archived records
- [ ] 10.5 Monitor database size growth
- [ ] 10.6 Add storage cost estimation

## 11. Rollback and Safety

- [ ] 11.1 Document rollback procedure (set ENABLE_AUTO_PROMPT_TEST_RECORD=false)
- [ ] 11.2 Create script to identify auto-created records (by author and date range)
- [ ] 11.3 Create script to clean up auto-created records if needed
- [ ] 11.4 Test rollback procedure in development environment
- [ ] 11.5 Verify manual record creation is not affected by rollback
