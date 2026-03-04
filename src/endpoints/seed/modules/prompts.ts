/**
 * Prompt Management seeding - prompts and prompt tests
 */
import type { Payload, PayloadRequest } from 'payload'
import { prompt1 } from '../prompt-1'
import { promptTest1 } from '../prompt-test-1'

interface SeedPromptsArgs {
  payload: Payload
  req: PayloadRequest
  demoAuthor: any
}

export async function seedPrompts({ payload, req, demoAuthor }: SeedPromptsArgs): Promise<void> {
  payload.logger.info('--- Seeding prompts...')

  const prompt1Doc = await payload.create({
    collection: 'prompts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: prompt1({ author: demoAuthor }),
  })

  payload.logger.info('— Seeding prompt tests...')

  await payload.create({
    collection: 'prompt-tests',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: promptTest1({
      prompt: prompt1Doc,
      author: demoAuthor,
    }),
  })

  payload.logger.info('✓ Prompts seeded')
}
