# Modular Seed System

This directory contains a modular seed system that allows you to seed different parts of the database independently.

## Modules

### 1. Core Data (`core`)
**Endpoint**: `POST /next/seed-modules/core`
**Seeds**: Users, categories, media
**Description**: Seeds the demo author user, category taxonomy, and sample media files
**Dependencies**: None (must be seeded first)

### 2. Content (`content`)
**Endpoint**: `POST /next/seed-modules/content`
**Seeds**: Pages, posts
**Description**: Seeds the home page, blog posts with related posts, and other content
**Dependencies**: Core data (users, categories, media)

### 3. Prompts (`prompts`)
**Endpoint**: `POST /next/seed-modules/prompts`
**Seeds**: Prompts, prompt tests
**Description**: Seeds sample prompts and their test cases
**Dependencies**: Core data (demo author)

### 4. LLM Providers & Models (`llm`)
**Endpoint**: `POST /next/seed-modules/llm`
**Seeds**: LLM providers, LLM models
**Description**: Seeds OpenAI and Anthropic providers with their models
**Dependencies**: Core data (demo author)

### 5. Globals & Forms (`globals`)
**Endpoint**: `POST /next/seed-modules/globals`
**Seeds**: Header, footer, contact form, contact page
**Description**: Seeds global navigation and forms
**Dependencies**: None

### 6. All (`all`)
**Endpoint**: `POST /next/seed-modules/all` (or legacy `POST /next/seed`)
**Seeds**: Everything
**Description**: Seeds all modules in the correct dependency order

## Usage

### Via Admin Panel

After logging into the admin panel at `/admin`, you'll see a "Seed Your Database" section with multiple buttons:

1. **Seed All** - Seeds everything at once
2. **Core Data** - Seeds users, categories, media
3. **Content** - Seeds pages and posts
4. **Prompts** - Seeds prompts and prompt tests
5. **LLM Providers & Models** - Seeds LLM providers and models
6. **Globals & Forms** - Seeds header, footer, and forms

### Programmatic Usage

```typescript
import { seedCoreData } from '@/endpoints/seed/modules/core'
import { seedContent } from '@/endpoints/seed/modules/content'
import { seedPrompts } from '@/endpoints/seed/modules/prompts'
import { seedLLM } from '@/endpoints/seed/modules/llm'
import { seedGlobals } from '@/endpoints/seed/modules/globals'

// Seed core data first
const coreData = await seedCoreData({ payload, req })

// Then seed dependent modules
await seedContent({
  payload,
  req,
  ...coreData
})

await seedPrompts({
  payload,
  req,
  demoAuthor: coreData.demoAuthor
})

await seedLLM({
  payload,
  req,
  demoAuthor: coreData.demoAuthor
})

await seedGlobals({ payload, req })
```

## API Endpoints

Each module exposes a POST endpoint:

- `/next/seed-modules/core`
- `/next/seed-modules/content`
- `/next/seed-modules/prompts`
- `/next/seed-modules/llm`
- `/next/seed-modules/globals`
- `/next/seed-modules/all`

All endpoints require authentication and return JSON responses:

**Success**:
```json
{
  "success": true,
  "message": "Module seeded successfully"
}
```

**Error**:
```json
{
  "error": "Error message"
}
```

## Dependency Flow

```
Core Data (users, categories, media)
    ├─→ Content (pages, posts)
    ├─→ Prompts (prompts, prompt-tests)
    └─→ LLM (providers, models)
    └─→ Globals & Forms (header, footer, forms, contact page)
```

## Development

When adding new seed modules:

1. Create a new file in `modules/` directory
2. Export the seed function from `modules/index.ts`
3. Create a corresponding API route in `src/app/(frontend)/next/seed-modules/<module>/route.ts`
4. Add the module to the `SeedButton` component in `src/components/BeforeDashboard/SeedButton/index.tsx`

## Notes

- All modules disable revalidation during seeding (`context: { disableRevalidate: true }`)
- Core data module must be seeded before dependent modules
- The "All" option executes modules in dependency order automatically
- Each module can be seeded independently for faster, targeted updates
