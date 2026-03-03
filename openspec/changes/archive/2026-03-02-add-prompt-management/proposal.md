# Proposal: Add Prompt Management System

## Why

The AI Infrastructure Assets project needs a centralized system to manage LLM prompts used across applications. Currently, prompts are likely hardcoded or scattered across codebases, making it difficult to version control, test, and optimize them for different models. This change enables users to create, manage, and test prompts with proper access control, model compatibility scoring, and comprehensive test tracking—all within the existing Payload CMS admin interface.

## What Changes

- **New Collection: `Prompts`** - A full-featured collection for managing LLM prompts with:
  - User-owned private and public prompts
  - Multi-model compatibility scoring
  - Configurable LLM parameters (temperature, max_tokens, etc.)
  - Extensible JSON configuration for advanced parameters
  - Tag-based organization (with `prompt:` prefix)
  - Draft/versioning support via Payload's built-in features

- **New Collection: `PromptTests`** - A test case and results management system with:
  - Relationship to Prompts collection
  - Test input/output tracking
  - Execution metadata (timing, tokens, cost)
  - Scoring and verification workflow
  - Detailed test configuration override

- **Access Control** - User-specific permissions:
  - Authenticated users can create prompts
  - Public/private visibility toggle
  - Users can see published prompts + their own drafts

- **Plugin Integration** - Enable Search and SEO plugins for prompts

- **Seed Data** - Create seed endpoints following existing patterns for development

## Capabilities

### New Capabilities

- **`prompt-management`**: Core CRUD operations for LLM prompts with user ownership, public/private visibility, model compatibility scoring, and configurable parameters. Includes tag-based organization and draft/versioning support.

- **`prompt-testing`**: Test case management for prompts with input/output tracking, execution metadata (timing, tokens, cost), scoring, and human verification workflow. Tests are linked to prompts and support custom LLM parameter overrides.

- **`model-compatibility-scoring`**: Multi-model compatibility tracking per prompt, storing model IDs and 0-1 compatibility scores. Designed for future integration with a Model Management collection.

### Modified Capabilities

*None - This is a net-new feature addition that doesn't modify existing capability requirements.*

## Impact

### Code Changes

- **New Files**:
  - `src/collections/Prompts/index.ts` - Prompts collection configuration
  - `src/collections/Prompts/hooks/revalidatePrompt.ts` - Revalidation hooks
  - `src/collections/PromptTests/index.ts` - PromptTests collection configuration
  - `src/collections/PromptTests/hooks/revalidatePromptTest.ts` - Revalidation hooks
  - `src/endpoints/seed/prompt-1.ts` - Sample prompt seed data
  - `src/endpoints/seed/prompt-test-1.ts` - Sample test seed data

- **Modified Files**:
  - `src/payload.config.ts` - Register new collections
  - `src/plugins/index.ts` - Add prompts to Search and SEO plugins
  - `src/endpoints/seed/index.ts` - Add seed data logic

### Database Schema

- New tables: `prompts`, `prompt_tests`
- New relationships: prompts ↔ users, prompt_tests ↔ prompts ↔ users

### Dependencies

- No new external dependencies (uses existing Payload features)
- Leverages existing: `@payloadcms/plugin-search`, `@payloadcms/plugin-seo`

### Systems

- Admin panel: New "Prompts" and "Prompt Tests" collection views
- API: New REST/GraphQL endpoints for both collections
- Search: Prompts indexed in admin search
- Frontend: No immediate frontend changes (admin-only initially)

### Migration

- Run `pnpm payload migrate:create` after schema changes
- Run `pnpm generate:types` to update TypeScript types
- Run `pnpm generate:importmap` to update component import map
