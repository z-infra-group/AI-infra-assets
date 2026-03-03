# Implementation Tasks: LLM Provider and Models Management

## 1. Collection Setup

- [x] 1.1 Create LLMProviders collection directory and index.ts
- [x] 1.2 Create LLMProviders revalidation hooks file
- [x] 1.3 Create LLMModels collection directory and index.ts
- [x] 1.4 Create LLMModels revalidation hooks file
- [x] 1.5 Register LLMProviders and LLMModels in payload.config.ts

## 2. LLMProviders Collection Implementation

- [x] 2.1 Add basic identification fields (slug, displayName, providerType, icon)
- [x] 2.2 Add API configuration fields (authType, apiKey, apiEndpoint, apiVersion, region)
- [x] 2.3 Implement apiKey as encrypted field with admin-only visibility
- [x] 2.4 Add models array field with modelId, displayName, maxTokens
- [x] 2.5 Add configuration fields (rateLimit, rateLimitWindow, quota, costPerMillTokens, enabled)
- [x] 2.6 Add owner relationship to users collection
- [x] 2.7 Add tags array field with admin description
- [x] 2.8 Implement tabs for organizing fields (Basic Info, API Config, Models, Limits, SEO)
- [x] 2.9 Configure SEO tab with proper `{name: 'meta'}` structure
- [x] 2.10 Set access control (admin create/update/delete, authenticated read)
- [x] 2.11 Enable drafts and versioning with autosave
- [x] 2.12 Configure admin panel columns (displayName, providerType, enabled, updatedAt)
- [x] 2.13 Add validation for required fields (displayName, providerType, apiKey)
- [x] 2.14 Implement publishedAt hook for auto-timestamp on publish
- [x] 2.15 Wire up revalidation hooks (afterChange, afterDelete)

## 3. LLMModels Collection Implementation

- [x] 3.1 Add basic identification fields (slug, modelId, displayName, description)
- [x] 3.2 Add provider relationship field (many-to-one to LLMProviders)
- [x] 3.3 Add capabilities fields (contextLength, maxTokens, supportsStreaming, supportsFunctionCalling)
- [x] 3.4 Add pricing fields (costPerMillTokens, costPerInputToken, costPerOutputToken)
- [x] 3.5 Add metadata fields (tags array, capabilities array)
- [x] 3.6 Implement tabs for organizing fields (Basic Info, Capabilities, Pricing, Metadata, SEO)
- [x] 3.7 Configure SEO tab with proper `{name: 'meta'}` structure
- [x] 3.8 Set access control (admin create/update/delete, authenticated read)
- [x] 3.9 Enable drafts and versioning with autosave
- [x] 3.10 Configure admin panel columns (displayName, modelId, provider, supportsStreaming, updatedAt)
- [x] 3.11 Add validation for required fields (modelId, displayName, provider)
- [x] 3.12 Add validation for numeric ranges (contextLength >= 0, pricing >= 0)
- [x] 3.13 Implement publishedAt hook for auto-timestamp on publish
- [x] 3.14 Wire up revalidation hooks (afterChange, afterDelete)

## 4. Plugin Integration

- [x] 4.1 Add 'llm-providers' to searchPlugin collections array
- [x] 4.2 Add 'llm-models' to searchPlugin collections array
- [x] 4.3 Add 'llm-providers' to seoPlugin collections array
- [x] 4.4 Add 'llm-models' to seoPlugin collections array

## 5. Seed Data Creation

- [x] 5.1 Create src/endpoints/seed/provider-1.ts with OpenAI example
- [x] 5.2 Create src/endpoints/seed/provider-2.ts with Anthropic example
- [x] 5.3 Create src/endpoints/seed/model-1.ts (OpenAI GPT-4)
- [x] 5.4 Create src/endpoints/seed/model-2.ts (Anthropic Claude)
- [x] 5.5 Update src/endpoints/seed/index.ts collections array
- [x] 5.6 Add seeding logic for providers and models in seed/index.ts
- [ ] 5.7 Test seed endpoint by running GET /api/seed

