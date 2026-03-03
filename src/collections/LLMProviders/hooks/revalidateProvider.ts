import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { LlmProvider } from '../../../payload-types'

export const revalidateProvider: CollectionAfterChangeHook<LlmProvider> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/llm-providers/${doc.slug}`

      payload.logger.info(`Revalidating LLM provider at path: ${path}`)

      revalidatePath(path)
      revalidateTag('llm-providers-sitemap')
    }

    // If the provider was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/llm-providers/${previousDoc.slug}`

      payload.logger.info(`Revalidating old LLM provider at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('llm-providers-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<LlmProvider> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/llm-providers/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('llm-providers-sitemap')
  }

  return doc
}
