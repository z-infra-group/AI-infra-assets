# LLM Provider and Models Management - Technical Design

## Context

**Current State:**
- Payload CMS 3.78.0 project with existing Prompts and PromptTests collections
- Prompt Management feature already implements model compatibility scoring via text-based model IDs
- No centralized system for managing LLM provider configurations or model information
- Provider API keys and endpoints would need to be hardcoded or stored in environment variables

**Constraints:**
- Must use Payload CMS's access control system for security
- API keys require encryption at rest (sensitive data)
- Admin-only write access to prevent unauthorized API key exposure
- Must integrate with existing Search and SEO plugins
- Database: PostgreSQL with automatic schema updates via `push: true` in development

**Stakeholders:**
- Administrators: Configure providers, manage models, set rate limits and pricing
- Authenticated Users: Read-only access to provider and model information
- Future Integration: Prompt model scores will reference these models

## Goals / Non-Goals

**Goals:**
- Centralize LLM provider API configuration (keys, endpoints, versions, regions)
- Create a searchable catalog of LLM models with capabilities and pricing
- Enable provider ownership tracking for audit purposes
- Support model discovery and comparison across providers
- Lay groundwork for future integration with prompts' model compatibility scores

**Non-Goals:**
- Implement actual LLM API calls or client libraries (this is data management only)
- Implement real-time rate limiting enforcement (quota is informational for now)
- Build frontend pages for provider/model browsing (admin panel only initially)
- Implement automatic pricing updates from providers
- Sync provider/model data from external APIs

## Decisions

### Decision 1: Separate Providers and Models Collections

**Choice:** Create two independent collections: `LLMProviders` and `LLMModels`

**Rationale:**
- **Provider-centric model tracking**: Providers (OpenAI, Anthropic) maintain their own model catalogs. A separate models collection allows tracking provider-agnostic model attributes (capabilities, pricing).
- **Future flexibility**: Different providers may offer the same model (e.g., "llama-3-70b" hosted on multiple providers). Separate collections allow one-to-many relationship.
- **Query efficiency**: Models can be queried, filtered, and compared across providers without loading provider configuration details.
- **Clean separation of concerns**: Provider collection handles API credentials and configuration; Models collection handles model metadata.

**Alternatives Considered:**
- **Single collection with nested models**: Rejected because querying models across providers would require complex array operations and duplicate model data.
- **Models only, providers as enum field**: Rejected because providers need their own configuration (API keys, rate limits) that shouldn't be duplicated per model.

### Decision 2: Array-Based Models Field in Providers

**Choice:** Include a `models` array field in `LLMProviders` with basic model info (modelId, displayName, maxTokens)

**Rationale:**
- **Backward compatibility**: Prompts already use text-based model IDs in `modelScores`. This array preserves that pattern while allowing future migration.
- **Provider model catalog**: Most providers have a fixed set of models. Storing a basic list in the provider avoids complex joins for common operations.
- **Future migration path**: When `LLMModels` collection is fully populated, can migrate from array-based to relationship-based references.

**Alternatives Considered:**
- **Relationship-only approach**: Rejected because it would require pre-creating all models before adding providers, adding complexity to initial setup.

### Decision 3: API Key Storage Approach

**Choice:** Store API keys as encrypted text field with admin-only access control

**Rationale:**
- **Simplicity**: No external secret management service required for initial implementation
- **Admin panel integration**: Encrypted field type in Payload CMS provides masking and controlled visibility
- **Audit logging**: Can track who accesses/changes API keys via Payload hooks

**Alternatives Considered:**
- **Environment variables only**: Rejected because requires server restart to update keys and doesn't allow per-admin configuration tracking.
- **External secret service (Vault, AWS Secrets Manager)**: Deferred to future enhancement. Adds infrastructure complexity.

**Security Mitigations:**
- API keys encrypted at rest using Payload's encrypted field type
- API key field omitted from API responses for non-admin users
- Admin-only write access to providers collection
- Audit logging via hooks for all provider changes

### Decision 4: Provider-Model Relationship Direction

**Choice:** Models have a many-to-one relationship with Providers (each model belongs to one provider)

**Rationale:**
- **Semantic clarity**: Models are offered by providers, not the reverse
- **Simpler queries**: Finding all models from a provider is a common operation
- **Natural fit for array field**: Provider's `models` array can reference the related models

**Alternatives Considered:**
- **Many-to-many with junction table**: Rejected as over-engineering. A model instance from a specific provider (e.g., "OpenAI's gpt-4") is distinct from the same model hosted elsewhere.

### Decision 5: No Cascade Delete for Providers → Models

**Choice:** When a provider is deleted, do NOT cascade delete related models

**Rationale:**
- **Models may be referenced elsewhere**: Prompts' `modelScores` array may reference model IDs. Deleting models would break these references.
- **Historical tracking**: Test execution history may reference models that should be preserved.
- **Reversible**: Admin can manually delete orphaned models if needed.

**Trade-off:** Orphaned models will have broken provider relationships. Admin dashboard should flag these for cleanup.

### Decision 6: Access Control Strategy

**Choice:** Admin-only write, authenticated read for both collections

**Rationale:**
- **Security**: API keys and pricing information are sensitive but not user-specific. Authenticated users need read access to select models for prompts.
- **Simplicity**: No need for per-provider or per-model ownership tracking beyond audit purposes

**Alternatives Considered:**
- **Public read access**: Rejected because exposes pricing and configuration details that may be business-sensitive.
- **Owner-based write access**: Rejected because provider configuration is a system-level concern, not user-specific content.

### Decision 7: Revalidation Strategy

**Choice:** Follow existing pattern from Prompts/PromptTests with revalidation hooks

