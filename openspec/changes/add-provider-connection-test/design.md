## Context

**Current State:**
- LLM Providers collection stores provider configurations including `authType`, `apiKey`, `apiEndpoint`, `providerType`, and `owner` (relationship to users)
- Admin users can view providers (`authenticated` access) and create/update/delete (`adminOnly` access)
- Provider configurations are saved without validation, errors only appear when used in actual API calls
- No mechanism exists to verify connectivity or API key validity before saving
- Prompts collection stores prompt content, model compatibility scores, and LLM parameters (temperature, maxTokens, etc.)
- Users can create and manage prompts but cannot test them directly in the admin panel
- To test a prompt, users must manually copy the content and test it in an external LLM playground or through custom code

**Constraints:**
- Must integrate with existing Payload CMS admin UI patterns
- Must use Payload's access control system without modifying User schema
- API keys stored as plain text field (TODO: encryption in future)
- Frontend is React client component, must use `'use client'` directive
- Backend is Next.js App Router, API routes follow `src/app/api/*/route.ts` pattern

**Stakeholders:**
- Admin users: Need quick validation of provider configurations
- System: Need to prevent malformed configs from reaching production API calls

## Goals / Non-Goals

**Goals:**

**Provider Connection Testing:**
- Provide real-time validation of LLM provider configurations
- Support all 8 provider types with appropriate test endpoints
- Return actionable error messages (auth failure, timeout, endpoint unreachable)
- Show test results with response time and available model count
- Restrict testing to provider owner only
- Handle timeouts gracefully with 10-second limit

**Prompt Testing UI:**
- Enable in-admin testing of prompts with real LLM API calls
- Select appropriate model from prompt's modelScores for testing
- Display generated responses with metadata (tokens, cost, response time)
- Return actionable error messages for common failures
- Restrict testing to prompt owner only
- Handle longer timeouts (60 seconds for LLM inference)

**Non-Goals:**
- Modifying User schema to add role-based access control (use existing `owner` field)
- Encrypting API keys during testing (out of scope, TODO for future)
- Saving test results or history (fire-and-forget testing)
- Rate limiting test endpoint (assume trusted admin users)
- Batch testing multiple prompts/providers at once (UI complexity, can be added later)
- Automatic prompt optimization or A/B testing (separate feature)
- Saving prompt test results to PromptTests collection (manual for now)

## Decisions

### 1. Component Architecture: Sidebar Button in Edit View

**Decision:** Add custom component `TestProviderConnection` to LLMProviders collection's `admin.components` configuration, positioned in sidebar via component's own UI logic.

**Rationale:**
- Payload's `admin.components` is designed for custom UI elements
- Sidebar placement keeps testing action next to other sidebar actions (publish status)
- Reusable pattern: same component can be added to list view later for batch testing
- Minimal changes: only modifies collection config, doesn't require custom edit view

**Alternatives Considered:**
- **Custom Edit View**: Complete control but requires re-implementing entire edit interface (high maintenance)
- **Field Component**: Could add button as a field but less discoverable and clutters form fields
- **List View Batch Action**: Good for bulk testing but harder to implement individual tests

### 2. API Endpoint Pattern: REST with POST

**Decision:** Create `POST /api/test-llm-provider` endpoint accepting `{ providerId: string }`, returns `{ success, status, responseTime, modelCount, error }`.

**Rationale:**
- POST to prevent caching and allow future expansion (test with custom config)
- JSON response is easy to parse in React component
- Follows existing Next.js App Router pattern used in seed endpoints
- Separation of concerns: UI component handles display, API handles provider-specific logic

**Alternatives Considered:**
- **GraphQL Mutation**: Would require modifying GraphQL schema, more complex
- **Payload Global Endpoint**: Overkill for simple one-off test operation

### 3. Provider-Specific Test Logic: Strategy Pattern

**Decision:** Implement provider-specific test functions in API route using switch/if-else on `providerType`, with unified error handling and timeout wrapper.

**Rationale:**
- Each provider has different endpoint and auth requirements
- Strategy pattern allows easy addition of new provider types
- Centralized timeout and error handling reduces code duplication
- No external dependencies needed (use native `fetch` with `AbortController`)

**Provider Test Strategies:**

| Provider Type | Endpoint | Auth Method | Fallback |
|--------------|----------|-------------|----------|
| `openai` | `/v1/models` | `Authorization: Bearer ${apiKey}` | Connection only |
| `anthropic` | `/v1/messages` (minimal) | `x-api-key: ${apiKey}` + version header | Connection only |
| `google` | `/v1beta/models` | `Authorization: Bearer ${apiKey}` | Connection only |
| `cohere` | `/v1/models` | `Authorization: Bearer ${apiKey}` | Connection only |
| `huggingface` | `/models` (no auth needed) | None | Connection only |
| `azure-openai` | `/openai/deployments` | `api-key: ${apiKey}` | Connection only |
| `aws-bedrock` | `/foundation-models` | AWS SigV4 (complex) | Connection only (skip) |
| `ollama` | `/api/tags` | None | Connection only |
| `lm-studio` | `/v1/models` | None | Connection only |
| `custom` | User-provided endpoint | Based on `authType` | Connection only |

