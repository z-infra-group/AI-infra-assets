import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { LlmModel } from '../../../payload-types'

export const revalidateModel: CollectionAfterChangeHook<LlmModel> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/llm-models/${doc.slug}`

      payload.logger.info(`Revalidating LLM model at path: ${path}`)

      revalidatePath(path)
      revalidateTag('llm-models-sitemap')
    }

    // If the model was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/llm-models/${previousDoc.slug}`

      payload.logger.info(`Revalidating old LLM model at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('llm-models-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<LlmModel> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/llm-models/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('llm-models-sitemap')
  }

  return doc
}
