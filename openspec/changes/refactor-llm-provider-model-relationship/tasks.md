## 1. Current Implementation (Plan 1: Provider Embedded Configuration) ✅ COMPLETED

- [x] 1.1 Modify LLMProviders collection - Change models from relationship to array field
- [x] 1.2 Update LLMProviders models array structure - Add modelId, displayName, maxTokens, contextLength, costPerMillTokens fields
- [x] 1.3 Remove LLMProviders slug field - Remove slug generation and requirement
- [x] 1.4 Remove LLMProviders SEO fields - Remove meta tab and SEO field imports
- [x] 1.5 Modify LLMModels collection - Change provider from required to optional
- [x] 1.6 Remove LLMModels slug field - Remove slug generation and requirement
- [x] 1.7 Remove LLMModels SEO fields - Remove meta tab and SEO field imports (not applicable)
- [x] 1.8 Update LLMProviders hooks - Remove slug dependency from revalidateProvider hook
- [x] 1.9 Update LLMModels hooks - Remove slug dependency from revalidateModel hook, fix revalidateDelete return value
- [x] 1.10 Update provider seed data - Add models array to provider-1.ts and provider-2.ts
- [x] 1.11 Update model seed data - Change provider to optional in model-1.ts and model-2.ts
- [x] 1.12 Remove slug from prompt seed data - Add slug field to prompt-1.ts (Prompts still need slug)
- [x] 1.13 Fix test endpoint TypeScript errors - Update test-llm-provider and test-prompt to use object spread for responseTime
- [x] 1.14 Regenerate TypeScript types - Run pnpm generate:types
- [x] 1.15 Verify TypeScript compilation - Ensure no LLM-related errors

## 2. Testing and Validation (Current Implementation) - PENDING

- [ ] 2.1 Test provider creation with models array - Verify admin UI allows adding model configurations
- [ ] 2.2 Test same modelId in multiple providers - Create "gpt-4" in both OpenAI and Azure providers
- [ ] 2.3 Test API responses - Verify providers endpoint returns models as embedded array
- [ ] 2.4 Test prompt testing endpoint - Verify test-prompt reads from provider.models array
- [ ] 2.5 Test LLMModels as optional catalog - Create model without provider relationship
- [ ] 2.6 Verify data consistency - Ensure no bidirectional sync issues
- [ ] 2.7 Test migration scenarios - Verify seed data loads correctly with new schema

## 3. Documentation (Current Implementation) - PENDING

- [ ] 3.1 Update CLAUDE.md - Document new provider-model relationship structure
- [ ] 3.2 Document API changes - Update API response format examples
- [ ] 3.3 Create migration guide - Document current structure and future migration path
- [ ] 3.4 Update admin panel documentation - Document models array editing experience
- [ ] 3.5 Remove outdated references - Clean up any references to old relationship structure

## 4. Future Migration (Plan 3: Middle Table Design) - DEFERRED

### 4.1 Pre-Migration Planning

- [ ] 4.1.1 Define migration triggers - Establish criteria for when to migrate (Provider > 5, Models > 50, etc.)
- [ ] 4.1.2 Create migration timeline - Define target date and staging plan
- [ ] 4.1.3 Assess data volume - Count existing providers and models for migration planning
- [ ] 4.1.4 Identify dependent systems - List all code that queries provider.models

### 4.2 Create ProviderModelConfig Collection

- [ ] 4.2.1 Create collection file at `src/collections/ProviderModelConfig/index.ts`
- [ ] 4.2.2 Define schema fields: provider (relationship), model (relationship), costPerMillTokens, maxTokens, contextLength
- [ ] 4.2.3 Add access control - Apply adminOnly for create/update/delete, authenticated for read
- [ ] 4.2.4 Add hooks - Implement revalidateProviderModelConfig cache invalidation
- [ ] 4.2.5 Register collection - Add to payload.config.ts
- [ ] 4.2.6 Generate TypeScript types - Run pnpm generate:types

### 4.3 Data Migration Script

