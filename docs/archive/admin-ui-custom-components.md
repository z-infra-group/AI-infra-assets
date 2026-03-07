# Admin UI Custom Components for Prompt Testing

## 方案对比

### 方案 1: 自定义 Admin 组件（推荐）

**优点**:
- 简单易实现，无需复杂配置
- 在现有编辑页面添加功能按钮
- 可以访问当前文档数据
- 支持 client-side 交互

**适用场景**: 简单的功能按钮、表单验证、外部 API 调用

### 方案 2: 自定义 Edit View

**优点**:
- 完全自定义编辑界面
- 可以重新组织字段布局
- 添加复杂的交互逻辑

**缺点**:
- 需要重新实现整个编辑界面
- 维护成本高

**适用场景**: 复杂的工作流、多步骤表单

### 方案 3: Field Components

**优点**:
- 可复用的自定义字段类型
- 可以在任何 collection 中使用

**适用场景**: 特殊的输入控件、验证逻辑

## 推荐实现方案

### 方案 1: 添加 "Test Prompt" 按钮

#### 1. 创建自定义 Admin 组件

```typescript
// src/admin/components/TestPromptButton/index.tsx
'use client'

import React, { useCallback, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'
import { toast } from '@payloadcms/ui'

export const TestPromptButton: React.FC = () => {
  const { id, collection, getData } = useDocumentInfo()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = useCallback(async () => {
    setLoading(true)
    setResult(null)

    try {
      // 获取当前 prompt 数据
      const response = await fetch('/api/test-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast.success('Prompt tested successfully!')
      } else {
        toast.error(data.error || 'Test failed')
      }
    } catch (error) {
      console.error('Test error:', error)
      toast.error('Failed to test prompt')
    } finally {
      setLoading(false)
    }
  }, [id])

  if (collection !== 'prompts') {
    return null
  }

  return (
    <div className="test-prompt-section">
      <Button onClick={handleTest} disabled={loading || !id}>
        {loading ? 'Testing...' : 'Test Prompt'}
      </Button>

      {result && (
        <div className="test-result">
          <h4>Test Result:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
```

#### 2. 在 Prompts collection 中注册组件

```typescript
// src/collections/Prompts/index.ts

export const Prompts: CollectionConfig<'prompts'> = {
  slug: 'prompts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isPublic', 'updatedAt'],
    components: {
      // 注册自定义组件
      TestPromptButton,
    },
  },
  fields: [
    // ... fields
  ],
}
```

---

### 方案 2: 自定义字段组件 - 模型评分选择器

创建一个自定义字段组件，用于选择模型和评分：

```typescript
// src/admin/components/ModelScoreSelector/index.tsx
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { Select, Text, Number } from '@payloadcms/ui'

interface ModelScore {
  model: string
  score: number
}

export const ModelScoreSelector: React.FC = () => {
  const { value, setValue } = useField<ModelScore[]>({
    path: 'modelScores',
  })

  const [models, setModels] = useState<string[]>([])

  // 加载可用的模型列表
  useEffect(() => {
    fetch('/api/llm-models')
      .then(res => res.json())
      .then(data => {
        if (data.docs) {
          setModels(data.docs.map((m: any) => m.modelId))
        }
      })
  }, [])

  const addScore = useCallback(() => {
    const newScores = [...(value || []), { model: '', score: 0.5 }]
    setValue(newScores)
  }, [value, setValue])

  const removeScore = useCallback((index: number) => {
    const newScores = (value || []).filter((_, i) => i !== index)
    setValue(newScores)
  }, [value, setValue])

  const updateScore = useCallback((index: number, field: string, value: any) => {
    const newScores = [...(value || [])]
    newScores[index][field] = value
    setValue(newScores)
  }, [value, setValue])

  return (
    <div className="model-score-selector">
      <h4>Model Compatibility Scores</h4>

      {(value || []).map((score, index) => (
        <div key={index} className="score-item" style={{ marginBottom: '0.5rem' }}>
          <Select
            label="Model"
            options={models.map((model) => ({
              label: model,
              value: model,
            }))}
            value={score.model}
            onChange={(newValue) => updateScore(index, 'model', newValue)}
          />

          <Text
            label="Score (0-1)"
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={score.score}
            onChange={(newValue) => updateScore(index, 'score', parseFloat(newValue))}
          />

          <button
            type="button"
            onClick={() => removeScore(index)}
            style={{ marginLeft: '0.5rem' }}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addScore}
        className="add-score-button"
      >
        + Add Model Score
      </button>
    </div>
  )
}
```

