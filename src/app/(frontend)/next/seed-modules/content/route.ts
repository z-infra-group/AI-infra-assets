import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { seedContent } from '@/endpoints/seed/modules/content'

export const maxDuration = 30

type ContentSeedRequest = {
  coreData?: {
    demoAuthor: any
    image1Doc: any
    image2Doc: any
    image3Doc: any
    imageHomeDoc: any
  }
}

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const payloadReq = await createLocalReq({ user }, payload)

    const body = await request.json() as ContentSeedRequest

    if (!body.coreData) {
      return new Response('Missing coreData. Please seed core data first.', { status: 400 })
    }

    await seedContent({
      payload,
      req: payloadReq,
      ...body.coreData,
    })

    return Response.json({
      success: true,
      message: 'Content seeded successfully (pages, posts)',
    })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding content' })
    return new Response('Error seeding content.', { status: 500 })
  }
}
