import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { seedLLM } from '@/endpoints/seed/modules/llm'

export const maxDuration = 30

type LLMSeedRequest = {
  demoAuthor?: any
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

    const body = await request.json() as LLMSeedRequest

    if (!body.demoAuthor) {
      return new Response('Missing demoAuthor. Please seed core data first.', { status: 400 })
    }

    await seedLLM({
      payload,
      req: payloadReq,
      demoAuthor: body.demoAuthor,
    })

    return Response.json({
      success: true,
      message: 'LLM providers and models seeded successfully',
    })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding LLM data' })
    return new Response('Error seeding LLM data.', { status: 500 })
  }
}
