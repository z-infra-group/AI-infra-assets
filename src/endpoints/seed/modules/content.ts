/**
 * Content seeding - pages, posts, home, contact
 */
import type { Payload, PayloadRequest } from 'payload'
import { post1 } from '../post-1'
import { post2 } from '../post-2'
import { post3 } from '../post-3'
import { home } from '../home'
import { contact as contactPageData } from '../contact-page'

interface SeedContentArgs {
  payload: Payload
  req: PayloadRequest
  demoAuthor: any
  image1Doc: any
  image2Doc: any
  image3Doc: any
  imageHomeDoc: any
}

export async function seedContent({
  payload,
  req,
  demoAuthor,
  image1Doc,
  image2Doc,
  image3Doc,
  imageHomeDoc,
}: SeedContentArgs): Promise<void> {
  payload.logger.info('--- Seeding content (pages, posts, home, contact)...')

  // Seed posts
  payload.logger.info('— Seeding posts...')

  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })

  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })

  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
  })

  // Update posts with related posts
  await Promise.all([
    payload.update({
      id: post1Doc.id,
      collection: 'posts',
      data: {
        relatedPosts: [post2Doc.id, post3Doc.id],
      },
    }),
    payload.update({
      id: post2Doc.id,
      collection: 'posts',
      data: {
        relatedPosts: [post1Doc.id, post3Doc.id],
      },
    }),
    payload.update({
      id: post3Doc.id,
      collection: 'posts',
      data: {
        relatedPosts: [post1Doc.id, post2Doc.id],
      },
    }),
  ])

  // Seed home page
  payload.logger.info('— Seeding home page...')

  await payload.create({
    collection: 'pages',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: home({
      heroImage: imageHomeDoc,
      metaImage: image2Doc,
    }),
  })

  payload.logger.info('✓ Content seeded')
}