---

### 方案 3: 批量操作 - Batch Test Prompts

在 PromptTests collection 中添加批量测试功能：

```typescript
// src/admin/components/BatchTestPrompts/index.tsx
'use client'

import React, { useCallback, useState } from 'react'
import { Button } from '@payloadcms/ui'
import { useSelection } from '@payloadcms/ui'

export const BatchTestPrompts: React.FC = () => {
  const { selected } = useSelection()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleBatchTest = useCallback(async () => {
    if (!selected || selected.length === 0) {
      toast.error('Please select prompts to test')
      return
    }

    setLoading(true)
    const testResults = []

    for (const promptId of selected) {
      try {
        const response = await fetch('/api/test-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ promptId }),
        })

        const data = await response.json()
        testResults.push({ promptId, success: response.ok, data })
      } catch (error) {
        testResults.push({ promptId, success: false, error: String(error) })
      }
    }

    setResults(testResults)
    setLoading(false)

    const successCount = testResults.filter((r) => r.success).length
    toast.success(`Tested ${selected.length} prompts. ${successCount} succeeded.`)
  }, [selected])

  return (
    <div className="batch-test-section">
      <h3>Batch Test Prompts</h3>
      <p>Selected: {selected?.length || 0} prompts</p>
      <Button onClick={handleBatchTest} disabled={loading || !selected || selected.length === 0}>
        {loading ? 'Testing...' : 'Test Selected Prompts'}
      </Button>

      {results.length > 0 && (
        <div className="batch-results">
          <h4>Test Results:</h4>
          {results.map((result) => (
            <div key={result.promptId}>
              Prompt {result.promptId}: {result.success ? '✓' : '✗'}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 完整实现示例

### 步骤 1: 创建测试 API 端点

```typescript
// src/app/api/test-prompt/route.ts
import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { promptId } = await request.json()

    // 获取 prompt 数据
    const promptDoc = await payload.findByID({
      collection: 'prompts',
      id: promptId,
      depth: 1,
      overrideAccess: false,
    })

    // 获取关联的测试
    const tests = await payload.find({
      collection: 'prompt-tests',
      where: {
        prompt: {
          equals: promptId,
        },
      },
      limit: 1,
    })

    // 这里可以调用 LLM API 进行测试
    const testResult = {
      promptId,
      prompt: promptDoc.content,
      model: 'gpt-4', // 可以从 prompt 的 modelScores 获取
      timestamp: new Date().toISOString(),
      success: true,
    }

    return Response.json(testResult)
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Test failed' },
      { status: 500 },
    )
  }
}
```

### 步骤 2: 注册组件到 Collection

```typescript
// src/collections/Prompts/index.ts

import { TestPromptButton } from '@/admin/components/TestPromptButton'

export const Prompts: CollectionConfig<'prompts'> = {
  slug: 'prompts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isPublic', 'updatedAt'],
    components: {
      TestPromptButton,
    },
  },
  fields: [
    // ... fields
  ],
}
```

---

## 其他高级功能

### 1. 侧边栏实时预览

```typescript
// 使用 PreviewField 实现实时预览
{
  name: 'preview',
  type: 'ui',
  admin: {
    components: {
      PromptPreview, // 自定义预览组件
    },
  },
}
```

### 2. 自定义操作按钮

```typescript
admin: {
  components: {
    actions: [
      {
        type: 'custom',
        Component: TestPromptActionButton,
      },
    ],
  },
}
```

### 3. 条件显示组件

只在满足条件时显示测试按钮：

```typescript
const TestPromptButton: React.FC = () => {
  const { id } = useDocumentInfo()

  // 只对已发布的 prompt 显示测试按钮
  const [doc, setData] = useState(null)
  // ... logic

  if (doc?._status !== 'published') {
    return null
  }

  return <Button>Test Prompt</Button>
}
```

---

## 总结

Payload CMS admin UI 高度可定制，推荐方案：

1. **快速实现**: 使用 `components` 配置添加自定义组件
2. **复用性**: 创建可复用的 field components
3. **复杂功能**: 使用 custom edit views
4. **测试功能**: 结合 API 端点实现 prompt 测试

需要我帮您实现哪个方案？