**Rationale:**
- **Consistency**: Reuse established patterns for Next.js cache invalidation
- **Future-proof**: When frontend pages are added, they'll benefit from revalidation
- **Standard Payload practice**: Use `context.disableRevalidate` flag to prevent loops during seed data creation

### Decision 8: Plugin Integration

**Choice:** Add both collections to Search and SEO plugins from the start

**Rationale:**
- **Future-ready**: No migration needed when frontend documentation pages are added
- **Minimal cost**: Plugin configuration is a simple array addition
- **Consistent UX**: Admins expect search and SEO fields across all content types

## Risks / Trade-offs

### Risk 1: API Key Exposure via Admin Panel
**Risk:** Admin users could export or log provider data including API keys.

**Mitigation:**
- Use Payload's encrypted field type which masks keys in the UI (shows `sk-****`)
- Implement audit logging to track provider access
- Consider IP whitelisting or VPN requirement for admin access in production

### Risk 2: Orphaned Models After Provider Deletion
**Risk:** Deleting a provider leaves models with broken provider relationships.

**Mitigation:**
- Admin UI should show "No provider" badge for orphaned models
- Create admin utility to identify and cleanup orphaned models
- Documentation should warn about provider deletion impact

### Risk 3: Array Field vs Collection Drift
**Risk:** Provider's `models` array may become inconsistent with `LLMModels` collection.

**Mitigation:**
- Documentation should clarify that `models` array is for basic reference, not canonical
- Future enhancement: Add sync script to populate `LLMModels` from provider arrays
- Admin UI can show warning if model exists in array but not in collection

### Risk 4: Missing Rate Limiting Enforcement
**Risk:** Storing rate limits without enforcement provides false sense of control.

**Mitigation:**
- Clearly document in UI that rate limits are informational
- Future enhancement: Add middleware to enforce limits during API calls
- For now, rely on provider-side rate limiting

### Risk 5: Pricing Data Staleness
**Risk:** Provider pricing changes frequently, manually entered data becomes outdated.

**Mitigation:**
- Add `lastPriceUpdate` timestamp field to track when pricing was entered
- Documentation should note pricing accuracy is admin's responsibility
- Future enhancement: Integrate with provider pricing APIs or webhooks

## Migration Plan

### Phase 1: Collection Setup
1. Create `src/collections/LLMProviders/index.ts` with all fields and access control
2. Create `src/collections/LLMModels/index.ts` with provider relationship
3. Create revalidation hooks for both collections
4. Register collections in `src/payload.config.ts`

### Phase 2: Plugin Integration
1. Update `src/plugins/index.ts` to add collections to Search and SEO plugins
2. Verify search functionality in admin panel

### Phase 3: Seed Data
1. Create seed endpoints for sample providers (OpenAI, Anthropic)
2. Create seed endpoints for sample models
3. Update `src/endpoints/seed/index.ts` to include new seed data
4. Test seeding by running `/api/seed` endpoint

### Phase 4: Type Generation
1. Run `pnpm generate:types` to update TypeScript types
2. Run `pnpm generate:importmap` to update component import map
3. Verify no TypeScript errors in collection files

### Phase 5: Database Migration (Production)
1. Run `pnpm payload migrate:create` to create migration files
2. Review generated migrations
3. Run `pnpm payload migrate` to apply migrations in staging
4. Test admin panel access control in staging
5. Deploy to production and run migrations

### Rollback Strategy
- **Code rollback**: Git revert to previous commit
- **Database rollback**: Restore from pre-migration backup
- **Seed data cleanup**: Delete seeded providers and models via admin panel or API

## Open Questions

### Q1: Should we implement API key rotation?
**Status:** Deferred
**Context:** Providers may require periodic API key rotation for security.
**Decision:** Not in scope for initial implementation. Future enhancement could add `keyRotationDate` field and notifications.

### Q2: How should we handle provider-specific model configurations?
**Status:** Deferred
**Context:** Some models have provider-specific parameters (e.g., OpenAI's `stop` sequences vs Anthropic's).
**Decision:** Store generic model attributes in `LLMModels` collection. Provider-specific configs can be added to provider's `extraConfig` JSON field if needed.

### Q3: Should we support multiple API credentials per provider?
**Status:** Out of scope
**Context:** Enterprise use cases may need multiple API keys for different environments or teams.
**Decision:** Single `apiKey` field for initial implementation. Future enhancement could add `apiCredentials` array with environment labels.

### Q4: How will prompts' modelScores integrate with Models collection?
**Status:** Planned for future
**Context:** Prompts currently use text-based model IDs. Models collection provides canonical model data.
**Decision:** Maintain text-based IDs in prompts for now. Future migration can:
1. Add `model` relationship field to prompts
2. Run migration script to match text IDs to model records
3. Make relationship field required, deprecate text-based IDs

### Q5: Should we implement usage tracking?
**Status:** Deferred
**Context:** Proposal includes `quota` and `costPerMillTokens` fields but no tracking mechanism.
**Decision:** Fields are informational for initial implementation. Future enhancement could add `UsageLogs` collection to track token consumption and costs over time.

## Implementation Notes

- **Security Pattern**: Follow existing access control patterns from `src/access/` for consistency
- **Slug Generation**: Use `slugField()` utility with proper positioning
- **SEO Tab Structure**: Use `{name: 'meta', label: 'SEO'}` pattern to avoid field conflicts (learned from Prompts collection)
- **Enum Naming**: Avoid naming conflicts with Payload's `_status` field (use `executionStatus` pattern if needed)
- **Context Safety**: Always pass `req` to nested operations in hooks for transaction safety
- **Local API**: Always use `overrideAccess: false` when using Local API with user context
