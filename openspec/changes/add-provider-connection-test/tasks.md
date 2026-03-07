## 1. Backend API Implementation

- [x] 1.1 Create API endpoint directory structure at `src/app/api/test-llm-provider/`
- [x] 1.2 Implement route.ts with POST handler accepting `{ providerId }` request body
- [x] 1.3 Add user authentication check using Payload's `req.user`
- [x] 1.4 Implement provider ownership validation (compare `provider.owner.id` with `req.user.id`)
- [x] 1.5 Implement timeout wrapper using `AbortController` with 10-second limit
- [x] 1.6 Implement provider-specific test strategies for OpenAI (`/v1/models` endpoint)
- [x] 1.7 Implement provider-specific test strategies for Anthropic (`/v1/messages` with minimal payload)
- [x] 1.8 Implement provider-specific test strategies for Google (`/v1beta/models` endpoint)
- [x] 1.9 Implement provider-specific test strategies for Ollama (`/api/tags` endpoint)
- [x] 1.10 Implement provider-specific test strategies for LM Studio (`/v1/models` endpoint)
- [x] 1.11 Implement provider-specific test strategies for Azure OpenAI (`/openai/deployments` endpoint)
- [x] 1.12 Implement provider-specific test strategies for AWS Bedrock (basic connectivity check only)
- [x] 1.13 Implement provider-specific test strategies for Custom providers (based on `authType`)
- [x] 1.14 Implement response time measurement (milliseconds from request start to response complete)
- [x] 1.15 Implement model count parsing from successful responses
- [x] 1.16 Implement error handling with user-friendly messages (401/403, timeout, network errors)
- [x] 1.17 Implement API key redaction in logs and error messages
- [x] 1.18 Implement fallback to connection status when model list retrieval fails
- [x] 1.19 Return consistent JSON response format with `{ success, status, responseTime, modelCount, error }`

## 2. Frontend Component Implementation

- [x] 2.1 Create component directory at `src/admin/components/TestProviderConnection/`
- [x] 2.2 Implement `index.tsx` as a client component with `'use client'` directive
- [x] 2.3 Import and use `useDocumentInfo` hook from `@payloadcms/ui`
- [x] 2.4 Import and use `Button` and `toast` components from `@payloadcms/ui`
- [x] 2.5 Implement state management for `loading` and `result` using React `useState`
- [x] 2.6 Implement collection context check (only render for `llm-providers`)
- [x] 2.7 Implement `handleTest` async function to call `/api/test-llm-provider` endpoint
- [x] 2.8 Implement button disabled state during loading
- [x] 2.9 Implement success toast notification with response time and model count
- [x] 2.10 Implement error toast notification with error message
- [x] 2.11 Add optional styling with `index.scss` for button positioning in sidebar
- [x] 2.12 Handle edge cases (missing provider ID, null owner, unauthorized access)

## 3. Collection Configuration

- [x] 3.1 Import `TestProviderConnection` component in `src/collections/LLMProviders/index.ts`
- [x] 3.2 Add component to `admin.components` configuration in LLMProviders collection
- [x] 3.3 Verify component renders in provider edit view sidebar

## 4. Testing and Validation

- [ ] 4.1 Test API endpoint with existing Ollama provider configuration
- [ ] 4.2 Test API endpoint authentication (verify non-owner cannot test)
- [ ] 4.3 Test API endpoint timeout behavior (use invalid endpoint to verify 10s timeout)
- [ ] 4.4 Test API endpoint error handling (invalid API key, network errors)
- [ ] 4.5 Test frontend component button states (idle, loading, success, error)
- [ ] 4.6 Test toast notifications display correctly
- [ ] 4.7 Test response time measurement accuracy
- [ ] 4.8 Test model count parsing for each provider type (openai, anthropic, google, ollama, etc.)
- [ ] 4.9 Test fallback to connection status when model list fails
- [ ] 4.10 Test API key redaction in error messages and logs
- [ ] 4.11 Verify TypeScript types are correct (`pnpm generate:types`)
- [ ] 4.12 Verify dev server starts without errors
- [ ] 4.13 Verify component only renders for llm-providers collection
- [ ] 4.14 Manual test: Click "Test Connection" button for Ollama provider and verify success message
- [ ] 4.15 Manual test: Try testing as non-owner user and verify access denied

