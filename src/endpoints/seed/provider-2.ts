import type { RequiredDataFromCollectionSlug } from 'payload'

export type ProviderArgs = {
  owner: any
}

export const provider2: (args: ProviderArgs) => RequiredDataFromCollectionSlug<'llm-providers'> = ({
  owner,
}) => ({
  displayName: 'Anthropic',
  providerType: 'anthropic',
  icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Anthropic_logo.svg/512px-Anthropic_logo.svg.png',
  authType: 'api-key',
  apiKey: 'sk-ant-mock-key-replace-in-production',
  apiEndpoint: 'https://api.anthropic.com/v1',
  apiVersion: '2023-06-01',
  region: 'us',
  models: [
    {
      modelId: 'claude-3-opus-20240229',
      displayName: 'Claude 3 Opus',
      maxTokens: 4096,
      contextLength: 200000,
      costPerMillTokens: 0.015,
    },
    {
      modelId: 'claude-3-sonnet-20240229',
      displayName: 'Claude 3 Sonnet',
      maxTokens: 4096,
      contextLength: 200000,
      costPerMillTokens: 0.003,
    },
    {
      modelId: 'claude-3-haiku-20240307',
      displayName: 'Claude 3 Haiku',
      maxTokens: 4096,
      contextLength: 200000,
      costPerMillTokens: 0.00025,
    },
  ],
  rateLimit: 5000,
  rateLimitWindow: 60,
  quota: 500000,
  costPerMillTokens: 0.015,
  enabled: true,
  tags: [
    { tag: 'provider:anthropic' },
    { tag: 'provider:claude' },
  ],
  owner: owner.id,
  _status: 'published',
})
