# Implementation Tasks: Integrate Vercel AI SDK

## 1. Setup and Dependencies

- [x] 1.1 Install AI SDK Core package (`pnpm add ai`)
- [x] 1.2 Install provider packages: `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`
- [x] 1.3 install additional provider packages: `@ai-sdk/azure`, `ollama-ai-provider`, `@ai-sdk/cohere`
- [x] 1.4 Create directory structure: `src/lib/ai-sdk/`
- [x] 1.5 Lock AI SDK version in package.json (pin to specific version)

## 2. Provider Factory Implementation

- [x] 2.1 Create `src/lib/ai-sdk/providers.ts` file
- [x] 2.2 Define `createAISDKProvider()` function signature
- [x] 2.3 Implement OpenAI provider creation (handle custom baseURL)
- [x] 2.4 Implement Anthropic provider creation (handle custom baseURL)
- [x] 2.5 Implement Google provider creation (handle API key in URL)
- [x] 2.6 Implement Azure OpenAI provider creation (handle apiVersion and deployment)
- [x] 2.7 Implement Ollama provider creation (handle custom endpoint)
- [x] 2.8 Implement Cohere provider creation
- [x] 2.9 Implement custom OpenAI-compatible provider (LM Studio, custom endpoints)
- [x] 2.10 Add error handling for unsupported provider types
- [x] 2.11 Export TypeScript types for provider configuration

## 3. Test Prompt Route - Core Refactoring

- [x] 3.1 Remove `testWithOpenAI()` function (~75 lines)
- [x] 3.2 Remove `testWithAnthropic()` function (~75 lines)
- [x] 3.3 Remove `testWithGoogle()` function (~75 lines)
- [x] 3.4 Remove `testWithOllama()` function (~75 lines)
- [x] 3.5 Remove `testWithCustomProvider()` function (~75 lines)
- [x] 3.6 Remove `testWithAzureOpenAI()` function (~75 lines)
- [x] 3.7 Remove `testWithBedrock()` function (currently returns unsupported error)
- [x] 3.8 Remove provider-specific import statements and type definitions
- [x] 3.9 Import `generateText` from 'ai'
- [x] 3.10 Import `createAISDKProvider` from '@/lib/ai-sdk/providers'

## 4. Test Prompt Route - New Implementation

- [x] 4.1 Update `testPrompt()` function to use AI SDK provider factory
- [x] 4.2 Replace provider switch statement with AI SDK `generateText()` call
- [x] 4.3 Map prompt parameters to AI SDK format (temperature, maxTokens, topP, etc.)
- [x] 4.4 Handle `extraConfig` merge with AI SDK parameters
- [x] 4.5 Extract generated text from AI SDK response
- [x] 4.6 Extract usage metadata from AI SDK response
- [x] 4.7 Preserve `calculateCost()` function (no changes needed)
- [x] 4.8 Preserve timeout handling (AI SDK has built-in timeout support)
- [ ] 4.9 Test with OpenAI provider (verify token counts and cost calculation)
- [ ] 4.10 Test with Anthropic provider (verify token counts match new format)
- [ ] 4.11 Test with Google provider (verify response parsing)
- [ ] 4.12 Test with Ollama provider (verify custom endpoint works)
- [ ] 4.13 Test with custom OpenAI-compatible provider

## 5. Error Handling and Mapping

- [x] 5.1 Create error mapping utility function (integrated in testPrompt)
- [x] 5.2 Map AI SDK authentication errors to existing error format
- [x] 5.3 Map AI SDK rate limit errors to existing error format
- [x] 5.4 Map AI SDK timeout errors to existing error format
- [x] 5.5 Map AI SDK network errors to existing error format
- [x] 5.6 Map AI SDK validation errors to existing error format
- [x] 5.7 Map AI SDK generic errors to existing error format
- [x] 5.8 Preserve existing error message text for backward compatibility
- [ ] 5.9 Test error mapping with mock AI SDK errors
- [ ] 5.10 Verify error responses match old format exactly

## 6. Preserve Existing Functionality

- [x] 6.1 Verify authentication logic unchanged (user verification)
- [x] 6.2 Verify authorization logic unchanged (prompt ownership check)
- [x] 6.3 Verify provider ownership check unchanged
- [x] 6.4 Verify provider enabled check unchanged
- [x] 6.5 Verify model existence in provider list unchanged
- [x] 6.6 Verify PromptTests auto-creation logic unchanged
- [x] 6.7 Verify cost warning threshold ($0.10) unchanged
- [x] 6.8 Verify environment variable ENABLE_AUTO_PROMPT_TEST_RECORD unchanged
- [x] 6.9 Verify request/response format unchanged (TestResponse interface)
- [ ] 6.10 Verify all existing tests still pass

