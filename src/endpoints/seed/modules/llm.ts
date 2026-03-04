/**
 * LLM Provider and Models seeding - providers and models
 */
import type { Payload, PayloadRequest } from 'payload'
import { provider1 } from '../provider-1'
import { provider2 } from '../provider-2'
import { model1 } from '../model-1'
import { model2 } from '../model-2'

interface SeedLLMArgs {
  payload: Payload
  req: PayloadRequest
  demoAuthor: any
}

export async function seedLLM({ payload, req, demoAuthor }: SeedLLMArgs): Promise<void> {
  payload.logger.info('--- Seeding LLM providers...')

  const provider1Doc = await payload.create({
    collection: 'llm-providers',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: provider1({ owner: demoAuthor }),
  })

  const provider2Doc = await payload.create({
    collection: 'llm-providers',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: provider2({ owner: demoAuthor }),
  })

  payload.logger.info('— Seeding LLM models...')

  await Promise.all([
    payload.create({
      collection: 'llm-models',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: model1({
        provider: provider1Doc,
      }),
    }),
    payload.create({
      collection: 'llm-models',
      depth: 0,
      context: {
        disableRevalidate: true,
      },
      data: model2({
        provider: provider2Doc,
      }),
    }),
  ])

  payload.logger.info('✓ LLM providers and models seeded')
}
