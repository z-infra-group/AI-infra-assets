import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { seedPrompts } from '@/endpoints/seed/modules/prompts'

export const maxDuration = 30

type PromptsSeedRequest = {
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

    const body = await request.json() as PromptsSeedRequest

    if (!body.demoAuthor) {
      return new Response('Missing demoAuthor. Please seed core data first.', { status: 400 })
    }

    await seedPrompts({
      payload,
      req: payloadReq,
      demoAuthor: body.demoAuthor,
    })

    return Response.json({
      success: true,
      message: 'Prompts seeded successfully (prompts, prompt-tests)',
    })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding prompts' })
    return new Response('Error seeding prompts.', { status: 500 })
  }
}
