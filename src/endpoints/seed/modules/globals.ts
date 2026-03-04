/**
 * Globals and Forms seeding - header, footer, contact form, contact page
 */
import type { Payload, PayloadRequest } from 'payload'
import { contactForm as contactFormData } from '../contact-form'
import { contact as contactPageData } from '../contact-page'

export async function seedGlobals({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
  demoAuthor?: any
}): Promise<void> {
  payload.logger.info('--- Seeding globals and forms...')

  // Seed header and footer with navigation
  payload.logger.info('— Seeding header...')

  const headerNavItems = [
    {
      link: {
        type: 'custom',
        label: 'Posts',
        url: '/posts',
      },
    },
  ]

  const footerNavItems = [
    {
      link: {
        type: 'custom',
        label: 'Admin',
        url: '/admin',
      },
    },
    {
      link: {
        type: 'custom',
        label: 'Source Code',
        newTab: true,
        url: 'https://github.com/payloadcms/payload/tree/main/templates/website',
      },
    },
    {
      link: {
        type: 'custom',
        label: 'Payload',
        newTab: true,
        url: 'https://payloadcms.com/',
      },
    },
  ]

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: headerNavItems,
      },
      depth: 0,
      context: {
        disableRevalidate: true,
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: footerNavItems,
      },
      depth: 0,
      context: {
        disableRevalidate: true,
      },
    }),
  ])

  // Seed contact form
  payload.logger.info('— Seeding contact form...')

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
  })

  // Seed contact page
  payload.logger.info('— Seeding contact page...')

  await payload.create({
    collection: 'pages',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: contactPageData({
      contactForm: contactForm,
    }),
  })

  payload.logger.info('✓ Globals and forms seeded')
}
