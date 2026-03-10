import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { revalidateDelete, revalidatePrompt } from './hooks/revalidatePrompt'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Prompts: CollectionConfig<'prompts'> = {
  slug: 'prompts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isPublic', 'updatedAt'],
    enableRichTextLink: false,
  },
  fields: [
    // Basic Fields
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Prompt Title',
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Prompt Content',
      admin: {
        description: 'The actual prompt text to send to the LLM',
      },
    },

    // Visibility & Ownership
    {
      name: 'isPublic',
      type: 'checkbox',
      label: 'Public',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Make this prompt visible to all users',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
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

    // Prompt Testing UI
    {
      name: 'testPrompt',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/TestPromptButton',
        },
      },
    },
    {
      name: 'testHistory',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/admin/components/PromptTestHistory',
        },
      },
    },

    // Model Compatibility
    {
      name: 'modelScores',
      type: 'array',
      fields: [
        {
          name: 'model',
          type: 'text',
          required: true,
          label: 'Model ID',
          admin: {
            description: 'e.g., gpt-4, claude-3-opus-20240229',
          },
        },
        {
          name: 'score',
          type: 'number',
          required: true,
          min: 0,
          max: 1,
          label: 'Compatibility Score',
          admin: {
            description: '0-1 score indicating model compatibility',
            step: 0.01,
          },
        },
      ],
      admin: {
        description: 'Model compatibility scores (future: integrate with Models collection)',
      },
    },

    // LLM Parameters & Organization
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Common Parameters',
          fields: [
            {
              name: 'temperature',
              type: 'number',
              min: 0,
              max: 2,
              defaultValue: 0.7,
              label: 'Temperature',
              admin: {
                step: 0.1,
              },
            },
            {
              name: 'maxTokens',
              type: 'number',
              min: 1,
              label: 'Max Tokens',
              admin: {
                description: 'Maximum tokens to generate',
              },
            },
            {
              name: 'topP',
              type: 'number',
              min: 0,
              max: 1,
              defaultValue: 1,
              label: 'Top P',
              admin: {
                step: 0.05,
              },
            },
            {
              name: 'frequencyPenalty',
              type: 'number',
              min: -2,
              max: 2,
              defaultValue: 0,
              label: 'Frequency Penalty',
              admin: {
                step: 0.1,
              },
            },
            {
              name: 'presencePenalty',
              type: 'number',
              min: -2,
              max: 2,
              defaultValue: 0,
              label: 'Presence Penalty',
              admin: {
                step: 0.1,
              },
            },
          ],
        },
        {
          label: 'Extended Configuration',
          fields: [
            {
              name: 'extraConfig',
              type: 'json',
              label: 'Extra Configuration',
              admin: {
                description: 'Additional LLM parameters as JSON (e.g., stop, tools, tool_choice)',
              },
            },
            {
              name: 'tags',
              type: 'array',
              label: 'Tags (prompt:)',
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                },
              ],
              admin: {
                description: 'Tags with "prompt:" prefix to distinguish from other collections',
              },
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },

    // Metadata
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    afterChange: [revalidatePrompt],
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