## 7. Testing

- [ ] 7.1 Write unit test for `createAISDKProvider()` with OpenAI
- [ ] 7.2 Write unit test for `createAISDKProvider()` with Anthropic
- [ ] 7.3 Write unit test for `createAISDKProvider()` with Google
- [ ] 7.4 Write unit test for `createAISDKProvider()` with Azure OpenAI
- [ ] 7.5 Write unit test for `createAISDKProvider()` with Ollama
- [ ] 7.6 Write unit test for `createAISDKProvider()` with Cohere
- [ ] 7.7 Write unit test for `createAISDKProvider()` with custom provider
- [ ] 7.8 Write unit test for error mapping (authentication error)
- [ ] 7.9 Write unit test for error mapping (timeout error)
- [ ] 7.10 Write unit test for error mapping (network error)
- [ ] 7.11 Write integration test: test prompt with OpenAI (mock or real API key)
- [ ] 7.12 Write integration test: test prompt with Anthropic (mock or real API key)
- [ ] 7.13 Write integration test: test prompt failure scenario (invalid API key)
- [ ] 7.14 Write integration test: test prompt timeout scenario
- [ ] 7.15 Perform manual test: test prompt via admin UI with OpenAI
- [ ] 7.16 Perform manual test: test prompt via admin UI with Anthropic
- [ ] 7.17 Perform manual test: verify PromptTests record created correctly
- [ ] 7.18 Perform manual test: verify token counts accurate
- [ ] 7.19 Perform manual test: verify cost calculation accurate
- [ ] 7.20 Perform comparison test: run old and new implementations, compare results

## 8. Documentation

- [ ] 8.1 Update CLAUDE.md with AI SDK integration section
- [ ] 8.2 Document provider factory function usage
- [ ] 8.3 Document supported provider types and configuration
- [ ] 8.4 Document error handling strategy
- [ ] 8.5 Document how to add new provider types
- [ ] 8.6 Update CLAUDE.md with troubleshooting section
- [ ] 8.7 Add migration notes (if upgrading from old implementation)
- [ ] 8.8 Document environment variables (no changes, but verify documentation)
- [ ] 8.9 Document performance characteristics (code size reduction, execution time)
- [ ] 8.10 Document future extensibility (streaming, tool calling, etc.)

## 9. Code Quality

- [x] 9.1 Run TypeScript type checking (`npx tsc --noEmit`)
- [x] 9.2 Fix any TypeScript errors
- [ ] 9.3 Run ESLint and fix any issues
- [x] 9.4 Generate Payload types (`pnpm generate:types`)
- [ ] 9.5 Generate import map (`pnpm generate:importmap`)
- [x] 9.6 Remove unused imports and variables
- [x] 9.7 Add JSDoc comments to `createAISDKProvider()`
- [x] 9.8 Add JSDoc comments to error mapping function
- [x] 9.9 Verify code follows project conventions
- [x] 9.10 Check for security issues (no exposed API keys, proper error handling)

## 10. Deployment Preparation

- [ ] 10.1 Create git branch for this change
- [ ] 10.2 Commit all changes with descriptive messages
- [ ] 10.3 Test deployment to development environment
- [ ] 10.4 Verify no runtime errors in development
- [ ] 10.5 Monitor error logs for 24 hours in development
- [ ] 10.6 Test rollback procedure (git revert previous commit)
- [ ] 10.7 Create pull request with summary of changes
- [ ] 10.8 Update CHANGELOG (if project has one)
- [ ] 10.9 Tag release (if following semantic versioning)
- [ ] 10.10 Deploy to production (after approval)

## 11. Post-Deployment

- [ ] 11.1 Monitor error logs for AI SDK errors
- [ ] 11.2 Monitor response times (should be similar or better)
- [ ] 11.3 Verify PromptTests records being created correctly
- [ ] 11.4 Check for any user-reported issues
- [ ] 11.5 Verify cost calculations still accurate
- [ ] 11.6 Monitor for rate limiting or quota issues
- [ ] 11.7 Collect feedback on new implementation
- [ ] 11.8 Update documentation based on real-world usage
- [ ] 11.9 Plan next phase (streaming support, tool calling, etc.)
- [ ] 11.10 Archive old implementation code (remove from git history after successful rollout)