**AWS Bedrock Note:** Skip model list test due to complex SigV4 signing, only test basic connectivity if credentials are present.

### 4. Access Control: Owner-Only via Server-Side Check

**Decision:** API endpoint reads provider document, checks if `req.user.id === provider.owner.id` before executing test.

**Rationale:**
- Leverages existing `owner` relationship field in LLMProviders
- No schema changes required
- Server-side enforcement prevents bypassing via direct API calls
- Follows Payload's Local API pattern with `overrideAccess: false`

**Implementation:**
```typescript
const provider = await payload.findByID({
  collection: 'llm-providers',
  id: providerId,
  user: req.user,
  overrideAccess: false,
})

if (provider.owner.id !== req.user.id) {
  return new Response('Unauthorized', { status: 403 })
}
```

### 5. Error Handling: User-Friendly Messages with Sensitive Data Masking

**Decision:** Map common error codes to user-friendly messages, never log or return raw API keys or tokens.

**Error Categories:**
- **401/403**: "Authentication failed: Invalid API key or credentials"
- **Timeout**: "Connection timeout: The server took too long to respond (10s limit)"
- **Network Error**: "Connection error: Unable to reach the endpoint"
- **Unknown**: "Test failed: An unexpected error occurred"

**Timeout Implementation:**
```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s

try {
  const response = await fetch(url, { signal: controller.signal, ...options })
  clearTimeout(timeoutId)
  // Handle response
} catch (error) {
  if (error.name === 'AbortError') {
    return { success: false, error: 'Connection timeout' }
  }
  // Handle other errors
}
```

### 6. UI Component Structure: React Client Component

**Decision:** `'use client'` component using Payload's `useDocumentInfo` hook to access current provider data, styled with inline styles or minimal CSS.

**Component Structure:**
```tsx
'use client'
import { useDocumentInfo } from '@payloadcms/ui'
import { Button, toast } from '@payloadcms/ui'

export const TestProviderConnection = () => {
  const { id, collection, user } = useDocumentInfo()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  if (collection !== 'llm-providers') return null

  const handleTest = async () => {
    setLoading(true)
    const response = await fetch('/api/test-llm-provider', {
      method: 'POST',
      body: JSON.stringify({ providerId: id }),
    })
    // Handle result, show toast
  }

  return <Button onClick={handleTest} disabled={loading}>
    {loading ? 'Testing...' : 'Test Connection'}
  </Button>
}
```

**Rationale:**
- `useDocumentInfo` provides current document ID and collection without prop drilling
- `toast` from `@payloadcms/ui` for consistent notification style
- Minimal state management (loading, result)
- Collection check prevents rendering in wrong context

## Risks / Trade-offs

### Risk 1: API Key Exposure in Server Logs

**Risk:** Test endpoint may log API keys in error messages or debug output.

**Mitigation:**
- Never include `apiKey` in error responses
- Use structured logging with redaction for sensitive fields
- Add comment in code warning against logging raw credentials

### Risk 2: Rate Limiting from Provider APIs

**Risk:** Frequent testing may hit provider rate limits (especially during development).

**Mitigation:**
- Document in UI that testing counts against API quotas
- Consider adding client-side debounce (delay between tests)
- Future: Add rate limiting middleware to test endpoint

### Risk 3: Timeout Too Short for Slow Providers

**Risk:** 10-second timeout may be insufficient for some providers under high load.

**Mitigation:**
- Make timeout configurable via environment variable (`PROVIDER_TEST_TIMEOUT`)
- Document timeout limit in UI
- Allow users to re-test if first attempt times out

### Risk 4: Owner Field May Be Missing in Existing Data

**Risk:** Early provider documents created before `owner` field was required may have `null` owner.

**Mitigation:**
- Add null check: `if (!provider.owner || provider.owner.id !== req.user.id)`
- Consider data migration to set owner for existing docs (out of scope)

### Risk 5: CORS Issues with Browser Fetch

**Risk:** If API endpoint calls provider APIs from browser, CORS may block requests.

**Mitigation:**
- All provider API calls happen server-side in `/api/test-llm-provider` route
- Browser only calls Payload's own API endpoint (same origin)

---

### Prompt Testing UI Design Decisions

### 6. Prompt Test API Pattern: Reuse Provider Configuration

**Decision:** Create `POST /api/test-prompt` endpoint that reads prompt configuration, selects a model from `modelScores`, and calls the corresponding provider's inference API.

