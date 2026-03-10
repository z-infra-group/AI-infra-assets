# Prompt Testing Capability - Delta: Vercel AI SDK Integration

## Change Summary

**Breaking Change**: No (API and user-visible behavior remain identical)

This delta describes changes to the implementation of prompt testing while maintaining 100% backward compatibility with the existing specification. The change replaces direct HTTP requests with Vercel AI SDK calls, but all user-visible behavior remains unchanged.

## Modified Requirements

### Requirement: Test execution implementation (INTERNAL)
**Status**: Modified (implementation detail only, user behavior unchanged)

The underlying implementation of test execution changes from direct HTTP requests to Vercel AI SDK, but all user-visible behavior remains identical.

#### Changes:
- **Removed**: Direct `fetch` calls to provider APIs (testWithOpenAI, testWithAnthropic, etc.)
- **Added**: Vercel AI SDK `generateText()` API
- **Modified**: Provider selection logic (now uses AI SDK provider factory)
- **Preserved**: All authentication, authorization, error handling, response format

#### Scenario: Execute prompt test with OpenAI (IMPLEMENTATION CHANGE)
- **BEFORE**: System used `fetch` to call OpenAI API directly
- **AFTER**: System uses `generateText({ model: openai('gpt-4'), prompt })`
- **UNCHANGED**: User sees the same test result, token counts, and cost calculation

#### Scenario: Execute prompt test with Anthropic (IMPLEMENTATION CHANGE)
- **BEFORE**: System used `fetch` to call Anthropic Messages API directly
- **AFTER**: System uses `generateText({ model: anthropic('claude-3'), prompt })`
- **UNCHANGED**: Test execution behavior from user perspective

### Requirement: Error handling (INTERNAL)
**Status**: Modified (implementation detail only, error messages preserved)

The implementation of error handling changes to use AI SDK's error types, but error messages returned to users remain identical.

#### Changes:
- **Added**: Mapping from AI SDK errors to existing error response format
- **Preserved**: All error message text, HTTP status codes, and error scenarios

#### Scenario: Handle authentication failure (IMPLEMENTATION CHANGE)
- **BEFORE**: System checked for 401/403 status codes in fetch response
- **AFTER**: System catches AI SDK's authentication errors and converts them
- **UNCHANGED**: User sees the same "Authentication failed" error message

#### Scenario: Handle timeout (IMPLEMENTATION CHANGE)
- **BEFORE**: System used AbortController to manage timeout
- **AFTER**: AI SDK manages timeout, system catches timeout errors
- **UNCHANGED**: User sees the same timeout error message with duration

### Requirement: Usage metadata extraction (INTERNAL)
**Status**: Modified (implementation detail only, data format unchanged)

The method of extracting usage metadata changes, but the format returned to callers remains identical.

#### Changes:
- **Modified**: Token counts extracted from AI SDK response instead of provider-specific response formats
- **Preserved**: TestResponse interface with tokensUsed structure

#### Scenario: Extract token counts from OpenAI (IMPLEMENTATION CHANGE)
- **BEFORE**: System parsed `data.usage.prompt_tokens`, `data.usage.completion_tokens`
- **AFTER**: System uses `usage.promptTokens`, `usage.completionTokens` from AI SDK
- **UNCHANGED**: Final response format is identical

#### Scenario: Extract token counts from Anthropic (IMPLEMENTATION CHANGE)
- **BEFORE**: System parsed `data.usage.input_tokens`, `data.usage.output_tokens`
- **AFTER**: System uses AI SDK's unified usage format
- **UNCHANGED**: Response contains same token count structure

### Requirement: Provider configuration (INTERNAL)
**Status**: Modified (implementation detail only, database schema unchanged)

The way provider configurations are converted to runtime objects changes, but LLMProviders collection schema remains identical.

#### Changes:
- **Added**: `createAISDKProvider()` factory function
- **Removed**: Provider-specific request building logic
- **Preserved**: LLMProviders collection schema (providerType, apiKey, apiEndpoint, etc.)

#### Scenario: Initialize OpenAI provider (IMPLEMENTATION CHANGE)
- **BEFORE**: System built fetch request with OpenAI-specific headers and body
- **AFTER**: System calls `createOpenAI({ apiKey, baseURL })` and returns provider instance
- **UNCHANGED**: Provider configuration in database is identical

## Unchanged Requirements

The following requirements are **NOT MODIFIED** by this change. All scenarios remain exactly as specified in the base spec:

- Link test to prompt (all scenarios)
- Test input and output tracking (all scenarios)
- Test configuration override (all scenarios)
- Model under test tracking (all scenarios)
- Execution status tracking (all scenarios)
- Execution metadata tracking (all scenarios)
- Test scoring and verification (all scenarios)
- Test CRUD operations (all scenarios)
- Test read access control (all scenarios)
- Draft and versioning support (all scenarios)
- Test description and title (all scenarios)
- Cascading delete behavior (all scenarios)

## Implementation Notes

### Code Structure Changes

**Before**:
```
src/app/x/test-prompt/route.ts (~900 lines)
  ├── testWithOpenAI()
  ├── testWithAnthropic()
  ├── testWithGoogle()
  ├── testWithOllama()
  ├── testWithCustomProvider()
  ├── testWithAzureOpenAI()
  └── testWithBedrock()
```

**After**:
```
src/lib/ai-sdk/providers.ts
  └── createAISDKProvider()

src/app/x/test-prompt/route.ts (~350 lines)
  └── Uses AI SDK generateText()
```

### Migration Strategy

1. **Zero downtime**: Deploy new implementation alongside old (or use feature flag)
2. **Canary testing**: Test with subset of users before full rollout
3. **Rollback**: Git revert if issues arise (no database migrations needed)

### Testing Strategy

1. **Unit tests**: Mock AI SDK providers, test error mapping
2. **Integration tests**: Test against real provider APIs with test keys
3. **Comparison tests**: Run old and new implementations in parallel, compare results
4. **Manual tests**: Test via admin UI with existing prompts and providers

## Backward Compatibility

**API Compatibility**: 100%
- Request format: Identical
- Response format: Identical
- Error responses: Identical
- HTTP status codes: Identical

**Data Compatibility**: 100%
- PromptTests records: Identical schema and data
- LLMProviders records: Identical schema
- Access control: Identical behavior

**UI Compatibility**: 100%
- TestPromptButton component: No changes needed
- Admin panel forms: No changes needed
- Error display: No changes needed
