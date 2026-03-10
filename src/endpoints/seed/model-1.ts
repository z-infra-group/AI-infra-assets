import type { RequiredDataFromCollectionSlug } from 'payload'

export type ModelArgs = {
  provider: any
}

export const model1: (args: ModelArgs) => RequiredDataFromCollectionSlug<'llm-models'> = ({
  provider,
}) => ({
  displayName: 'GPT-4',
  modelId: 'gpt-4',
  description: 'OpenAI\'s most capable language model, optimized for complex reasoning and creative tasks.',
  provider: provider.id, // Optional reference for catalog purposes
  contextLength: 8192,
  maxTokens: 4096,
  supportsStreaming: true,
  supportsFunctionCalling: true,
  costPerMillTokens: 0.03,
  costPerInputToken: 0.00003,
  costPerOutputToken: 0.00006,
  tags: [
    { tag: 'model:gpt' },
    { tag: 'model:reasoning' },
    { tag: 'model:multimodal' },
  ],
  capabilities: [
    { capability: 'vision' },
    { capability: 'code' },
    { capability: 'reasoning' },
    { capability: 'function-calling' },
  ],
  _status: 'published',
})
