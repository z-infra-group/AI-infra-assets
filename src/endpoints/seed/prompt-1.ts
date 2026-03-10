import type { RequiredDataFromCollectionSlug } from 'payload'

export type PromptArgs = {
  author: any
}

export const prompt1: (args: PromptArgs) => RequiredDataFromCollectionSlug<'prompts'> = ({
  author,
}) => ({
  title: 'Creative Writing Assistant',
  description: 'A versatile prompt for creative writing tasks including storytelling, character development, and plot ideation',
  content: `You are a creative writing assistant. Help the user with various writing tasks including storytelling, character development, and plot ideation.

Guidelines:
- Be creative and imaginative
- Provide constructive feedback
- Offer multiple perspectives when appropriate
- Maintain a supportive tone
- Encourage the user's creative voice`,
  slug: 'creative-writing-assistant',
  isPublic: true,
  author: author.id,
  modelScores: [
    {
      model: 'gpt-4',
      score: 0.95,
    },
    {
      model: 'claude-3-opus-20240229',
      score: 0.92,
    },
  ],
  temperature: 0.8,
  maxTokens: 2000,
  topP: 0.95,
  tags: [
    { tag: 'prompt:creative-writing' },
    { tag: 'prompt:assistant' },
    { tag: 'prompt:storytelling' },
  ],
  _status: 'published',
})
