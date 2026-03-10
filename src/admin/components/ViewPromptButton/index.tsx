'use client'

import { Button } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function ViewPromptButton() {
  const { id: testId } = useDocumentInfo()
  const [promptId, setPromptId] = useState<number | null>(null)

  useEffect(() => {
    if (!testId) return

    // Fetch the current document to get the prompt relationship
    const fetchPromptId = async () => {
      try {
        const response = await fetch(`/api/prompt-tests/${testId}?depth=0`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          // The prompt field may be an object with value property or just an ID
          const promptValue = data.prompt
          const id = promptValue && typeof promptValue === 'object'
            ? promptValue.value
            : promptValue

          if (id) {
            setPromptId(id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch prompt relationship:', error)
      }
    }

    fetchPromptId()
  }, [testId])

  if (!promptId) {
    return null
  }

  const handleClick = () => {
    window.location.href = `/admin/collections/prompts/${promptId}`
  }

  return (
    <Button onClick={handleClick} type="button">
      View Prompt →
    </Button>
  )
}