## 5. Documentation

- [ ] 5.1 Update CLAUDE.md with provider connection testing feature documentation
- [ ] 5.2 Document API endpoint usage (`POST /api/test-llm-provider`)
- [ ] 5.3 Document component registration pattern for future custom admin components
- [ ] 5.4 Document timeout configuration via `PROVIDER_TEST_TIMEOUT` environment variable
- [ ] 5.5 Document security considerations (API key handling, owner-only access)

## 6. Prompt Testing Backend Implementation

- [x] 6.1 Create API endpoint directory structure at `src/app/api/test-prompt/`
- [x] 6.2 Implement route.ts with POST handler accepting `{ promptId }` request body
- [x] 6.3 Add user authentication check using Payload's `req.user`
- [x] 6.4 Implement prompt ownership validation (compare `prompt.author.id` with `req.user.id`)
- [x] 6.5 Fetch prompt with depth=1 to get modelScores relationship data
- [x] 6.6 Implement model selection logic (choose model with highest score from modelScores)
- [x] 6.7 Handle edge case: prompt with no modelScores (return error with instructions)
- [x] 6.8 Query LLMModels collection to find selected model's provider relationship
- [x] 6.9 Handle edge case: model not found in LLMModels collection (return error with available models)
- [x] 6.10 Fetch provider configuration (apiKey, apiEndpoint, providerType, enabled status)
- [x] 6.11 Handle edge case: provider not found or disabled (return error with link to configure provider)
- [x] 6.12 Implement timeout wrapper using `AbortController` with 60-second limit (configurable)
- [x] 6.13 Implement OpenAI inference API call (`/v1/chat/completions` endpoint)
- [x] 6.14 Implement Anthropic inference API call (`/v1/messages` endpoint)
- [x] 6.15 Implement Google inference API call (`/v1beta/models/{model}:generateContent` endpoint)
- [x] 6.16 Implement Ollama inference API call (`/api/generate` or `/api/chat` endpoint)
- [x] 6.17 Implement LM Studio inference API call (OpenAI-compatible `/v1/chat/completions`)
- [x] 6.18 Implement Azure OpenAI inference API call (`/openai/deployments/{model}/chat/completions`)
- [x] 6.19 Implement AWS Bedrock inference API call (`/model/{modelId}/invoke` endpoint)
- [x] 6.20 Apply prompt parameters (temperature, maxTokens, topP, frequencyPenalty, presencePenalty)
- [x] 6.21 Merge extraConfig JSON into API request if present
- [x] 6.22 Parse provider-specific response formats to extract generated text
- [x] 6.23 Parse token usage from provider responses (promptTokens, completionTokens, totalTokens)
- [x] 6.24 Calculate estimated cost using model pricing data (costPerMillTokens or per-token pricing)
- [x] 6.25 Return cost as $0.00 for local models (Ollama, LM Studio) with "local model" indicator
- [x] 6.26 Implement response time measurement (milliseconds)
- [x] 6.27 Return consistent JSON response format with `{ success, generatedText, responseTime, tokensUsed, estimatedCost, modelUsed, error }`
- [x] 6.28 Implement error handling with user-friendly messages (provider connection failure, API key failure, timeout)
- [x] 6.29 Implement prompt content redaction in logs (truncate to 100 chars)
- [x] 6.30 Add warning if estimated cost exceeds $0.10

## 7. Prompt Testing Frontend Component

