import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { adminOnly } from '../../access/adminOnly'
import { revalidateDelete, revalidateModel } from './hooks/revalidateModel'

export const LLMModels: CollectionConfig<'llm-models'> = {
  slug: 'llm-models',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: authenticated,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'modelId', 'provider', 'supportsStreaming', 'updatedAt'],
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
        description: 'Human-readable name for this model (e.g., "GPT-4", "Claude 3 Opus")',
      },
    },
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
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Detailed description of the model',
      },
    },

    // Provider Relationship (optional - for catalog/reference purposes)
    {
      name: 'provider',
      type: 'relationship',
      relationTo: 'llm-providers',
      admin: {
        position: 'sidebar',
        description: 'Optional: Link to a provider that offers this model (for catalog purposes only)',
      },
    },

    // Tabs for organized fields
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Capabilities',
          fields: [
            {
              name: 'contextLength',
              type: 'number',
              label: 'Context Length (tokens)',
              admin: {
                description: 'Maximum context window in tokens (0 for unlimited)',
                step: 1,
              },
            },
            {
              name: 'maxTokens',
              type: 'number',
              label: 'Max Output Tokens',
              admin: {
                description: 'Maximum tokens the model can generate',
                step: 1,
              },
            },
            {
              name: 'supportsStreaming',
              type: 'checkbox',
              label: 'Supports Streaming',
              defaultValue: false,
              admin: {
                description: 'Whether the model supports streaming responses',
              },
            },
            {
              name: 'supportsFunctionCalling',
              type: 'checkbox',
              label: 'Supports Function Calling',
              defaultValue: false,
              admin: {
                description: 'Whether the model supports function calling / tools',
              },
            },
          ],
        },
        {
          label: 'Pricing',
          fields: [
            {
              name: 'costPerMillTokens',
              type: 'number',
              label: 'Cost Per Million Tokens (USD)',
              admin: {
                description: 'Simple average cost per million tokens',
                step: 0.0001,
              },
            },
            {
              name: 'costPerInputToken',
              type: 'number',
              label: 'Cost Per Input Token (USD)',
              admin: {
                description: 'Cost per input token',
                step: 0.000001,
              },
            },
            {
              name: 'costPerOutputToken',
              type: 'number',
              label: 'Cost Per Output Token (USD)',
              admin: {
                description: 'Cost per output token',
                step: 0.000001,
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
                description: 'Tags for organizing and categorizing models',
              },
            },
            {
              name: 'capabilities',
              type: 'array',
              label: 'Capabilities List',
              fields: [
                {
                  name: 'capability',
                  type: 'text',
                },
              ],
              admin: {
                description: 'List of specific capabilities (e.g., vision, code, reasoning, multimodal)',
              },
            },
          ],
        },
      ],
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
  ],
  hooks: {
    afterChange: [revalidateModel],
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
