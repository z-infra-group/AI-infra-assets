# Implementation Tasks: Prompt Management System

## 1. Prompts Collection

- [x] 1.1 Create Prompts collection directory structure at `src/collections/Prompts/`
- [x] 1.2 Create `src/collections/Prompts/index.ts` with collection config skeleton
- [x] 1.3 Add basic fields: title (text), description (text), content (textarea)
- [x] 1.4 add ownership fields: author (relationship to users), isPublic (checkbox)
- [x] 1.5 Add modelScores array field with model (text) and score (number, 0-1)
- [x] 1.6 Add LLM parameter fields: temperature, maxTokens, topP, frequencyPenalty, presencePenalty
- [x] 1.7 Add extraConfig JSON field for extensibility
- [x] 1.8 Add tags array field for organization
- [x] 1.9 Add slugField() for URL-friendly identifiers
- [x] 1.10 Add publishedAt date field with auto-set hook
- [x] 1.11 Configure access control: create/update/delete (authenticated), read (authenticatedOrPublished)
- [x] 1.12 Configure versions/drafts support with autosave and schedulePublish
- [x] 1.13 Set admin configuration: defaultColumns, useAsTitle, enableRichTextLink

## 2. PromptTests Collection

- [x] 2.1 Create PromptTests collection directory structure at `src/collections/PromptTests/`
- [x] 2.2 Create `src/collections/PromptTests/index.ts` with collection config skeleton
- [x] 2.3 Add basic fields: title (text), description (textarea)
- [x] 2.4 Add relationship fields: prompt (relationship to prompts), author (relationship to users)
- [x] 2.5 Add test data fields: inputVariables (JSON), expectedOutput (textarea), actualOutput (textarea with restricted update access)
- [x] 2.6 Add test configuration fields: testConfig (JSON), modelUnderTest (text)
- [x] 2.7 Add execution status field: status (select: pending, running, completed, failed)
- [x] 2.8 Add execution metadata fields: executedAt (date), executionTime (number), tokensUsed (number), cost (number)
- [x] 2.9 Add results fields: score (number, 0-100), feedback (textarea), isVerified (checkbox)
- [x] 2.10 Add slugField() for URL-friendly identifiers
- [x] 2.11 Configure access control: create/update/delete (authenticated), read (authenticatedOrPublished)
- [x] 2.12 Configure versions/drafts support with autosave and schedulePublish
- [x] 2.13 Set admin configuration: defaultColumns, useAsTitle

## 3. Hooks Implementation

- [x] 3.1 Create `src/collections/Prompts/hooks/` directory
- [x] 3.2 Create `src/collections/Prompts/hooks/revalidatePrompt.ts` with revalidatePrompt function
- [x] 3.3 Create `src/collections/Prompts/hooks/revalidatePrompt.ts` with revalidateDelete function
- [x] 3.4 Register revalidatePrompt and revalidateDelete in Prompts collection hooks
- [x] 3.5 Create `src/collections/PromptTests/hooks/` directory
- [x] 3.6 Create `src/collections/PromptTests/hooks/revalidatePromptTest.ts` with revalidatePromptTest function
- [x] 3.7 Create `src/collections/PromptTests/hooks/revalidatePromptTest.ts` with revalidateDelete function
- [x] 3.8 Register revalidatePromptTest and revalidateDelete in PromptTests collection hooks

## 4. Configuration Updates

- [x] 4.1 Open `src/payload.config.ts` and add Prompts import
- [x] 4.2 Add PromptTests import to `src/payload.config.ts`
- [x] 4.3 Add Prompts to collections array in `src/payload.config.ts`
- [x] 4.4 Add PromptTests to collections array in `src/payload.config.ts`
- [x] 4.5 Verify no syntax errors in updated config file

## 5. Plugin Integration

- [x] 5.1 Open `src/plugins/index.ts`
- [x] 5.2 Add 'prompts' to searchPlugin collections array
- [x] 5.3 Add 'prompts' to seoPlugin collections array
- [x] 5.4 Verify plugin configurations are correct

## 6. Seed Data Implementation

- [x] 6.1 Create `src/endpoints/seed/prompt-1.ts` with sample prompt data
- [x] 6.2 Define PromptArgs type with author dependency
- [x] 6.3 Implement prompt1 function with all required fields
- [x] 6.4 Create `src/endpoints/seed/prompt-test-1.ts` with sample test data
- [x] 6.5 Define PromptTestArgs type with prompt and author dependencies
- [x] 6.6 Implement promptTest1 function with all required fields
- [x] 6.7 Open `src/endpoints/seed/index.ts`
- [x] 6.8 Add 'prompts' to collections array
- [x] 6.9 Add 'prompt-tests' to collections array
- [x] 6.10 Add import statements for prompt1 and promptTest1
- [x] 6.11 Implement prompt seeding logic after posts
- [x] 6.12 Implement prompt-test seeding logic after prompts

