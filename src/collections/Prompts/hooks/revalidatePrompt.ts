import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Prompt } from '../../../payload-types'

export const revalidatePrompt: CollectionAfterChangeHook<Prompt> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/prompts/${doc.slug}`

      payload.logger.info(`Revalidating prompt at path: ${path}`)

      revalidatePath(path)
      revalidateTag('prompts-sitemap')
    }

    // If the prompt was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/prompts/${previousDoc.slug}`

      payload.logger.info(`Revalidating old prompt at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('prompts-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Prompt> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/prompts/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('prompts-sitemap')
  }

  return doc
}
