import type { RequiredDataFromCollectionSlug } from 'payload'

export type ModelArgs = {
  provider: any
}

export const model2: (args: ModelArgs) => RequiredDataFromCollectionSlug<'llm-models'> = ({
  provider,
}) => ({
  displayName: 'Claude 3 Opus',
  modelId: 'claude-3-opus-20240229',
  description: 'Anthropic\'s most powerful model for complex reasoning, nuance, and creativity.',
  provider: provider.id, // Optional reference for catalog purposes
  contextLength: 200000,
  maxTokens: 4096,
  supportsStreaming: true,
  supportsFunctionCalling: true,
  costPerMillTokens: 0.015,
  costPerInputToken: 0.000015,
  costPerOutputToken: 0.000075,
  tags: [
    { tag: 'model:claude' },
    { tag: 'model:reasoning' },
    { tag: 'model:analysis' },
  ],
  capabilities: [
    { capability: 'vision' },
    { capability: 'code' },
    { capability: 'reasoning' },
    { capability: 'analysis' },
  ],
  _status: 'published',
})
