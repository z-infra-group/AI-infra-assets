import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { revalidateDelete, revalidatePromptTest } from './hooks/revalidatePromptTest'

import { slugField } from 'payload'

export const PromptTests: CollectionConfig<'prompt-tests'> = {
  slug: 'prompt-tests',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'executionStatus', 'score', 'executedAt', 'updatedAt'],
  },
  fields: [
    // Basic Fields
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Test Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Test Description',
    },

    // Relationships
    {
      name: 'prompt',
      type: 'relationship',
      relationTo: 'prompts',
      required: true,
      label: 'Associated Prompt',
      admin: {
        position: 'sidebar',
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
    {
      name: 'viewPrompt',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/admin/components/ViewPromptButton',
        },
      },
    },

    // Test Configuration & Data
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Test Input/Output',
          fields: [
            {
              name: 'inputVariables',
              type: 'json',
              label: 'Input Variables',
              admin: {
                description: 'Variables to substitute in the prompt template',
              },
            },
            {
              name: 'expectedOutput',
              type: 'textarea',
              label: 'Expected Output',
            },
            {
              name: 'actualOutput',
              type: 'textarea',
              label: 'Actual Output',
              access: {
                update: ({ req }) => {
                  // Only allow authenticated users to update actual output
                  return Boolean(req.user)
                },
              },
            },
          ],
        },
        {
          label: 'Test Configuration',
          fields: [
            {
              name: 'testConfig',
              type: 'json',
              label: 'Test Configuration',
              admin: {
                description: 'LLM parameters for this test (overrides prompt defaults)',
              },
            },
            {
              name: 'modelUnderTest',
              type: 'text',
              label: 'Model Under Test',
              admin: {
                description: 'Model ID used for this test',
              },
            },
          ],
        },
        {
          label: 'Execution Details',
          fields: [
            {
              name: 'executionStatus',
              type: 'select',
              label: 'Execution Status',
              options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Running', value: 'running' },
                { label: 'Completed', value: 'completed' },
                { label: 'Failed', value: 'failed' },
              ],
              defaultValue: 'pending',
            },
            {
              name: 'failureReason',
              type: 'select',
              label: 'Failure Reason',
              options: [
                { label: 'Connection Error', value: 'connection_error' },
                { label: 'Authentication Failed', value: 'authentication_failed' },
                { label: 'Rate Limit Exceeded', value: 'rate_limit_exceeded' },
                { label: 'Timeout', value: 'timeout' },
                { label: 'Model Not Found', value: 'model_not_found' },
                { label: 'Validation Error', value: 'validation_error' },
                { label: 'Provider Error', value: 'provider_error' },
                { label: 'Unknown', value: 'unknown' },
              ],
              defaultValue: 'unknown',
              admin: {
                description: 'Categorized reason for test failure (only for failed tests)',
                condition: (data) => data.executionStatus === 'failed',
              },
            },
            {
              name: 'executedAt',
              type: 'date',
              label: 'Executed At',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'executionTime',
              type: 'number',
              label: 'Execution Time (ms)',
              admin: {
                description: 'Time taken to execute the test',
              },
            },
            {
              name: 'tokensUsed',
              type: 'number',
              label: 'Tokens Used',
              admin: {
                description: 'Total tokens consumed during test execution',
              },
            },
            {
              name: 'cost',
              type: 'number',
              label: 'Cost (USD)',
              min: 0,
              admin: {
                description: 'Cost of running the test in USD',
                step: 0.0001,
              },
            },
          ],
        },
        {
          label: 'Results',
          fields: [
            {
              name: 'score',
              type: 'number',
              min: 0,
              max: 100,
              label: 'Test Score',
              admin: {
                description: 'Overall test score (0-100)',
                step: 1,
              },
            },
            {
              name: 'feedback',
              type: 'textarea',
              label: 'Feedback',
              admin: {
                description: 'Human evaluation feedback',
              },
            },
            {
              name: 'isVerified',
              type: 'checkbox',
              label: 'Verified',
              defaultValue: false,
              admin: {
                description: 'Human verified result',
              },
            },
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
    afterChange: [revalidatePromptTest],
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
