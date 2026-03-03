# Design: Prompt Management System

## Context

### Current State

The AI Infrastructure Assets project is a Payload CMS website template with:
- Payload CMS 3.78.0 with Next.js 15.4.11 frontend
- PostgreSQL database via `@payloadcms/db-postgres`
- Existing collections: Pages, Posts, Media, Categories, Users
- Plugin ecosystem: Form Builder, Nested Docs, Redirects, SEO, Search
- Established patterns for access control, hooks, and seed data

### Problem

Currently, LLM prompts are either hardcoded in application code or scattered across different systems, making it difficult to:
- Version control and track changes to prompts
- Test prompts across different models
- Reuse prompts across applications
- Collaborate on prompt optimization
- Track model compatibility and performance

### Stakeholders

- **Developers**: Need centralized prompt management with programmatic access
- **Content Creators**: Need UI to create and manage prompts without coding
- **ML Engineers**: Need to track model compatibility and test results
- **Admin Users**: Need access control and visibility management

### Constraints

- Must integrate with existing Payload CMS infrastructure
- Must follow established access control patterns
- Must support draft/versioning via Payload's built-in features
- Cannot introduce new external dependencies
- Must be admin-only initially (no public frontend)

## Goals / Non-Goals

**Goals:**

- Provide centralized prompt management within Payload CMS admin panel
- Enable user-owned private prompts and public sharing
- Support multi-model compatibility scoring with extensible storage
- Provide comprehensive test case management with execution tracking
- Integrate with existing Search and SEO plugins
- Follow established Payload CMS patterns for consistency

**Non-Goals:**

- Public frontend for viewing prompts (admin-only initially)
- Automatic prompt execution or LLM API integration
- Model Management collection (deferred to future work)
- Automatic compatibility score calculation
- Real-time collaborative editing
- Prompt version comparison or diffing tools

## Decisions

### 1. Collection Structure: Separate Prompts and PromptTests

**Decision**: Create two separate collections rather than embedding tests within prompts.

**Rationale:**
- **Separation of concerns**: Prompts focus on content and configuration, tests focus on validation
- **Scalability**: Tests can grow large with execution history; separating prevents prompt bloat
- **Access control flexibility**: Different visibility rules for prompts vs. test results
- **Query performance**: Can query tests independently for reporting
- **Relationship clarity**: One-to-many relationship is explicit via Payload relationship fields

**Alternatives Considered:**
- *Embedded tests in prompts*: Rejected due to query complexity and document size limits
- *Single unified collection*: Rejected due to different field requirements and access patterns

### 2. Model Compatibility: Text-based IDs with Array Storage

**Decision**: Store model IDs as text within an array field, not using relationships.

**Rationale:**
- **No existing Models collection**: Creating relationships would require creating Models collection first
- **Future migration path**: Text IDs can be migrated to relationships when Models collection is implemented
- **Flexibility**: Supports any model ID format without predefining models
- **Simplicity**: No circular dependency between Prompts and potential future Models collection

**Migration Strategy:**
```javascript
// Future migration from text to relationship
// 1. Create Models collection
// 2. Migrate: forEach prompt.modelScores -> findOrCreate model by ID
// 3. Update schema to use relationship field
// 4. Backfill relationships using migrated model references
```

**Alternatives Considered:**
- *Relationship fields*: Rejected due to lack of Models collection and potential circular dependencies
- *JSON blob for all scores*: Rejected due to loss of individual field querying and validation

### 3. Access Control: Hybrid Private/Public with Ownership

**Decision**: Use combination of `isPublic` flag, author ownership, and Payload's draft system.

**Rationale:**
- **User ownership**: `author` relationship field tracks creator for access control
- **Visibility toggle**: `isPublic` boolean allows users to share prompts when ready
- **Draft system**: Payload's built-in `_status` field handles draft vs. published
- **Established pattern**: Uses `authenticatedOrPublished` access control function from existing codebase

**Access Logic:**
```
Read Permission = (user is author) OR (isPublic = true AND _status = 'published') OR (user is authenticated)
Write Permission = (user is author)
```

**Alternatives Considered:**
- *Role-based permissions*: Rejected as over-engineering for current requirements
- *Complex sharing rules*: Rejected in favor of simple public/private toggle

### 4. LLM Parameters: Hybrid Individual Fields + JSON Extension

**Decision**: Store common parameters as individual fields with validation, use JSON field for extensibility.

**Rationale:**
- **Type safety**: Individual fields provide validation (min/max, step values)
- **UI UX**: Individual fields render as proper form controls in admin
- **Documentation**: Field-level descriptions guide users
- **Extensibility**: JSON field covers advanced use cases without schema changes
- **Query optimization**: Individual fields can be indexed and queried

