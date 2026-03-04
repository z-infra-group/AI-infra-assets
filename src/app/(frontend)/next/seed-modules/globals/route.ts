import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { seedGlobals } from '@/endpoints/seed/modules/globals'

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

    await seedGlobals({ payload, req: payloadReq })

    return Response.json({
      success: true,
      message: 'Globals and forms seeded successfully',
    })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding globals' })
    return new Response('Error seeding globals.', { status: 500 })
  }
}