## 7. Type Generation

- [x] 7.1 Run `pnpm generate:types` to update TypeScript types
- [x] 7.2 Verify no TypeScript errors in generated types
- [x] 7.3 Run `pnpm generate:importmap` to update component import map
- [x] 7.4 Verify no errors in import map generation

## 8. Database Migration

- [x] 8.1 Create database migration: `pnpm payload migrate:create add_prompt_collections`
- [ ] 8.2 Review generated migration file for correctness
- [ ] 8.3 Run migration: `pnpm payload migrate`
- [ ] 8.4 Verify tables created: prompts and prompt_tests
- [ ] 8.5 Verify relationships created in database

## 9. Development Testing

- [ ] 9.1 Start development server: `pnpm dev`
- [ ] 9.2 Access admin panel at `/admin`
- [ ] 9.3 Navigate to Prompts collection
- [ ] 9.4 Create a new prompt with all fields populated
- [ ] 9.5 Save prompt as draft and verify only visible to author
- [ ] 9.6 Publish prompt with isPublic=true and verify visibility
- [ ] 9.7 Add model scores and verify array storage
- [ ] 9.8 Configure LLM parameters and verify storage
- [ ] 9.9 Add tags with "prompt:" prefix
- [ ] 9.10 Navigate to PromptTests collection
- [ ] 9.11 Create a new test linked to the prompt
- [ ] 9.12 Populate test input/output fields
- [ ] 9.13 Execute test and update status to completed
- [ ] 9.14 Add execution metadata (time, tokens, cost)
- [ ] 9.15 Score test and mark as verified

## 10. Seed Data Testing

- [ ] 10.1 Access seed endpoint: `/api/seed`
- [ ] 10.2 Verify prompt seed data created successfully
- [ ] 10.3 Verify prompt-test seed data created successfully
- [ ] 10.4 Verify relationships are correct (author, prompt)
- [ ] 10.5 Check seeded prompt appears in admin panel
- [ ] 10.6 Check seeded test appears in admin panel

## 11. Search Integration Testing

- [ ] 11.1 Use admin search to find prompt by title
- [ ] 11.2 Use admin search to find prompt by content
- [ ] 11.3 Use admin search to find prompt by tags
- [ ] 11.4 Verify search results are relevant
- [ ] 11.5 Test search filtering by model compatibility

## 12. Access Control Testing

- [ ] 12.1 Create test user with different credentials
- [ ] 12.2 Login as test user and verify can't see other users' private prompts
- [ ] 12.3 Verify test user can see published public prompts
- [ ] 12.4 Attempt to modify another user's prompt (expect 403)
- [ ] 12.5 Test authenticated user sees all own prompts (draft + published)
- [ ] 12.6 Test unauthenticated user sees only published public prompts
- [ ] 12.7 Verify same access patterns for PromptTests

## 13. Code Quality Verification

- [ ] 13.1 Run TypeScript compiler: `tsc --noEmit`
- [ ] 13.2 Verify no TypeScript errors
- [ ] 13.3 Run linter: `pnpm lint`
- [ ] 13.4 Fix any linting issues
- [ ] 13.5 Verify code follows existing project patterns
- [ ] 13.6 Check all imports are correct and paths are valid

## 14. Documentation

- [ ] 14.1 Update CLAUDE.md with Prompts collection information
- [ ] 14.2 Update CLAUDE.md with PromptTests collection information
- [ ] 14.3 Document access control patterns used
- [ ] 14.4 Document model compatibility scoring approach
- [ ] 14.5 Add examples of querying prompts via API
- [ ] 14.6 Document seed data usage

## 15. Final Verification

- [ ] 15.1 Stop dev server and restart to ensure clean startup
- [ ] 15.2 Verify no console errors on startup
- [ ] 15.3 Check all collections appear in admin sidebar
- [ ] 15.4 Verify SEO fields appear in Prompts collection
- [ ] 15.5 Verify revalidation works when publishing/unpublishing
- [ ] 15.6 Test cascading delete: delete prompt and verify tests are deleted
- [ ] 15.7 Verify database schema matches design document
- [ ] 15.8 Confirm all requirements from specs are implemented
- [ ] 15.9 Run full test suite if available: `pnpm test`
- [ ] 15.10 Prepare for production: ensure environment variables are set
