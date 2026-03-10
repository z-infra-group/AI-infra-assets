import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

import type { LlmProvider } from '../../../payload-types'

/**
 * Revalidate LLM providers cache after changes.
 * Note: Admin-only collections don't need path revalidation, only tag-based cache invalidation.
 */
export const revalidateProvider: CollectionAfterChangeHook<LlmProvider> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate && doc._status === 'published') {
    payload.logger.info(`Revalidating LLM provider: ${doc.displayName}`)

    // Revalidate provider list cache
    revalidateTag('llm-providers')
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<LlmProvider> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    // Revalidate provider list cache
    revalidateTag('llm-providers')
  }

  return doc
}