**Individual Fields:**
- `temperature` (0-2, step 0.1)
- `maxTokens` (positive integer)
- `topP` (0-1, step 0.05)
- `frequencyPenalty` (-2 to 2, step 0.1)
- `presencePenalty` (-2 to 2, step 0.1)

**JSON Field Examples:**
```json
{
  "stop": ["\n\n", "END"],
  "tools": [{"type": "function", "function": {"name": "get_weather"}}],
  "tool_choice": "auto",
  "stream": true
}
```

**Alternatives Considered:**
- *All JSON*: Rejected due to lack of validation and poor UX in admin
- *All individual fields*: Rejected due to inability to handle new LLM features without migrations

### 5. Test Configuration: Override Pattern

**Decision**: Tests use `testConfig` JSON object to override prompt-level parameters.

**Rationale:**
- **Flexibility**: Allows testing with different parameters without modifying prompt
- **Explicit**: Clear separation between default (prompt) and test-specific config
- **Merge logic**: Test config overrides prompt config (simple merge semantics)
- **Storage**: JSON avoids schema bloat from duplicating all parameter fields

**Merge Semantics:**
```javascript
const effectiveConfig = {
  ...promptConfig,        // Default parameters from prompt
  ...testConfig           // Test-specific overrides
}
```

**Alternatives Considered:**
- *Separate parameter fields in tests*: Rejected due to duplication and schema bloat
- *No override capability*: Rejected as it limits testing scenarios

### 6. Plugin Integration: Search and SEO Enabled

**Decision**: Add Prompts collection to both Search and SEO plugins.

**Rationale:**
- **Search**: Users need to find prompts by content, tags, and model compatibility
- **SEO**: Future-proofing for potential public frontend (described in proposal)
- **Consistency**: Matches existing collections (Posts, Pages)
- **Minimal overhead**: Plugin configuration is simple array addition

**Configuration:**
```javascript
// Search plugin
searchPlugin({
  collections: ['posts', 'prompts'],  // Add 'prompts'
  // ...
})

// SEO plugin
seoPlugin({
  collections: ['posts', 'pages', 'prompts'],  // Add 'prompts'
  // ...
})
```

**Alternatives Considered:**
- *Search only*: Rejected to maintain consistency with other content collections
- *Neither plugin*: Rejected due to discoverability requirements

### 7. Revalidation Hooks: Follow Existing Pattern

**Decision**: Implement revalidation hooks following Posts/Pages pattern for future frontend support.

**Rationale:**
- **Consistency**: Uses same patterns as existing collections
- **Future-proof**: Prepares for potential public frontend
- **Simple**: Leverages existing `revalidatePath` and `revalidateTag` utilities
- **Safe**: Uses `context.disableRevalidate` flag to prevent issues during seeding

**Paths:**
- Prompts: `/prompts/${slug}`
- Prompt Tests: `/prompt-tests/${slug}`

**Tags:**
- `prompts-sitemap`
- `prompt-tests-sitemap`

**Alternatives Considered:**
- *No revalidation*: Rejected as it would complicate future frontend work
- *Custom revalidation logic*: Rejected in favor of established patterns

### 8. Seed Data: Sample Prompt with Comprehensive Test

**Decision**: Create one sample prompt with one comprehensive test case.

**Rationale:**
- **Demonstrates features**: Shows model scores, parameters, tags, and test structure
- **Minimal**: Single example avoids overwhelming developers
- **Realistic**: Uses creative writing prompt as relatable example
- **Complete**: Test includes execution metadata, scoring, and verification

**Seed Content:**
- Prompt: "Creative Writing Assistant" with 2 model scores
- Test: "Story Opening" with full execution metadata

**Alternatives Considered:**
- *Multiple prompts*: Rejected as unnecessary for initial seeding
- *No seed data*: Rejected as it makes development harder

## Risks / Trade-offs

### Risk 1: Array Field Query Performance

**Risk**: Querying prompts by model compatibility (filtering/sorting by scores in array) may be slow with large datasets.

**Mitigation**:
- Use PostgreSQL's JSON array query capabilities
- Consider adding indexed computed columns if performance issues arise
- Document query patterns for developers
- Future: Migrate to relationship-based model references for better query optimization

### Risk 2: JSON Field Validation

**Risk**: JSON fields (`extraConfig`, `testConfig`, `inputVariables`) lack schema validation at database level.

**Mitigation**:
- Implement JSON schema validation in Payload hooks (beforeValidate)
- Provide clear field descriptions with examples
- Document expected JSON structures in admin help text
- Consider runtime validation in API layer if needed

### Risk 3: Cascading Delete Data Loss

**Risk**: When a prompt is deleted, all associated tests are permanently lost.

**Mitigation**:
- Document cascading delete behavior clearly
- Consider implementing soft delete pattern in future if data retention is critical
- Add audit logging to track deletions
- Provide export functionality before deletion (future enhancement)