## 6. Type Generation and Build

- [x] 6.1 Run `pnpm generate:types` to update TypeScript types
- [x] 6.2 Verify payload-types.ts includes LLMProviders and LLMModels
- [x] 6.3 Run `pnpm generate:importmap` to update component import map
- [x] 6.4 Run TypeScript compiler check: `tsc --noEmit`
- [x] 6.5 Verify no TypeScript errors in new collection files

## 7. Database Verification

- [x] 7.1 Verify database tables are created (llm_providers, llm_models)
- [x] 7.2 Verify relationships are established (llm_models → llm_providers, llm_providers → users)
- [x] 7.3 Verify encrypted field on apiKey column
- [ ] 7.4 Test seed data creates records successfully

## 8. Admin Panel Testing

- [ ] 8.1 Access /admin/collections/llm-providers in browser
- [ ] 8.2 Create a new provider with all fields populated
- [ ] 8.3 Verify provider is created and visible in list view
- [ ] 8.4 Test provider draft vs published status
- [ ] 8.5 Verify enabled/disabled toggle works
- [ ] 8.6 Access /admin/collections/llm-models in browser
- [ ] 8.7 Create a new model linked to a provider
- [ ] 8.8 Verify model is created and visible in list view
- [ ] 8.9 Test model draft vs published status
- [ ] 8.10 Verify provider relationship is displayed correctly

## 9. Access Control Testing

- [ ] 9.1 Verify admin user can create, read, update, delete providers
- [ ] 9.2 Verify admin user can create, read, update, delete models
- [ ] 9.3 Verify authenticated non-admin user can read providers and models
- [ ] 9.4 Verify authenticated non-admin user cannot create/update/delete providers or models
- [ ] 9.5 Verify unauthenticated user cannot access providers or models API

## 10. API Testing

- [ ] 10.1 Test REST API GET /api/llm-providers (authenticated)
- [ ] 10.2 Test REST API GET /api/llm-models (authenticated)
- [ ] 10.3 Verify apiKey field is omitted from non-admin API responses
- [ ] 10.4 Test GraphQL query for providers (authenticated)
- [ ] 10.5 Test GraphQL query for models with provider populated (authenticated)
- [ ] 10.6 Verify provider relationship is populated in model responses

## 11. Plugin Feature Testing

- [ ] 11.1 Test search functionality finds providers by displayName
- [ ] 11.2 Test search functionality finds models by displayName and modelId
- [ ] 11.3 Verify SEO fields (meta title, description) are available in admin panel
- [ ] 11.4 Verify SEO fields save correctly for providers
- [ ] 11.5 Verify SEO fields save correctly for models

## 12. Edge Case Testing

- [ ] 12.1 Test creating provider without apiKey (should fail validation)
- [ ] 12.2 Test creating model without provider (should fail validation)
- [ ] 12.3 Test duplicate slug handling (should reject)
- [ ] 12.4 Test deleting provider with related models (models should become orphaned)
- [ ] 12.5 Test negative values for numeric fields (should fail validation)
- [ ] 12.6 Test revalidation hooks with context.disableRevalidate flag

## 13. Documentation

- [x] 13.1 Update CLAUDE.md with new collections overview
- [x] 13.2 Document API key security considerations
- [x] 13.3 Document access control rules for providers and models
- [x] 13.4 Add usage examples for querying providers and models
- [x] 13.5 Document migration path for future prompt modelScores integration

## 14. Cleanup and Final Verification

- [x] 14.1 Remove console.log statements used for debugging
- [x] 14.2 Verify all TODO comments are addressed or documented
- [ ] 14.3 Run full test suite: `pnpm test`
- [x] 14.4 Verify dev server starts without errors: `pnpm dev`
- [ ] 14.5 Confirm all tasks are complete and artifacts are ready for archiving
