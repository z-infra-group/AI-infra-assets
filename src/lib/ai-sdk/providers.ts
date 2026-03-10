import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createAzure } from '@ai-sdk/azure'
import { createCohere } from '@ai-sdk/cohere'
import { ollama, createOllama } from 'ollama-ai-provider-v2'

/**
 * LLM Provider configuration from database
 */
export interface LLMProviderConfig {
  providerType: string
  apiKey: string
  apiEndpoint?: string
  apiVersion?: string
  region?: string
  authType?: string
}

/**
 * Creates an AI SDK model getter function from database configuration
 *
 * @param provider - Provider configuration from LLMProviders collection
 * @returns Function that takes modelId and returns an AI SDK model instance
 * @throws Error if provider type is not supported
 *
 * @example
 * ```ts
 * const provider = await payload.findByID({ collection: 'llm-providers', id: '123' })
 * const getModel = createAISDKProvider(provider)
 * const result = await generateText({ model: getModel('gpt-4'), prompt: 'Hello' })
 * ```
 */
export function createAISDKProvider(provider: LLMProviderConfig): (modelId: string) => any {
  const { providerType, apiKey, apiEndpoint, apiVersion, authType } = provider

  switch (providerType) {
    case 'openai': {
      // OpenAI provider (including LM Studio and other OpenAI-compatible endpoints)
      const openaiConfig: {
        apiKey: string
        baseURL?: string
      } = {
        apiKey,
      }

      // Use custom endpoint if provided (for LM Studio, custom OpenAI-compatible APIs)
      if (apiEndpoint) {
        openaiConfig.baseURL = apiEndpoint
      }

      const openai = createOpenAI(openaiConfig)

      // Return a function that takes modelId and returns the model
      return (modelId: string) => openai(modelId)
    }

    case 'anthropic': {
      // Anthropic Claude
      const anthropicConfig: {
        apiKey: string
        baseURL?: string
      } = {
        apiKey,
      }

      if (apiEndpoint) {
        anthropicConfig.baseURL = apiEndpoint
      }

      const anthropic = createAnthropic(anthropicConfig)

      return (modelId: string) => anthropic(modelId)
    }

    case 'google': {
      // Google Generative AI
      // Note: Google uses API key in URL, not in headers
      const google = createGoogleGenerativeAI({
        apiKey,
      })

      return (modelId: string) => google(modelId)
    }

    case 'azure-openai': {
      // Azure OpenAI
      if (!apiEndpoint) {
        throw new Error('API endpoint is required for Azure OpenAI')
      }

      const azure = createAzure({
        apiKey,
        baseURL: apiEndpoint,
        apiVersion: apiVersion || '2024-02-01',
      })

      return (modelId: string) => azure(modelId)
    }

    case 'cohere': {
      // Cohere
      const cohereConfig: {
        apiKey: string
        baseURL?: string
      } = {
        apiKey,
      }

      if (apiEndpoint) {
        cohereConfig.baseURL = apiEndpoint
      }

      const cohere = createCohere(cohereConfig)

      return (modelId: string) => cohere(modelId)
    }

    case 'ollama': {
      // Ollama (local models)
      const endpoint = apiEndpoint || 'http://localhost:11434'

      if (endpoint === 'http://localhost:11434') {
        // Use default ollama function for localhost
        return (modelId: string) => ollama(modelId)
      } else {
        // Use custom Ollama instance for remote servers
        const customOllama = createOllama({
          baseURL: endpoint,
        })
        return (modelId: string) => customOllama(modelId)
      }
    }

    case 'lm-studio':
    case 'custom':
    case 'huggingface': {
      // OpenAI-compatible providers (LM Studio, custom, Hugging Face)
      // Use OpenAI provider with custom endpoint
      if (!apiEndpoint) {
        throw new Error('API endpoint is required for custom/OpenAI-compatible providers')
      }

      const openaiConfig: {
        apiKey?: string
        baseURL: string
      } = {
        baseURL: apiEndpoint,
      }

      // Include API key if auth type requires it
      if (authType !== 'none' && apiKey) {
        openaiConfig.apiKey = apiKey
      }

      const customProvider = createOpenAI(openaiConfig)

      return (modelId: string) => customProvider(modelId)
    }

    case 'aws-bedrock': {
      // AWS Bedrock is not yet supported due to complex SigV4 signing
      throw new Error(
        'AWS Bedrock is not yet supported. This provider requires complex AWS SigV4 signing. Please use a different provider or implement Bedrock support manually.'
      )
    }

    default: {
      // Unknown provider type
      throw new Error(
        `Unsupported provider type: "${providerType}". Supported types: openai, anthropic, google, azure-openai, cohere, ollama, lm-studio, custom, huggingface`
      )
    }
  }
}

/**
 * Type for AI SDK model getter function
 */
export type AISDKModelGetter = ReturnType<typeof createAISDKProvider>
