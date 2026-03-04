import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { seedCoreData } from '@/endpoints/seed/modules/core'

export const maxDuration = 30

export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const payloadReq = await createLocalReq({ user }, payload)

    await seedCoreData({ payload, req: payloadReq })

    return Response.json({
      success: true,
      message: 'Core data seeded successfully (users, categories, media)',
    })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding core data' })
    return new Response('Error seeding core data.', { status: 500 })
  }
}
