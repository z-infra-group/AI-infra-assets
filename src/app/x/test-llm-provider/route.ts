import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

// DO NOT LOG: Full prompt content, API keys, or sensitive data
// Truncate sensitive content to 100 chars in logs

const DEFAULT_TIMEOUT = 10000 // 10 seconds
const timeout = Number(process.env.PROVIDER_TEST_TIMEOUT) || DEFAULT_TIMEOUT

interface TestRequest {
  providerId: string
}

interface TestResponse {
  success: boolean
  status: 'connected' | 'authenticated' | 'failed' | 'timeout' | 'error'
  responseTime: number
  modelCount: number | null
  error?: string
}

/**
 * POST /api/test-llm-provider
 *
 * Tests LLM provider connectivity by attempting to fetch the model list.
 * Only the provider owner can execute this test.
 */
export async function POST(request: Request) {
  const startTime = Date.now()
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  try {
    // Authenticate user
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: TestRequest = await request.json()
    const { providerId } = body

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: 'providerId is required' },
        { status: 400 }
      )
    }

    // Fetch provider with user context (enforces access control)
    const provider = await payload.findByID({
      collection: 'llm-providers',
      id: providerId,
      user,
      overrideAccess: false, // IMPORTANT: Enforce permissions
      depth: 1, // Need depth=1 to populate owner relationship
    })

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Verify ownership - only owner can test
    // Type guard for provider with owner relationship
    const ownerId = (provider as any).owner?.id || (provider as any).owner
    if (!ownerId || ownerId !== user.id) {
      // Debug logging (remove in production)
      console.log('Owner check failed:', {
        providerOwnerId: ownerId,
        userId: user.id,
        providerOwnerIdType: typeof ownerId,
        userIdType: typeof user.id
      })
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only the provider owner can test connection' },
        { status: 403 }
      )
    }

    // Execute provider-specific test
    const partialResult = await testProviderConnection(provider as any, timeout)

    // Add response time
    const result: TestResponse = {
      ...partialResult,
      responseTime: Date.now() - startTime,
    }

    return NextResponse.json(result)
  } catch (error) {
    // Log error without sensitive details
    console.error('Provider test error:', error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        responseTime: Date.now() - startTime,
        modelCount: null,
        error: 'An unexpected error occurred during connection test',
      } as TestResponse,
      { status: 500 }
    )
  }
}

/**
 * Tests provider connection based on provider type
 * Implements provider-specific strategies for model list retrieval
 */
async function testProviderConnection(
  provider: any,
  timeoutMs: number
): Promise<Omit<TestResponse, 'responseTime'>> {
  const { providerType, apiKey, apiEndpoint } = provider

  // Redact API key for logging (first 8 chars only)
  const redactedKey = apiKey ? `${apiKey.slice(0, 8)}...` : 'none'

  try {
    switch (providerType) {
      case 'openai':
        return await testOpenAI(apiKey, apiEndpoint, timeoutMs)
      case 'anthropic':
        return await testAnthropic(apiKey, apiEndpoint, timeoutMs)
      case 'google':
        return await testGoogle(apiKey, apiEndpoint, timeoutMs)
      case 'ollama':
        return await testOllama(apiEndpoint, timeoutMs)
      case 'lm-studio': // Treat as custom OpenAI-compatible
      case 'custom':
        return await testCustomProvider(provider, timeoutMs)
      case 'azure-openai':
        return await testAzureOpenAI(provider, timeoutMs)
      case 'aws-bedrock':
        return await testAWSBedrock(provider, timeoutMs)
      case 'cohere':
        return await testCohere(apiKey, apiEndpoint, timeoutMs)
      case 'huggingface':
        return await testHuggingFace(apiEndpoint, timeoutMs)
      default:
        return {
          success: false,
          status: 'error',
          modelCount: null,
          error: `Unsupported provider type: ${providerType}`,
        }
    }
  } catch (error) {
    // Return user-friendly error without exposing sensitive data
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          status: 'timeout',
          modelCount: null,
          error: `Connection timeout: The server took too long to respond (${timeoutMs / 1000}s limit)`,
        }
      }

      // Check for authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return {
          success: false,
          status: 'failed',
          modelCount: null,
          error: 'Authentication failed: Invalid API key or credentials',
        }
      }

      // Network errors
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        return {
          success: false,
          status: 'error',
          modelCount: null,
          error: 'Connection error: Unable to reach the endpoint',
        }
      }
    }

    return {
      success: false,
      status: 'error',
      modelCount: null,
      error: 'Connection test failed: An unexpected error occurred',
    }
  }
}

/**
 * Test OpenAI provider - fetches /v1/models
 */
