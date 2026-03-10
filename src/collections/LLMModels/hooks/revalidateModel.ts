import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

import type { LlmModel } from '../../../payload-types'

/**
 * Revalidate LLM models cache after changes.
 * Note: Admin-only collections don't need path revalidation, only tag-based cache invalidation.
 */
export const revalidateModel: CollectionAfterChangeHook<LlmModel> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate && doc._status === 'published') {
    payload.logger.info(`Revalidating LLM model: ${doc.displayName}`)

    // Revalidate model list cache
    revalidateTag('llm-models')
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<LlmModel> = ({
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    // Revalidate model list cache
    revalidateTag('llm-models')
  }
}