- [x] 7.1 Create component directory at `src/admin/components/TestPromptButton/`
- [x] 7.2 Implement `index.tsx` as a client component with `'use client'` directive
- [x] 7.3 Import and use `useDocumentInfo` hook from `@payloadcms/ui`
- [x] 7.4 Import and use `Button` and `toast` components from `@payloadcms/ui`
- [x] 7.5 Implement state management for `loading`, `result`, and `copied` using React `useState`
- [x] 7.6 Implement collection context check (only render for `prompts`)
- [x] 7.7 Implement `handleTest` async function to call `/api/test-prompt` endpoint
- [x] 7.8 Implement button disabled state during loading
- [x] 7.9 Implement success toast notification with brief result summary
- [x] 7.10 Implement error toast notification with error message and actionable guidance
- [x] 7.11 Display generated response in `<pre><code>` block for syntax highlighting and XSS prevention
- [x] 7.12 Implement "Copy Response" button with `copied` state feedback
- [x] 7.13 Display metadata section with response time, tokens used, estimated cost, model used
- [x] 7.14 Add cost warning indicator if cost exceeds $0.10
- [x] 7.15 Add optional styling with `index.scss` for result display and metadata layout
- [x] 7.16 Handle edge cases (missing prompt ID, null author, unauthorized access, no model scores)
- [x] 7.17 Add loading spinner or progress indicator during prompt test
- [x] 7.18 Display helpful error messages with suggestions (e.g., "Test provider connection first")

## 8. Prompt Testing Collection Configuration

- [x] 8.1 Import `TestPromptButton` component in `src/collections/Prompts/index.ts`
- [x] 8.2 Add component to `admin.components` configuration in Prompts collection
- [x] 8.3 Verify component renders in prompt edit view sidebar

## 9. Prompt Testing and Validation

- [ ] 9.1 Test API endpoint with a sample prompt and configured Ollama provider
- [ ] 9.2 Test API endpoint authentication (verify non-owner cannot test)
- [ ] 9.3 Test API endpoint timeout behavior (use long-running prompt to verify 60s timeout)
- [ ] 9.4 Test API endpoint error handling (disabled provider, invalid API key, network errors)
- [ ] 9.5 Test model selection with multiple modelScores (verify highest score selected)
- [ ] 9.6 Test edge case: prompt with no modelScores (verify error message)
- [ ] 9.7 Test edge case: model not found in LLMModels collection (verify error with available models)
- [ ] 9.8 Test edge case: provider disabled or missing (verify error with guidance)
- [ ] 9.9 Test token usage parsing for each provider type (openai, anthropic, google, ollama, etc.)
- [ ] 9.10 Test cost estimation accuracy (compare calculated vs actual for each provider)
- [ ] 9.11 Test local model cost display ($0.00 for Ollama/LM Studio)
- [ ] 9.12 Test prompt parameter application (temperature, maxTokens, etc.)
- [ ] 9.13 Test extraConfig JSON merging (verify custom parameters applied)
- [ ] 9.14 Test frontend component button states (idle, loading, success, error)
- [ ] 9.15 Test generated response display in code block
- [ ] 9.16 Test "Copy Response" button functionality
- [ ] 9.17 Test metadata display (response time, tokens, cost, model)
- [ ] 9.18 Test cost warning indicator for expensive tests
- [ ] 9.19 Test toast notifications display correctly
- [ ] 9.20 Verify prompt content is escaped in code block (XSS prevention)
- [ ] 9.21 Verify prompt content not logged in full (redaction test)
- [ ] 9.22 Verify TypeScript types are correct (`pnpm generate:types`)
- [ ] 9.23 Verify dev server starts without errors
- [ ] 9.24 Verify component only renders for prompts collection
- [ ] 9.25 Manual test: Create a prompt with modelScores, click "Test Prompt", verify response
- [ ] 9.26 Manual test: Try testing as non-owner user and verify access denied
- [ ] 9.27 Manual test: Test with disabled provider and verify error message
- [ ] 9.28 Manual test: Test with different temperature settings and verify parameter application

## 10. Documentation Updates

- [ ] 10.1 Update CLAUDE.md with prompt testing UI feature documentation
- [ ] 10.2 Document API endpoint usage (`POST /api/test-prompt`)
- [ ] 10.3 Document model selection strategy (highest score from modelScores)
- [ ] 10.4 Document timeout configuration via `PROMPT_TEST_TIMEOUT` environment variable
- [ ] 10.5 Document cost estimation calculation and pricing data source
- [ ] 10.6 Document security considerations (prompt content redaction, XSS prevention)
- [ ] 10.7 Document provider-specific inference strategies and response formats
- [ ] 10.8 Move `docs/admin-ui-custom-components.md` to `docs/archive/admin-ui-custom-components.md` (superseded by implementation)