async function testOpenAI(
  apiKey: string,
  apiEndpoint: string | undefined,
  timeoutMs: number
): Promise<Omit<TestResponse, 'responseTime'>> {
  const endpoint = apiEndpoint || 'https://api.openai.com/v1'
  const url = `${endpoint}/models`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      const modelCount = data.data?.length || 0

      return {
        success: true,
        status: 'authenticated',
        modelCount,
      }
    } else if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: 'Authentication failed: Invalid API key',
      }
    } else {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: `Provider API returned error: ${response.status}`,
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Test Anthropic provider - sends minimal messages request
 */
async function testAnthropic(
  apiKey: string,
  apiEndpoint: string | undefined,
  timeoutMs: number
): Promise<Omit<TestResponse, 'responseTime'>> {
  const endpoint = apiEndpoint || 'https://api.anthropic.com/v1'
  const url = `${endpoint}/messages`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Use smallest model for testing
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return {
        success: true,
        status: 'authenticated',
        modelCount: null, // Anthropic doesn't have a models list endpoint
      }
    } else if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: 'Authentication failed: Invalid API key',
      }
    } else {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: `Provider API returned error: ${response.status}`,
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Test Google provider - fetches /v1beta/models
 */
async function testGoogle(
  apiKey: string,
  apiEndpoint: string | undefined,
  timeoutMs: number
): Promise<Omit<TestResponse, 'responseTime'>> {
  const endpoint = apiEndpoint || 'https://generativelanguage.googleapis.com/v1beta'
  const url = `${endpoint}/models?key=${apiKey}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      const modelCount = data.models?.length || 0

      return {
        success: true,
        status: 'authenticated',
        modelCount,
      }
    } else if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: 'Authentication failed: Invalid API key',
      }
    } else {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: `Provider API returned error: ${response.status}`,
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Test Ollama provider - fetches /api/tags
 */
async function testOllama(
  apiEndpoint: string | undefined,
  timeoutMs: number
): Promise<Omit<TestResponse, 'responseTime'>> {
  const endpoint = apiEndpoint || 'http://localhost:11434'
  const url = `${endpoint}/api/tags`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      const modelCount = data.models?.length || 0

      return {
        success: true,
        status: 'connected',
        modelCount,
      }
    } else {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: `Ollama API returned error: ${response.status}`,
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Test custom provider - attempts based on authType
 */
async function testCustomProvider(
  provider: any,
  timeoutMs: number
): Promise<Omit<TestResponse, 'responseTime'>> {
  const { apiEndpoint, authType, apiKey } = provider

  if (!apiEndpoint) {
    return {
      success: false,
      status: 'error',
      modelCount: null,
      error: 'API endpoint is required for custom providers',
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add authentication based on authType
    if (authType === 'api-key' && apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    } else if (authType === 'bearer' && apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }
    // For 'oauth' and 'none', no auth headers

    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      // Try to parse as model list
      try {
        const data = await response.json()
        const modelCount = data.data?.length || data.models?.length || 0

        return {
          success: true,
          status: authType === 'none' ? 'connected' : 'authenticated',
          modelCount,
        }
      } catch {
        // If response is not JSON, just report connection success
        return {
          success: true,
          status: authType === 'none' ? 'connected' : 'authenticated',
          modelCount: null,
        }
      }
    } else if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: 'Authentication failed: Check your credentials',
      }
    } else {
      // Connected but endpoint path may not be correct
      return {
        success: true,
        status: 'connected',
        modelCount: null,
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Test Azure OpenAI provider - fetches deployments
 */
async function testAzureOpenAI(
  provider: any,
  timeoutMs: number
): Promise<Omit<TestResponse, 'responseTime'>> {
  const { apiKey, apiEndpoint, apiVersion } = provider

  if (!apiEndpoint) {
    return {
      success: false,
      status: 'error',
      modelCount: null,
      error: 'API endpoint is required for Azure OpenAI',
    }
  }

  const version = apiVersion || '2024-02-01'
  const url = `${apiEndpoint}/openai/deployments?api-version=${version}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      const modelCount = data.data?.length || 0

      return {
        success: true,
        status: 'authenticated',
        modelCount,
      }
    } else if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: 'Authentication failed: Invalid API key',
      }
    } else {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: `Azure OpenAI returned error: ${response.status}`,
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Test AWS Bedrock - basic connectivity check only
 * Skips full model list due to complex SigV4 signing requirements
 */
async function testAWSBedrock(
  provider: any,
  timeoutMs: number
): Promise<Omit<TestResponse, 'responseTime'>> {
  // AWS Bedrock requires complex SigV4 signing which is out of scope
  // Just verify configuration is present
  const { apiKey, apiEndpoint } = provider

  if (!apiKey || !apiEndpoint) {
    return {
      success: false,
      status: 'error',
      modelCount: null,
      error: 'AWS Bedrock requires both API key and endpoint to be configured',
    }
  }

  return {
    success: true,
    status: 'connected',
    modelCount: null,
  }
}

/**
 * Test Cohere provider - fetches /v1/models
 */
async function testCohere(
  apiKey: string,
  apiEndpoint: string | undefined,
  timeoutMs: number
): Promise<Omit<TestResponse, 'responseTime'>> {
  const endpoint = apiEndpoint || 'https://api.cohere.ai/v1'
  const url = `${endpoint}/models`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      const modelCount = data.models?.length || 0

      return {
        success: true,
        status: 'authenticated',
        modelCount,
      }
    } else if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: 'Authentication failed: Invalid API key',
      }
    } else {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: `Provider API returned error: ${response.status}`,
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Test Hugging Face provider - fetches /models (no auth needed for list)
 */
async function testHuggingFace(
  apiEndpoint: string | undefined,
  timeoutMs: number
): Promise<Omit<TestResponse, 'responseTime'>> {
  const endpoint = apiEndpoint || 'https://huggingface.co'
  const url = `${endpoint}/api/models`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      // Hugging Face returns a huge list, just verify connection
      return {
        success: true,
        status: 'connected',
        modelCount: null, // Skip counting (too many models)
      }
    } else {
      return {
        success: false,
        status: 'failed',
        modelCount: null,
        error: `Hugging Face API returned error: ${response.status}`,
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}
