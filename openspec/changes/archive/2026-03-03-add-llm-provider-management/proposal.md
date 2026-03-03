# Proposal: Add LLM Provider and Models Management

## Why

The AI Infrastructure Assets project needs a centralized system to manage LLM provider configurations and model information. Currently, provider API keys and endpoints are likely hardcoded in application code or environment variables, making it difficult to:
- Manage multiple providers from different AI services (OpenAI, Anthropic, etc.)
- Track model capabilities and pricing across providers
- Update API configurations without code changes
- Reuse model configurations across the application
- Monitor usage and enforce rate limits

This change enables providers and models to be managed through the Payload CMS admin panel with proper access control, separating configuration from code.

## What Changes

- **New Collection: `LLMProviders`** - A provider management collection with:
  - Provider identification (slug, displayName, providerType, icon)
  - API configuration (authType, apiKey, apiEndpoint, apiVersion, region)
  - Model list as array field (models array with modelId, displayName, maxTokens, etc.)
  - Configuration and limits (rateLimit, rateLimitWindow, quota, costPerMillTokens, enabled)
  - Provider relationships to users for ownership tracking

- **New Collection: `LLMModels`** - A comprehensive model management collection with:
  - Model identification (slug, modelId, displayName)
  - Model capabilities (contextLength, maxTokens, supportsStreaming, supportsFunctionCalling)
  - Pricing information (costPerMillTokens, costPerInputToken, costPerOutputToken)
  - Provider relationship (links model to its provider)
  - Model metadata (description, tags, capabilities list)

- **Access Control**:
  - Create/Update/Delete: Admin only (due to sensitive API keys)
  - Read: Authenticated users can view providers and models

- **Plugin Integration**:
  - Search Plugin: Enable search on providers and models
  - SEO Plugin: Enable SEO for provider and model documentation pages

- **Seed Data**: Create seed endpoints with example providers (e.g., OpenAI, Anthropic) and their models

## Capabilities

### New Capabilities

- **`llm-provider-management`**: Core CRUD operations for LLM providers with API configuration, model lists, and usage limits. Includes provider ownership tracking, enabled/disabled state, and integration with authentication systems.

- **`llm-model-management`**: Comprehensive model catalog with provider relationships, capabilities tracking, and pricing information. Supports model discovery, comparison across providers, and reuse of model configurations.

### Modified Capabilities

*None - This is a net-new feature addition that doesn't modify existing capability requirements.*

## Impact

### Code Changes

**New Files**:
- `src/collections/LLMProviders/index.ts` - Providers collection configuration
- `src/collections/LLMProviders/hooks/revalidateProvider.ts` - Revalidation hooks
- `src/collections/LLMModels/index.ts` - Models collection configuration
- `src/collections/LLMModels/hooks/revalidateModel.ts` - Revalidation hooks
- `src/endpoints/seed/provider-1.ts` - Sample provider seed data (e.g., OpenAI)
- `src/endpoints/seed/provider-2.ts` - Sample provider seed data (e.g., Anthropic)
- `src/endpoints/seed/model-1.ts` - Sample model seed data
- `src/endpoints/seed/model-2.ts` - Sample model seed data

**Modified Files**:
- `src/payload.config.ts` - Register new collections
- `src/plugins/index.ts` - Add providers and models to Search and SEO plugins
- `src/endpoints/seed/index.ts` - Add seed data logic

### Database Schema

- New tables: `llm_providers`, `llm_models`
- New relationships:
  - llm_models ↔ llm_providers (many-to-one)
  - llm_providers ↔ users (ownership tracking)

### Dependencies

- No new external dependencies (uses existing Payload features)
- Leverages existing: `@payloadcms/plugin-search`, `@payloadcms/plugin-seo`

### Systems

- Admin panel: New "LLM Providers" and "LLM Models" collection views
- API: New REST/GraphQL endpoints for both collections
- Search: Providers and models indexed in admin search
- Frontend: No immediate frontend changes (admin-only initially)

### Security Considerations

- **API Keys**: Store encrypted in database, only accessible to admins
- **Access Control**: Strict admin-only write access to prevent unauthorized API key exposure
- **Secret Management**: Consider integration with secret management services for production
- **Audit Logging**: Log all changes to provider configurations

### Migration

- Run `pnpm payload migrate:create` after schema changes
- Run `pnpm payload migrate` to apply migrations
- Run `pnpm generate:types` to update TypeScript types
- Run `pnpm generate:importmap` to update component import map
