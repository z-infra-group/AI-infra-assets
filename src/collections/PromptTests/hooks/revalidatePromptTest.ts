import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { PromptTest } from '../../../payload-types'

export const revalidatePromptTest: CollectionAfterChangeHook<PromptTest> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/prompt-tests/${doc.slug}`

      payload.logger.info(`Revalidating prompt test at path: ${path}`)

      revalidatePath(path)
      revalidateTag('prompt-tests-sitemap')
    }

    // If the test was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/prompt-tests/${previousDoc.slug}`

      payload.logger.info(`Revalidating old prompt test at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('prompt-tests-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<PromptTest> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/prompt-tests/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('prompt-tests-sitemap')
  }

  return doc
}
