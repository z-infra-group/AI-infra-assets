'use client'

import { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import type { PromptTest } from '../../../payload-types'

export default function PromptTestHistory() {
  const { id } = useDocumentInfo()
  const [tests, setTests] = useState<PromptTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10

  // Fetch test records for this prompt
  const fetchTests = async (pageNum = 1) => {
    setLoading(true)
    setError(null)

    try {
      // Use Payload's REST API to fetch tests
      const response = await fetch(
        `/api/prompt-tests?where[prompt][equals]=${id}&sort=-executedAt&limit=${limit}&page=${pageNum}`,
        {
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch test records')
      }

      const data = await response.json()
      setTests(data.docs || [])
      setPage(pageNum)
    } catch (err) {
      console.error('Failed to fetch prompt tests:', err)
      setError('Failed to load test records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [id])

  const handleRefresh = () => {
    fetchTests(page)
  }

  const handleLoadMore = () => {
    fetchTests(page + 1)
  }

  if (loading) {
    return (
      <div className="test-history">
        <p>Loading test history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="test-history">
        <p style={{ color: 'red' }}>{error}</p>
        <button type="button" onClick={handleRefresh}>
          Retry
        </button>
      </div>
    )
  }

  if (tests.length === 0) {
    return (
      <div className="test-history">
        <p>No test records found for this prompt.</p>
      </div>
    )
  }

  return (
    <div className="test-history">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0 }}>Recent Tests ({tests.length})</h4>
        <button
          type="button"
          onClick={handleRefresh}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{ marginBottom: '12px', maxHeight: '400px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Model</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Score</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr
                key={test.id}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                }}
                onClick={() => window.location.href = `/admin/collections/prompt-tests/${test.id}`}
              >
                <td style={{ padding: '8px' }}>
                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      backgroundColor:
                        test.executionStatus === 'completed'
                          ? '#dcfce7'
                          : test.executionStatus === 'failed'
                          ? '#fecaca'
                          : '#fef3c7',
                      color:
                        test.executionStatus === 'completed'
                          ? '#166534'
                          : test.executionStatus === 'failed'
                          ? '#dc2626'
                          : '#92400e',
                    }}
                  >
                    {test.executionStatus || 'N/A'}
                  </span>
                </td>
                <td style={{ padding: '8px', fontSize: '12px' }}>
                  {test.modelUnderTest || 'N/A'}
                </td>
                <td style={{ padding: '8px', fontSize: '12px' }}>
                  {test.score ?? '-'}
                </td>
                <td style={{ padding: '8px', fontSize: '12px' }}>
                  {test.executedAt
                    ? new Date(test.executedAt).toLocaleDateString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tests.length >= limit && (
        <button
          type="button"
          onClick={handleLoadMore}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Load More ({limit} more)
        </button>
      )}
    </div>
  )
}