- [ ] 4.3.1 Create migration script at `scripts/migrate-to-provider-model-configs.ts`
- [ ] 4.3.2 Implement provider iteration - Loop through all providers in database
- [ ] 4.3.3 Implement model extraction - For each provider, extract models array
- [ ] 4.3.4 Implement LLMModel lookup - Find or create LLMModel record for each modelId
- [ ] 4.3.5 Implement ProviderModelConfig creation - Create config record linking provider and model
- [ ] 4.3.6 Handle modelId conflicts - Implement strategy for duplicate modelIds across providers
- [ ] 4.3.7 Add transaction support - Wrap migration in database transaction
- [ ] 4.3.8 Add rollback logic - Create script to revert if migration fails
- [ ] 4.3.9 Add progress logging - Log migration progress for monitoring
- [ ] 4.3.10 Test migration script - Run on test data and verify results

### 4.4 Update API Endpoints

- [ ] 4.4.1 Update test-llm-provider endpoint - Modify to query ProviderModelConfig if needed
- [ ] 4.4.2 Update test-prompt endpoint - Change query from provider.models to ProviderModelConfig
- [ ] 4.4.3 Add backward compatibility - Support both old and new formats during transition
- [ ] 4.4.4 Update GraphQL schema - Add ProviderModelConfig queries and mutations
- [ ] 4.4.5 Update REST API responses - Adjust response format to use relationship data
- [ ] 4.4.6 Update prompt model resolution - Modify prompts to query ProviderModelConfig
- [ ] 4.4.7 Test all API endpoints - Ensure no breaking changes in API contracts

### 4.5 Update Admin UI

- [ ] 4.5.1 Remove models array from LLMProviders admin - Delete old models array field
- [ ] 4.5.2 Add ProviderModelConfig inline editing - Create custom component for provider-model relationships
- [ ] 4.5.3 Update provider detail view - Display models via ProviderModelConfig relationship
- [ ] 4.5.4 Add quick action buttons - Enable adding models to provider from detail view
- [ ] 4.5.5 Update model list view - Show which providers offer each model
- [ ] 4.5.6 Add filtering capabilities - Enable filtering models by provider
- [ ] 4.5.7 Test admin UI workflows - Verify all CRUD operations work correctly

### 4.6 Database Migration

- [ ] 4.6.1 Create Payload migration file - Use `pnpm payload migrate:create`
- [ ] 4.6.2 Add migration SQL - `ALTER TABLE llm_providers DROP COLUMN models`
- [ ] 4.6.3 Test migration on development - Verify migration runs without errors
- [ ] 4.6.4 Create backup strategy - Implement database backup before migration
- [ ] 4.6.5 Schedule production migration - Plan maintenance window for migration
- [ ] 4.6.6 Execute migration - Run migration script on production database
- [ ] 4.6.7 Verify migration results - Confirm all data migrated correctly

### 4.7 Cleanup and Optimization

- [ ] 4.7.1 Remove old code - Delete unused imports and functions related to models array
- [ ] 4.7.2 Update documentation - Revise CLAUDE.md and other docs
- [ ] 4.7.3 Remove backward compatibility - Clean up transition code after verification
- [ ] 4.7.4 Optimize queries - Add database indexes for ProviderModelConfig queries
- [ ] 4.7.5 Update seed data - Modify seed scripts to use ProviderModelConfig structure
- [ ] 4.7.6 Performance testing - Verify queries perform acceptably with new structure

### 4.8 Monitoring and Validation

- [ ] 4.8.1 Monitor error rates - Track API errors post-migration
- [ ] 4.8.2 Validate data integrity - Run consistency checks on provider-model relationships
- [ ] 4.8.3 Test user workflows - Verify all user scenarios still work
- [ ] 4.8.4 Gather feedback - Collect user feedback on new admin UI
- [ ] 4.8.5 Performance benchmarking - Compare performance before and after migration
- [ ] 4.8.6 Create rollback plan - Document rollback steps if critical issues found

## 5. Rollback Planning (If Needed) - PENDING

- [ ] 5.1 Document rollback steps - Create detailed rollback procedure
- [ ] 5.2 Create rollback script - Automate rollback to Plan 1 if Plan 3 fails
- [ ] 5.3 Test rollback procedure - Verify rollback works on test environment
- [ ] 5.4 Define rollback triggers - Establish criteria for when to rollback
- [ ] 5.5 Communication plan - Prepare user communication for rollback scenario
