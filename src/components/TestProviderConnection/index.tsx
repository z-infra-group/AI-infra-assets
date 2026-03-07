'use client'

import React, { useCallback, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'
import { toast } from '@payloadcms/ui'

import './index.scss'

interface TestResult {
  success: boolean
  status: 'connected' | 'authenticated' | 'failed' | 'timeout' | 'error'
  responseTime: number
  modelCount: number | null
  error?: string
}

/**
 * TestProviderConnection Component
 *
 * Displays a "Test Connection" button in the LLM Providers edit view sidebar.
 * Allows users to validate provider configurations before using them.
 */
const TestProviderConnection: React.FC = () => {
  const { id } = useDocumentInfo()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const handleTest = useCallback(async () => {
    // Prevent multiple simultaneous tests
    if (loading) {
      toast.info('Test already in progress')
      return
    }

    // Check if provider ID exists
    if (!id) {
      toast.error('Cannot test: Provider ID not found. Please save the provider first.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/x/test-llm-provider', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: id,
        }),
      })

      const data: TestResult = await response.json()

      if (response.ok) {
        setResult(data)

        if (data.success) {
          // Success notification with details
          const modelInfo = data.modelCount !== null
            ? `Found ${data.modelCount} model${data.modelCount === 1 ? '' : 's'}`
            : 'Connection successful'

          toast.success(
            `Connection test successful! ${modelInfo} (${data.responseTime}ms)`,
            {
              duration: 5000,
            }
          )
        } else {
          // Error notification
          toast.error(data.error || 'Connection test failed', {
            duration: 5000,
          })
        }
      } else {
        // HTTP error
        const errorData = data as { error?: string }
        toast.error(errorData.error || 'Connection test failed', {
          duration: 5000,
        })

        setResult({
          success: false,
          status: 'error',
          responseTime: 0,
          modelCount: null,
          error: errorData.error || 'Connection test failed',
        })
      }
    } catch (error) {
      console.error('Test connection error:', error)

      const errorMessage = error instanceof Error ? error.message : 'Failed to test connection'
      toast.error(errorMessage, {
        duration: 5000,
      })

      setResult({
        success: false,
        status: 'error',
        responseTime: 0,
        modelCount: null,
        error: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [id, loading])

  // Disable button if no provider ID (not yet saved)
  const buttonDisabled = loading || !id

  return (
    <div className="test-provider-connection">
      {/* Test Result - shown above the divider */}
      {result && (
        <div className={`test-result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <div className="result-success">
              <span className="result-icon">✓</span>
              <div className="result-details">
                <p className="result-status">
                  {result.status === 'authenticated' ? 'Authenticated' : 'Connected'}
                </p>
                {result.modelCount !== null && (
                  <p className="result-models">{result.modelCount} models available</p>
                )}
                <p className="result-time">{result.responseTime}ms</p>
              </div>
            </div>
          ) : (
            <div className="result-error">
              <span className="result-icon">✗</span>
              <div className="result-details">
                <p className="result-error-msg">{result.error}</p>
                {result.responseTime > 0 && (
                  <p className="result-time">{result.responseTime}ms</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hint message */}
      {!id && (
        <p className="test-hint">
          Save the provider first to enable connection testing
        </p>
      )}

      {/* Divider - separates form fields from test button */}
      <div className="test-divider" />

      {/* Test Button - at the bottom */}
      <Button
        onClick={handleTest}
        disabled={buttonDisabled}
        className="test-button"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </Button>
    </div>
  )
}

export default TestProviderConnection
