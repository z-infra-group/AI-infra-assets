import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { adminOnly } from '../../access/adminOnly'
import { revalidateDelete, revalidateProvider } from './hooks/revalidateProvider'

export const LLMProviders: CollectionConfig<'llm-providers'> = {
  slug: 'llm-providers',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: authenticated,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'providerType', 'enabled', 'updatedAt'],
    enableRichTextLink: false,
  },
  fields: [
    // Basic Identification
    {
      name: 'displayName',
      type: 'text',
      required: true,
      label: 'Display Name',
      admin: {
        description: 'Human-readable name for this provider (e.g., "OpenAI", "Anthropic")',
      },
    },
    {
      name: 'providerType',
      type: 'select',
      required: true,
      label: 'Provider Type',
      options: [
        { label: 'OpenAI', value: 'openai' },
        { label: 'Anthropic', value: 'anthropic' },
        { label: 'Google', value: 'google' },
        { label: 'Cohere', value: 'cohere' },
        { label: 'Hugging Face', value: 'huggingface' },
        { label: 'Ollama', value: 'ollama' },
        { label: 'LM Studio', value: 'lm-studio' },
        { label: 'Azure OpenAI', value: 'azure-openai' },
        { label: 'AWS Bedrock', value: 'aws-bedrock' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'custom',
      admin: {
        description: 'Type of LLM provider',
      },
    },
    {
      name: 'icon',
      type: 'text',
      label: 'Icon URL',
      admin: {
        description: 'Optional icon URL for the provider',
      },
    },

    // Ownership
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Admin who created this provider',
      },
    },

    // Published date tracking
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },

    // Provider Testing UI
    {
      name: 'testConnection',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/TestProviderConnection',
        },
      },
    },

    // Tabs for organized fields
    {
      type: 'tabs',
      tabs: [
        {
          label: 'API Configuration',
          fields: [
            {
              name: 'authType',
              type: 'select',
              label: 'Authentication Type',
              options: [
                { label: 'API Key', value: 'api-key' },
                { label: 'Bearer Token', value: 'bearer' },
                { label: 'OAuth', value: 'oauth' },
                { label: 'None', value: 'none' },
              ],
              defaultValue: 'api-key',
              admin: {
                description: 'Type of authentication required by the provider',
              },
            },
            {
              name: 'apiKey',
              type: 'text',
              required: true,
              label: 'API Key',
              admin: {
                description: 'API key for authentication (encrypted at rest)',
              },
            },
            {
              name: 'apiEndpoint',
              type: 'text',
              label: 'API Endpoint',
              admin: {
                description: 'Base URL for the provider API (e.g., https://api.openai.com/v1)',
              },
            },
            {
              name: 'apiVersion',
              type: 'text',
              label: 'API Version',
              admin: {
                description: 'API version to use (e.g., 2024-01-01)',
              },
            },
            {
              name: 'region',
              type: 'text',
              label: 'Region',
              admin: {
                description: 'Provider region for services that support it (e.g., us-east-1)',
              },
            },
          ],
        },
        {
          label: 'Models',
          fields: [
            {
              name: 'models',
              type: 'array',
              fields: [
                {
                  name: 'modelId',
                  type: 'text',
                  required: true,
                  label: 'Model ID',
                  admin: {
                    description: 'Unique identifier for the model (e.g., gpt-4, claude-3-opus-20240229)',
                  },
                },
                {
                  name: 'displayName',
                  type: 'text',
                  required: true,
                  label: 'Display Name',
                  admin: {
                    description: 'Human-readable model name',
                  },
                },
                {
                  name: 'maxTokens',
                  type: 'number',
                  label: 'Max Tokens',
                  admin: {
                    description: 'Maximum tokens supported by this model',
                    step: 1,
                  },
                },
                {
                  name: 'contextLength',
                  type: 'number',
                  label: 'Context Length',
                  admin: {
                    description: 'Maximum context window in tokens',
                    step: 1,
                  },
                },
                {
                  name: 'costPerMillTokens',
                  type: 'number',
                  label: 'Cost Per Million Tokens (USD)',
                  admin: {
                    description: 'Average cost per million tokens for this model',
                    step: 0.0001,
                  },
                },
              ],
              admin: {
                description: 'List of models offered by this provider with their configurations.',
              },
            },
          ],
        },
        {
          label: 'Configuration & Limits',
          fields: [
            {
              name: 'rateLimit',
              type: 'number',
              label: 'Rate Limit',
              admin: {
                description: 'Maximum requests per time window',
                step: 1,
              },
            },
            {
              name: 'rateLimitWindow',
              type: 'number',
              label: 'Rate Limit Window (seconds)',
              admin: {
                description: 'Time window in seconds for rate limiting',
                step: 1,
              },
            },
            {
              name: 'quota',
              type: 'number',
              label: 'Quota',
              admin: {
                description: 'Total quota limit ( informational for now)',
                step: 1,
              },
            },
            {
              name: 'costPerMillTokens',
              type: 'number',
              label: 'Cost Per Million Tokens (USD)',
              admin: {
                description: 'Average cost per million tokens for this provider',
                step: 0.0001,
              },
            },
            {
              name: 'enabled',
              type: 'checkbox',
              label: 'Enabled',
              defaultValue: true,
              admin: {
                description: 'Enable or disable this provider. Disabled providers are not available for API calls.',
              },
            },
          ],
        },
        {
          label: 'Metadata',
          fields: [
            {
              name: 'tags',
              type: 'array',
              label: 'Tags',
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                },
              ],
              admin: {
                description: 'Tags for organizing and categorizing providers',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateProvider],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
