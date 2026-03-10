# AI Infrastructure Assets - Payload CMS Project

## Project Overview

This is a Payload CMS website template initialized with `create-payload-app -t website`. It provides a full-featured headless CMS with a modern Next.js frontend.

**Tech Stack:**
- **CMS**: Payload CMS 3.78.0
- **Frontend**: Next.js 15.4.11 (App Router)
- **Database**: PostgreSQL (via `@payloadcms/db-postgres`)
- **Language**: TypeScript 5.7.3
- **Styling**: TailwindCSS 4.1.18 + shadcn/ui
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React 0.563.0
- **Fonts**: Geist
- **Package Manager**: pnpm

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Frontend routes (Next.js App Router)
│   │   ├── [slug]/          # Dynamic page routes
│   │   ├── posts/           # Blog posts listing and detail
│   │   └── search/          # Search functionality
│   └── (payload)/           # Payload admin panel routes
│       ├── admin/           # Admin interface
│       └── api/             # GraphQL and REST API
├── collections/             # Collection configurations
│   ├── Pages/               # Page content with layout builder
│   ├── Posts/               # Blog posts with drafts
│   ├── Prompts/             # LLM prompt management
│   ├── PromptTests/         # Test cases for prompts
│   ├── LLMProviders/        # LLM provider configurations
│   ├── LLMModels/           # LLM model catalog
│   ├── Media/               # File uploads
│   ├── Categories/          # Nested categories
│   └── Users/               # Authenticated users
├── globals/                 # Global configurations
│   ├── Header/              # Site navigation
│   └── Footer/              # Site footer
├── blocks/                  # Layout builder blocks
│   ├── ArchiveBlock/        # Content archives
│   ├── Banner/              # Hero banners
│   ├── CallToAction/        # CTA components
│   ├── Code/                # Code snippets
│   ├── Content/             # Rich text content
│   ├── Form/                # Form builder
│   └── MediaBlock/          # Media displays
├── access/                  # Access control functions
│   ├── anyone.ts            # Public access
│   ├── authenticated.ts     # Logged-in users
│   ├── authenticatedOrPublished.ts  # Mixed access
│   └── adminOnly.ts         # Admin-only operations (TODO: role-based)
├── hooks/                   # Reusable hooks
├── plugins/                 # Payload plugins configuration
├── utilities/               # Helper functions
├── search/                  # Search configuration
└── payload.config.ts        # Main Payload configuration
```

## Key Features

### Content Management
- **Pages**: Full layout builder support with drafts and live preview
- **Posts**: Blog posts with categories, authors, and scheduled publishing
- **Prompts**: LLM prompt management with model compatibility scoring and versioning
- **PromptTests**: Test case tracking for prompts with execution metadata and results
- **LLMProviders**: Centralized LLM provider configuration (API keys, endpoints, rate limits)
- **LLMModels**: LLM model catalog with capabilities, pricing, and provider relationships
- **Media**: Upload management with focal points and resizing
- **Categories**: Nested taxonomy system
- **Users**: Authentication system (all authenticated users have same permissions in current setup)

### Plugins
1. **Form Builder** - Create custom forms with validation
2. **Nested Docs** - Hierarchical content structures
3. **Redirects** - URL redirect management
4. **SEO** - Complete SEO control per document
5. **Search** - Full-text search with indexing

### Frontend Features
- Server-side rendering with Next.js App Router
- Dark mode support
- Responsive design (mobile, tablet, desktop breakpoints)
- Live preview with multiple device sizes
- Draft preview functionality
- On-demand revalidation
- Sitemap generation
- Admin bar for logged-in users

### Access Control
- **Public**: Published pages and posts only
- **Authenticated**:
  - Can read: Published content + own drafts + all providers and models
  - Can create/update/delete: Own prompts and prompt tests
  - Note: Currently all authenticated users have same permissions (no role system yet)
- **LLMProviders & LLMModels**: Admin-only write, authenticated read (API keys protected)
- **Prompts**: User-owned with public/private sharing, authenticated users can create
- **PromptTests**: User-owned, linked to parent prompt visibility

## Development Guidelines

### Critical Security Rules

1. **Local API Access Control**: When using the Local API with a user, ALWAYS set `overrideAccess: false` to enforce permissions:
   ```typescript
   await payload.find({
     collection: 'posts',
     user: someUser,
     overrideAccess: false, // REQUIRED!
   })
   ```

2. **Transaction Safety**: Always pass `req` to nested operations in hooks to maintain atomicity:
   ```typescript
   hooks: {
     afterChange: [
       async ({ doc, req }) => {
         await req.payload.create({
           collection: 'audit-log',
           data: { docId: doc.id },
           req, // REQUIRED for transaction safety!
         })
       },
     ],
   }
   ```

3. **Prevent Hook Loops**: Use context flags to avoid infinite loops:
   ```typescript
   if (context.skipHooks) return
   ```

### Code Quality

- Run `tsc --noEmit` to validate TypeScript correctness
- Run `pnpm generate:types` after schema changes
- Run `pnpm generate:importmap` after creating/modifying components
- Always use proper TypeScript types from `payload-types.ts`

### Component Development

- **Server Components** (default): Can use Local API directly
- **Client Components** (needs `'use client'`): Use hooks like `useAuth`, `useDocumentInfo`
- Import UI components from `@payloadcms/ui` for admin panel
- Import UI components from `@payloadcms/ui/elements/*` for frontend

### Database Operations

- Use PostgreSQL adapter with connection pooling
- Create migrations: `pnpm payload migrate:create`
- Run migrations: `pnpm payload migrate`
- In development, `push: true` allows schema changes without migrations

## Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm test             # Run all tests
pnpm test:int         # Integration tests
pnpm test:e2e         # End-to-end tests
pnpm generate:types   # Generate TypeScript types
pnpm generate:importmap  # Generate component import map
```

## LLM Provider and Model Management

### Provider Configuration
- **API Keys**: Stored in database, currently as plain text field
  - ⚠️ **TODO**: Implement encryption for production deployments
  - ⚠️ **TODO**: Add audit logging for API key access
  - Admin panel displays masked keys (e.g., `sk-****`)
- **Provider Types Supported**: OpenAI, Anthropic, Google, Cohere, Hugging Face, Azure OpenAI, AWS Bedrock, Custom
- **Configuration Fields**:
  - `authType`: api-key, bearer-token, oauth, none
  - `apiEndpoint`: Base URL for API calls
  - `apiVersion`: API version string
  - `region`: Provider region (if applicable)
  - `rateLimit`, `rateLimitWindow`: Rate limit configuration (informational)
  - `quota`: Total quota limit (informational for now)
  - `enabled`: Enable/disable provider without deleting configuration

### Model Catalog
- **Provider Relationship**: Each model belongs to one provider (many-to-one)
- **Capabilities Tracked**:
  - `contextLength`: Maximum context window in tokens
  - `maxTokens`: Maximum output tokens
  - `supportsStreaming`: Boolean flag
  - `supportsFunctionCalling`: Boolean flag
- **Pricing Fields**:
  - `costPerMillTokens`: Simple average pricing
  - `costPerInputToken`: Precise input token cost
  - `costPerOutputToken`: Precise output token cost
- **Metadata**: Tags and capabilities array for categorization

### Provider Connection Testing

**Admin Panel Integration**:
- **Test Connection Button**: Added to LLM Providers edit view sidebar
- **Owner-Only Testing**: Only the provider creator can test connections
- **Real-Time Validation**: Verify API key and endpoint correctness before using providers

**API Endpoint**:
- `POST /api/test-llm-provider` - Test provider connectivity
- Request body: `{ providerId: string }`
- Response: `{ success, status, responseTime, modelCount, error }`
- Timeout: 10 seconds (configurable via `PROVIDER_TEST_TIMEOUT` env var)

**Provider-Specific Tests**:
- **OpenAI**: Fetches `/v1/models` - returns model count
- **Anthropic**: Sends minimal message to `/v1/messages` - verifies authentication
- **Google**: Fetches `/v1beta/models` - returns model count
- **Ollama**: Fetches `/api/tags` - returns local model list
- **LM Studio**: OpenAI-compatible `/v1/models` endpoint
- **Azure OpenAI**: Fetches `/openai/deployments` - returns deployment list
- **AWS Bedrock**: Basic connectivity check (skips model list due to SigV4 complexity)
- **Custom**: Based on `authType` - attempts connection with appropriate authentication

**Usage Example**:
```bash
curl -X POST http://localhost:3000/api/test-llm-provider \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=<JWT_TOKEN>" \
  -d '{"providerId": "<provider-id>"}'
```

**Response Example (Success)**:
```json
{
  "success": true,
  "status": "authenticated",
  "responseTime": 234,
  "modelCount": 156
}
```

**Response Example (Error)**:
```json
{
  "success": false,
  "status": "failed",
  "responseTime": 1234,
  "modelCount": null,
  "error": "Authentication failed: Invalid API key or credentials"
}
```

**Security Considerations**:
- API keys are redacted in logs (only first 8 characters shown)
- Provider ownership is validated before testing
- All provider API calls happen server-side
- Timeout prevents hanging on unreachable endpoints

**Component Registration Pattern**:
```typescript
// src/collections/LLMProviders/index.ts
import { TestProviderConnection } from '../../admin/components/TestProviderConnection'

admin: {
  components: {
    TestProviderConnection,
  },
}
```

### Prompt Testing

**Automatic Test Record Creation**:
- When users execute prompt tests via the "Test Prompt" button or API, the system automatically creates PromptTests records
- Records preserve complete test history including input, output, timing, tokens used, and cost
- **Auto-generated title format**: `{Prompt Title} - {Model ID} - {Timestamp}`
  - Example: `Claude 3 Opus - claude-3-opus-20240229 - 2026-03-10 14:30`
- **Environment Variable**: `ENABLE_AUTO_PROMPT_TEST_RECORD` (default: true)
  - Set to "false" to disable automatic record creation
  - Tests still execute normally, only record creation is skipped

**API Endpoint**:
- `POST /api/test-prompt` - Test a prompt with a specific provider and model
- Request body: `{ promptId, providerId, modelId }`
- Response: `{ success, generatedText, responseTime, tokensUsed, estimatedCost, modelUsed, providerUsed, error }`
- Timeout: 60 seconds (configurable via `PROMPT_TEST_TIMEOUT` env var)
- **Side Effect**: Automatically creates PromptTests record (if enabled)

**Field Mapping from Test Result to PromptTests Schema**:
```typescript
{
  title: auto-generated,                    // "{Prompt Title} - {Model ID} - {Timestamp}"
  prompt: promptId,                         // relationship to tested prompt
  author: req.user.id,                      // current user who executed test
  actualOutput: generatedText,              // LLM generated text
  testConfig: { temperature, maxTokens, topP, frequencyPenalty, presencePenalty },
  modelUnderTest: modelId,                  // model ID used for test
  executionStatus: 'completed' | 'failed',  // based on test success
  executedAt: new Date(),                    // test execution timestamp
  executionTime: responseTime,              // time taken in milliseconds
  tokensUsed: tokensUsed.totalTokens,       // total tokens consumed
  cost: estimatedCost,                      // cost in USD
  // Manual fields set to null:
  score: null,
  feedback: null,
  isVerified: false,
  inputVariables: null,
  expectedOutput: null,
}
```

**Error Handling**:
- Record creation failures are logged but don't prevent test results from being returned
- Failed tests (connection errors, timeouts) create records with `executionStatus: 'failed'` and error message in `actualOutput`
- The test result API response remains unchanged - record creation is a side effect

**Performance Impact**:
- Additional latency: ~50-100ms (using Payload Local API)
- Target: < 200ms total overhead
- Record creation uses same request context for efficiency

**Usage Example**:
```bash
curl -X POST http://localhost:3000/api/test-prompt \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=<JWT_TOKEN>" \
  -d '{
    "promptId": "<prompt-id>",
    "providerId": "<provider-id>",
    "modelId": "gpt-4"
  }'
```

**Backward Compatibility**:
- Manually created PromptTests records continue to work
- API response format unchanged
- Can disable auto-creation with environment variable if needed


### Access Control Security

**Current Implementation** (TODO: Enhance with role-based access):
- All authenticated users can create/update/delete providers and models
- API keys are stored in database (TODO: encrypt at rest)
- API key field is accessible to admins via admin panel
- No audit logging for provider changes (TODO: add)

**Future Enhancements**:
1. Add `role` field to Users collection (admin, editor, user)
2. Implement proper role checks in `adminOnly` access control
3. Encrypt API keys using Payload's encrypted field type
4. Add audit logging for all provider/model changes
5. Consider email-based admin checks as intermediate step

### Usage Examples

**Query providers via REST API**:
```bash
GET /api/llm-providers
Authorization: Bearer <JWT_TOKEN>
```

**Query models via GraphQL**:
```graphql
query {
  LlmModels {
    docs {
      displayName
      modelId
      provider {
        displayName
        enabled
      }
      contextLength
      supportsStreaming
    }
  }
}
```

**Local API usage**:
```typescript
import { getPayload } from 'payload'

const payload = await getPayload()

// Get all enabled providers
const providers = await payload.find({
  collection: 'llm-providers',
  where: {
    enabled: { equals: true }
  },
  depth: 0, // Don't populate relationships
  overrideAccess: false, // IMPORTANT: enforce permissions
})

// Get models by provider
const models = await payload.find({
  collection: 'llm-models',
  where: {
    provider: {
      equals: providerId
    }
  },
  depth: 1, // Populate provider relationship
  overrideAccess: false,
})
```

### Future Integration: Prompt Model Scores

**Current State**:
- Prompts use text-based model IDs in `modelScores` array
- Example: `[{ model: "gpt-4", score: 0.95 }]`

**Migration Path**:
1. Add `model` relationship field to Prompts collection
2. Run migration script:
   - Match text IDs to LlmModel records
   - Populate relationship field
3. Make relationship field required
4. Deprecate text-based model IDs

**Benefits of Migration**:
- Automatic model capability lookup
- Provider information available
- Real-time pricing calculations
- Model status checks (enabled/disabled)

## Environment Variables

```bash
DATABASE_URL=postgresql://127.0.0.1:5432/your-database-name
PAYLOAD_SECRET=your-secret-key-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
CRON_SECRET=your-cron-secret-here
PREVIEW_SECRET=your-preview-secret-here

# LLM Provider and Prompt Testing
# Enable automatic creation of PromptTests records (default: true)
ENABLE_AUTO_PROMPT_TEST_RECORD=true

# Timeout for prompt testing in milliseconds (default: 60000)
PROMPT_TEST_TIMEOUT=60000

# Timeout for provider connection testing in milliseconds (default: 10000)
PROVIDER_TEST_TIMEOUT=10000
```

## Important Notes

- This template uses PostgreSQL (not MongoDB)
- Next.js caching is disabled by default for Payload Cloud compatibility
- Images require republishing pages to clear cache after cropping
- Cron jobs may be limited to daily execution on Vercel free tier
- Demo user credentials: `demo-author@payloadcms.com` / `password`

## Customization

### Adding Collections
Create new collection in `src/collections/` and register in `src/payload.config.ts`

### Adding Blocks
Create new block in `src/blocks/` and add to layout builder fields

### Modifying Access Control
Edit functions in `src/access/` and apply to collection/global configs

### Adding Plugins
Install plugin and configure in `src/plugins/index.ts`

## Resources

- Payload Docs: https://payloadcms.com/docs
- Next.js Docs: https://nextjs.org/docs
- AGENTS.md: Detailed Payload development patterns
- .cursor/rules/: Cursor-specific development rules
