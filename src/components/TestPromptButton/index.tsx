'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { Button, Select } from '@payloadcms/ui'
import { toast } from '@payloadcms/ui'

import './index.scss'

interface TestResponse {
  success: boolean
  generatedText: string | null
  responseTime: number
  tokensUsed: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  } | null
  estimatedCost: number | null
  modelUsed: string | null
  providerUsed?: string
  error?: string
}

interface Provider {
  id: string
  displayName: string
  providerType: string
  enabled: boolean
  models: Array<{
    modelId: string
    displayName: string
  }>
}

/**
 * TestPromptButton Component
 *
 * Displays a "Test Prompt" button in the Prompts edit view sidebar.
 * Allows users to select a provider and model to test prompts.
 */
const TestPromptButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResponse | null>(null)
  const [copied, setCopied] = useState(false)

  // Provider and Model selection
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string>('')
  const [selectedModelId, setSelectedModelId] = useState<string>('')

  // Fetch enabled providers on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/llm-providers?where[enabled][equals]=true&depth=0', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          const enabledProviders = data.docs || []

          setProviders(enabledProviders)

          // Auto-select first provider if available
          if (enabledProviders.length > 0 && !selectedProviderId) {
            setSelectedProviderId(enabledProviders[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error)
      }
    }

    fetchProviders()
  }, [])

  // Reset model selection when provider changes
  useEffect(() => {
    setSelectedModelId('')
  }, [selectedProviderId])

  const selectedProvider = providers.find(p => p.id === selectedProviderId)
  const availableModels = selectedProvider?.models || []

  const handleTest = useCallback(async () => {
    if (loading) {
      toast.info('Test already in progress')
      return
    }

    if (!id) {
      toast.error('Cannot test: Prompt ID not found. Please save the prompt first.')
      return
    }

    if (!selectedProviderId) {
      toast.error('Please select a provider')
      return
    }

    if (!selectedModelId) {
      toast.error('Please select a model')
      return
    }

    setLoading(true)
    setResult(null)
    setCopied(false)

    try {
      const response = await fetch('/x/test-prompt', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: id,
          providerId: selectedProviderId,
          modelId: selectedModelId,
        }),
      })

      const data: TestResponse = await response.json()

      setResult(data)

      if (response.ok && data.success) {
        const costInfo = data.estimatedCost !== null
          ? `Cost: $${data.estimatedCost.toFixed(4)}`
          : ''

        const tokenInfo = data.tokensUsed
          ? `${data.tokensUsed.totalTokens} tokens`
          : ''

        const details = [costInfo, tokenInfo].filter(Boolean).join(', ')

        toast.success(
          `Prompt tested successfully!${details ? ` ${details}` : ''} (${data.responseTime}ms)`,
          { duration: 5000 }
        )
      } else {
        toast.error(data.error || 'Prompt test failed', {
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Test prompt error:', error)

      const errorMessage = error instanceof Error ? error.message : 'Failed to test prompt'
      toast.error(errorMessage, { duration: 5000 })

      setResult({
        success: false,
        generatedText: null,
        responseTime: 0,
        tokensUsed: null,
        estimatedCost: null,
        modelUsed: null,
        error: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [id, loading, selectedProviderId, selectedModelId])

  const handleCopy = useCallback(() => {
    if (result?.generatedText) {
      navigator.clipboard.writeText(result.generatedText)
      setCopied(true)
      toast.success('Response copied to clipboard')

      setTimeout(() => setCopied(false), 2000)
    }
  }, [result?.generatedText])

  const buttonDisabled = loading || !id || !selectedProviderId || !selectedModelId
  const showCostWarning = result?.estimatedCost && result.estimatedCost > 0.10

  return (
    <div className="test-prompt-button">
      {/* Loading State */}
      {loading && (
        <div className="test-loading">
          <div className="loading-spinner"></div>
          <p>Testing prompt with LLM provider...</p>
          <p className="loading-hint">This may take up to 60 seconds</p>
        </div>
      )}

      {/* Provider and Model Selection */}
      {!loading && providers.length > 0 && (
        <div className="test-selection">
          <div className="selection-group">
            <label className="selection-label">Provider</label>
            <select
              className="selection-select"
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              disabled={loading}
            >
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.displayName}
                </option>
              ))}
            </select>
          </div>

          {selectedProvider && availableModels.length > 0 && (
            <div className="selection-group">
              <label className="selection-label">Model</label>
              <select
                className="selection-select"
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a model...</option>
                {availableModels.map((model) => (
                  <option key={model.modelId} value={model.modelId}>
                    {model.displayName || model.modelId}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedProvider && availableModels.length === 0 && (
            <p className="test-hint">
              No models configured for this provider
            </p>
          )}
        </div>
      )}

      {!loading && providers.length === 0 && (
        <p className="test-hint">
          No enabled providers found. Configure and enable a provider first.
        </p>
      )}

      {/* Success Result */}
      {result && result.success && result.generatedText && (
        <div className="test-result success">
          <div className="result-header">
            <span className="result-icon">✓</span>
            <h4>Generated Response</h4>
            <button
              type="button"
              onClick={handleCopy}
              className="copy-button"
              title={copied ? 'Copied!' : 'Copy response'}
            >
              {copied ? '✓ Copied' : 'Copy Response'}
            </button>
          </div>

          <pre className="result-content"><code>{result.generatedText}</code></pre>

          <div className="result-metadata">
            {result.providerUsed && (
              <span className="metadata-item">
                <strong>Provider:</strong> {result.providerUsed}
              </span>
            )}
            {result.modelUsed && (
              <span className="metadata-item">
                <strong>Model:</strong> {result.modelUsed}
              </span>
            )}
            <span className="metadata-item">
              <strong>Time:</strong> {result.responseTime}ms
            </span>
            {result.tokensUsed && (
              <>
                <span className="metadata-item">
                  <strong>Tokens:</strong> {result.tokensUsed.totalTokens}
                </span>
                <span className="metadata-item">
                  <strong>(In: {result.tokensUsed.promptTokens}, Out: {result.tokensUsed.completionTokens})</strong>
                </span>
              </>
            )}
            {result.estimatedCost !== null && (
              <span className={`metadata-item ${showCostWarning ? 'cost-warning' : ''}`}>
                <strong>Cost:</strong> ${result.estimatedCost.toFixed(4)}
                {showCostWarning && ' ⚠️'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Result */}
      {result && !result.success && (
        <div className="test-result error">
          <div className="result-header">
            <span className="result-icon">✗</span>
            <h4>Test Failed</h4>
          </div>
          <p className="result-error-msg">{result.error}</p>
          {result.responseTime > 0 && (
            <p className="result-time">Time: {result.responseTime}ms</p>
          )}
          <div className="result-suggestions">
            <strong>Suggestions:</strong>
            <ul>
              <li>Test the provider connection first</li>
              <li>Verify the model exists in the provider configuration</li>
              <li>Check that the provider is enabled</li>
              <li>Ensure you have selected both a provider and a model</li>
            </ul>
          </div>
        </div>
      )}

      {/* Hint Message */}
      {!id && !loading && (
        <p className="test-hint">
          Save the prompt first to enable testing
        </p>
      )}

      {/* Divider - separates form fields from test button */}
      {!loading && <div className="test-divider" />}

      {/* Test Button - at the bottom */}
      {!loading && (
        <Button
          onClick={handleTest}
          disabled={buttonDisabled}
          className="test-button"
        >
          {loading ? 'Testing...' : 'Test Prompt'}
        </Button>
      )}
    </div>
  )
}

export default TestPromptButton
