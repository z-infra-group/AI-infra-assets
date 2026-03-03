import type { RequiredDataFromCollectionSlug } from 'payload'

export type ProviderArgs = {
  owner: any
}

export const provider1: (args: ProviderArgs) => RequiredDataFromCollectionSlug<'llm-providers'> = ({
  owner,
}) => ({
  displayName: 'OpenAI',
  slug: 'openai',
  providerType: 'openai',
  icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png',
  authType: 'api-key',
  apiKey: 'sk-proj-mock-key-replace-in-production',
  apiEndpoint: 'https://api.openai.com/v1',
  apiVersion: '2024-01-01',
  region: 'us',
  models: [
    {
      modelId: 'gpt-4',
      displayName: 'GPT-4',
      maxTokens: 8192,
    },
    {
      modelId: 'gpt-4-turbo',
      displayName: 'GPT-4 Turbo',
      maxTokens: 128000,
    },
    {
      modelId: 'gpt-3.5-turbo',
      displayName: 'GPT-3.5 Turbo',
      maxTokens: 16385,
    },
  ],
  rateLimit: 10000,
  rateLimitWindow: 60,
  quota: 1000000,
  costPerMillTokens: 0.03,
  enabled: true,
  tags: [
    { tag: 'provider:openai' },
    { tag: 'provider:gpt' },
  ],
  owner: owner.id,
  _status: 'published',
})