**Rationale:**
- Leverages existing provider configurations and API keys
- Uses prompt's stored parameters (temperature, maxTokens, etc.) for consistent testing
- Follows same pattern as provider test endpoint for consistency
- Avoids duplicating provider-specific logic

**Implementation:**
1. Fetch prompt by ID with depth=1 to get modelScores relationship data
2. Select model with highest score from modelScores array
3. Query LLMModels collection to find the model's provider relationship
4. Fetch provider configuration (apiKey, apiEndpoint, providerType)
5. Call provider-specific inference API based on providerType
6. Return generated text with metadata (tokens, cost, responseTime)

### 7. Model Selection Strategy: Highest Score

**Decision:** Always select the model with the highest score from the prompt's `modelScores` array for testing.

**Rationale:**
- Simple deterministic approach (no user input required)
- Tests the "best" model according to user's own scoring
- Can be enhanced later with model selector UI if needed

**Edge Cases:**
- No modelScores: Return error instructing user to configure at least one model
- Model not found in LLMModels: Return error with list of available models
- Provider disabled: Warn user but still attempt test (let API fail with clear message)

### 8. Timeout Configuration: Longer for Inference

**Decision:** Use 60-second timeout for prompt testing (vs 10 seconds for provider connection tests).

**Rationale:**
- LLM inference takes longer than simple model list queries
- 60 seconds is sufficient for most prompts while preventing indefinite hangs
- Configurable via `PROMPT_TEST_TIMEOUT` environment variable
- Separate from provider test timeout to allow different limits

### 9. Cost Estimation: Use Model Pricing Data

**Decision:** Calculate estimated cost using `costPerMillTokens` from the LLMModels collection, multiplied by actual token usage from provider response.

**Rationale:**
- Helps users understand the cost implications of their prompts
- Uses existing pricing data in LLMModels collection
- Displays in USD with warning for expensive tests (> $0.10)
- For providers without per-token pricing (Ollama, LM Studio), display $0.00 with "local model" indicator

**Formula:**
```typescript
const estimatedCost = (promptTokens * costPerInputToken + completionTokens * costPerOutputToken) / 1000000
// Or if only average pricing available:
const estimatedCost = totalTokens * costPerMillTokens / 1000000
```

### 10. Response Display: Code Block with Copy

**Decision:** Display generated response in a formatted code block with syntax highlighting and a "Copy" button.

**Rationale:**
- Prompts often generate code or structured text that benefits from formatting
- Copy button allows easy reuse of generated content
- Code block prevents XSS from malicious prompt content
- Shows metadata (response time, tokens, cost) below the response for context

**UI Structure:**
```tsx
<div className="test-result">
  <h4>Generated Response</h4>
  <pre><code>{generatedText}</code></pre>
  <Button onClick={copyToClipboard}>Copy Response</Button>
  <div className="metadata">
    <span>Response: {responseTime}ms</span>
    <span>Tokens: {totalTokens}</span>
    <span>Cost: ${estimatedCost.toFixed(4)}</span>
    <span>Model: {modelUsed}</span>
  </div>
</div>
```

### 11. Provider-Specific Inference Logic

**Decision:** Extend provider-specific logic to handle inference requests (not just model list queries).

**Provider Inference Strategies:**

| Provider Type | Endpoint | Request Format | Response Parsing |
|--------------|----------|----------------|------------------|
| `openai` | `/v1/chat/completions` | `{messages, model, temperature, max_tokens}` | `choices[0].message.content` + `usage` |
| `anthropic` | `/v1/messages` | `{messages, model, temperature, max_tokens}` | `content[0].text` + `usage` |
| `google` | `/v1beta/models/{model}:generateContent` | `{contents, generationConfig}` | `candidates[0].content.parts[0].text` + `usageMetadata` |
| `ollama` | `/api/generate` or `/api/chat` | `{model, prompt, stream: false}` | `response` + token counts if available |
| `lm-studio` | `/v1/chat/completions` | OpenAI-compatible format | Same as OpenAI |
| `azure-openai` | `/openai/deployments/{model}/chat/completions` | OpenAI-compatible format | Same as OpenAI |
| `aws-bedrock` | `/model/{modelId}/invoke` | Bedrock-specific format | `completion` + `usage` |

### Risk 6: Prompt Content Exposure in Logs

**Risk:** Test endpoint may log full prompt content, potentially exposing sensitive or proprietary information.

**Mitigation:**
- Never log full prompt content in production
- Truncate prompts to first 100 characters in logs
- Add `DO NOT LOG: Full prompt content` comment in code
- Use structured logging with prompt ID instead of content

### Risk 7: Cost Accumulation from Testing

**Risk:** Users may run many prompt tests during development, accumulating costs.

**Mitigation:**
- Display cost estimate before and after each test
- Show warning if cost exceeds $0.10 per test
- Document in UI that testing consumes actual API quota
- Consider adding "Test with cached response" option for re-testing (future)

