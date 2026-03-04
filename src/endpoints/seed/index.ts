import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'
import { prompt1 } from './prompt-1'
import { promptTest1 } from './prompt-test-1'
import { provider1 } from './provider-1'
import { provider2 } from './provider-2'
import { model1 } from './model-1'
import { model2 } from './model-2'

// Export modular seed functions
export { seedCoreData } from './modules/core'
export { seedContent } from './modules/content'
export { seedPrompts } from './modules/prompts'
export { seedLLM } from './modules/llm'
export { seedGlobals } from './modules/globals'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'prompts',
  'prompt-tests',
  'llm-providers',
  'llm-models',
  'forms',
  'form-submissions',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

const categories = ['Technology', 'News', 'Finance', 'Design', 'Software', 'Engineering']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // Clear existing data
  payload.logger.info(`— Clearing collections and globals...`)

  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  // Import modular seed functions
  const { seedCoreData } = await import('./modules/core')
  const { seedContent } = await import('./modules/content')
  const { seedPrompts } = await import('./modules/prompts')
  const { seedLLM } = await import('./modules/llm')
  const { seedGlobals } = await import('./modules/globals')

  // Seed core data (users, categories, media)
  const coreData = await seedCoreData({ payload, req })

  // Seed content (pages, posts, home, contact)
  await seedContent({
    payload,
    req,
    demoAuthor: coreData.demoAuthor,
    image1Doc: coreData.image1Doc,
    image2Doc: coreData.image2Doc,
    image3Doc: coreData.image3Doc,
    imageHomeDoc: coreData.imageHomeDoc,
  })

  // Seed prompts
  await seedPrompts({
    payload,
    req,
    demoAuthor: coreData.demoAuthor,
  })

  // Seed LLM providers and models
  await seedLLM({
    payload,
    req,
    demoAuthor: coreData.demoAuthor,
  })

  // Seed globals and forms
  await seedGlobals({ payload, req })

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
