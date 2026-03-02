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
│   └── authenticatedOrPublished.ts  # Mixed access
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
- **Media**: Upload management with focal points and resizing
- **Categories**: Nested taxonomy system
- **Users**: Role-based authentication (admin, editor, user)

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
- **Public**: Published content only
- **Authenticated**: Published + own drafts
- **Admin**: Full access to all content

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

## Environment Variables

```bash
DATABASE_URL=postgresql://127.0.0.1:5432/your-database-name
PAYLOAD_SECRET=your-secret-key-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
CRON_SECRET=your-cron-secret-here
PREVIEW_SECRET=your-preview-secret-here
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