### Risk 8: Malicious Prompt Content

**Risk:** User could test prompts containing XSS or malicious scripts that get rendered in the UI.

**Mitigation:**
- Render responses in `<pre><code>` block which escapes HTML
- Never use `dangerouslySetInnerHTML` for prompt responses
- Sanitize responses if using rich text display (not needed for code block)

### Risk 9: Missing Provider Configuration

**Risk:** User tests a prompt with a model whose provider is not configured or disabled.

**Mitigation:**
- Check if provider exists and is enabled before calling API
- Return clear error: "Provider for model {modelId} not found or disabled. Please configure the provider first."
- Link to provider configuration page in error message

### Risk 10: Inconsistent Response Formats

**Risk:** Different providers return responses in different formats, making parsing error-prone.

**Mitigation:**
- Create provider-specific response parser functions
- Standardize to common output format: `{generatedText, tokensUsed, cost, responseTime}`
- Add try-catch around each parser with fallback error handling
- Write unit tests for each provider's response format

**Risk:** If API endpoint calls provider APIs from browser, CORS may block requests.

**Mitigation:**
- All provider API calls happen server-side in `/api/test-llm-provider` route
- Browser only calls Payload's own API endpoint (same origin)

## Migration Plan

### Deployment Steps

#### Phase 1: Provider Connection Testing

1. **Create API Endpoint:**
   ```bash
   # No database migration needed
   # Just add new route file
   src/app/api/test-llm-provider/route.ts
   ```

2. **Create UI Component:**
   ```bash
   src/admin/components/TestProviderConnection/
   ├── index.tsx
   └── index.scss (optional)
   ```

3. **Register Component:**
   ```typescript
   // src/collections/LLMProviders/index.ts
   import { TestProviderConnection } from '../../admin/components/TestProviderConnection'

   admin: {
     components: {
       TestProviderConnection,
     },
   }
   ```

4. **Test Locally:**
   - Start dev server
   - Navigate to existing Ollama provider in admin
   - Click "Test Connection" button
   - Verify success message with model count

#### Phase 2: Prompt Testing UI

5. **Create API Endpoint:**
   ```bash
   src/app/api/test-prompt/route.ts
   ```

6. **Create UI Component:**
   ```bash
   src/admin/components/TestPromptButton/
   ├── index.tsx
   └── index.scss (optional)
   ```

7. **Register Component:**
   ```typescript
   // src/collections/Prompts/index.ts
   import { TestPromptButton } from '../../admin/components/TestPromptButton'

   admin: {
     components: {
       TestPromptButton,
     },
   }
   ```

8. **Test Locally:**
   - Create a test prompt with modelScores configured
   - Click "Test Prompt" button
   - Verify generated response displays with metadata
   - Test error scenarios (invalid API key, disabled provider)

#### Phase 3: Production Deployment

9. **Deploy to Production:**
   - No schema changes = no downtime
   - Standard `pnpm build && pnpm start`
   - Feature flag not needed (can be disabled by not clicking buttons)

### Rollback Strategy

**If critical bug found:**

**Provider Connection Testing:**
1. Remove component registration from LLMProviders collection config
2. Delete component files or leave unused (no impact)
3. API endpoint can stay or be deleted (no calls if button removed)

**Prompt Testing UI:**
1. Remove component registration from Prompts collection config
2. Delete component files or leave unused (no impact)
3. API endpoint can stay or be deleted (no calls if button removed)

**Zero-database-change rollback:** No migrations to revert.

## Open Questions

1. **Should we save last test timestamp?**
   - **Decision:** No (out of scope). Adds complexity to schema. Future enhancement.

2. **Should we auto-disable providers on repeated test failures?**
   - **Decision:** No (manual for now). Could cause accidental service disruption. Let admins decide.

3. **Should test endpoint return model names or just count?**
   - **Decision:** Just count. Full model list could be large. Future: add "Show Models" expandable section.

4. **How to handle Ollama/LM Studio with authType='api-key' but no key needed?**
   - **Decision:** Still require apiKey field (can be placeholder), ignore in test for `providerType` that don't need it. Users can set `authType='none'`.

5. **Should we support custom timeout per request?**
   - **Decision:** No, keep simple with server-wide default. Can be added later if needed.

6. **Should prompt test save results to PromptTests collection?**
   - **Decision:** No (manual for now). Automatic saving could create many test records. Users can manually save successful tests as PromptTests if desired.

7. **Should we allow selecting which model to test from modelScores?**
   - **Decision:** No, always use highest-scored model for simplicity. Can add model selector in future if users need to test multiple models.

8. **Should we support streaming responses for prompt testing?**
   - **Decision:** No, streaming adds complexity to UI and testing flow. Use non-streaming mode for testing. Streaming is for production use, not testing.