### Risk 4: Access Control Complexity

**Risk**: Complex access control logic (public + private + draft + ownership) may lead to confusion or bugs.

**Mitigation**:
- Use established `authenticatedOrPublished` pattern from existing codebase
- Write comprehensive integration tests for access scenarios
- Document access rules clearly in code comments
- Consider adding helper functions to encapsulate access logic

### Risk 5: Model ID Inconsistency

**Risk**: Text-based model IDs may become inconsistent if typos or naming variations occur.

**Mitigation**:
- Provide admin description with example formats
- Consider adding validation hook to check against known model patterns
- Document the convention for model IDs
- Future: Migration to relationship-based system will solve this

### Trade-off 1: Admin-only vs. Public Frontend

**Trade-off**: Initial implementation is admin-only, delaying public frontend benefits.

**Decision Rationale**:
- Reduces initial scope and complexity
- Allows iteration on data model before building UI
- SEO plugin integration makes future frontend easier
- Focuses on CMS functionality first (core value proposition)

### Trade-off 2: Manual vs. Automatic Scoring

**Trade-off**: Compatibility scores are manually entered rather than automatically calculated from test results.

**Decision Rationale**:
- Automatic scoring requires defining complex heuristics
- Manual scores allow expert judgment and domain knowledge
- Tests capture execution data that can inform future automation
- Can be enhanced later without breaking changes

### Trade-off 3: Text vs. Rich Text for Prompt Content

**Trade-off**: Using textarea (plain text) instead of rich text editor for prompt content.

**Decision Rationale**:
- Prompts are typically sent as plain text to LLMs
- Rich text formatting would need to be stripped for API usage
- Plain text is simpler and more predictable
- Rich text would add unnecessary complexity

## Migration Plan

### Phase 1: Database Schema (Non-breaking)

1. Create migration: `pnpm payload migrate:create add_prompt_collections`
2. Run migration: `pnpm payload migrate`
3. Verify tables created: `prompts`, `prompt_tests`

### Phase 2: Code Implementation (Non-breaking)

1. Create collection files (doesn't affect existing code)
2. Register collections in `payload.config.ts`
3. Update plugin configurations
4. Generate types: `pnpm generate:types`
5. Generate import map: `pnpm generate:importmap`

### Phase 3: Seed Data (Non-breaking)

1. Create seed data files
2. Update `src/endpoints/seed/index.ts`
3. Test seeding: Access `/api/seed` endpoint

### Phase 4: Testing (Non-breaking)

1. Unit tests for access control functions
2. Integration tests for CRUD operations
3. Manual testing in admin panel
4. Verify Search plugin integration
5. Verify SEO plugin integration

### Rollback Strategy

All changes are additive (new collections, no modifications to existing):
- **Code rollback**: Remove new collection files and revert config changes
- **Database rollback**: Drop `prompts` and `prompt_tests` tables
- **No data loss**: Existing collections completely unaffected

## Open Questions

1. **Should we add indexes on `modelScores` for query performance?**
   - **Decision**: Defer until performance testing reveals need
   - **Rationale**: Premature optimization; PostgreSQL JSON queries may be sufficient

2. **Should `inputVariables` use a more structured format than JSON?**
   - **Decision**: Keep as JSON for flexibility
   - **Rationale**: Variables can be complex (nested objects, arrays); JSON handles this well

3. **Should we add a `prompt template` feature with variable substitution?**
   - **Decision**: Out of scope for initial implementation
   - **Rationale**: Adds complexity; current design stores prompts as-is with variables in separate field

4. **How should we handle model ID formatting/parsing?**
   - **Decision**: Free-form text with guidance in admin description
   - **Rationale**: Too many model providers and formats to codify; future Models collection will solve this

5. **Should tests support multiple execution attempts?**
   - **Decision**: Single execution record per test initially
   - **Rationale**: Adds complexity; can be enhanced later by adding `executions` array if needed

## Implementation Notes

### Security Considerations

- **Local API access**: Always use `overrideAccess: false` when passing `user` object
- **Transaction safety**: Pass `req` to nested operations in hooks
- **JSON validation**: Validate JSON fields in `beforeValidate` hooks
- **Input sanitization**: Payload handles this, but be mindful of XSS in prompt content

### Performance Considerations

- **Array queries**: Be mindful of query patterns when filtering by `modelScores`
- **Relationship depth**: Set appropriate `depth` when fetching prompts with tests
- **Search indexing**: Monitor search plugin performance with large prompt datasets

### Testing Strategy

- **Unit tests**: Access control functions, validation logic
- **Integration tests**: CRUD operations, relationship queries
- **E2E tests**: Admin panel workflows (create, edit, delete prompts/tests)
- **Performance tests**: Query performance with large datasets (future)
