## Context

### 当前状态

**测试流程**：
1. 用户在 Prompts admin 页面点击"Test Prompt"按钮
2. 前端调用 `POST /api/test-prompt` 端点，传入 `{ promptId }`
3. 后端执行 prompt 测试，返回结果（generatedText, tokensUsed, cost 等）
4. 前端在 toast 通知中显示结果（临时）
5. **测试结果丢失**：没有持久化到数据库

**PromptTests Collection**：
- 已存在，用于手动创建测试记录
- 包含字段：title, description, prompt (relationship), author, inputVariables, expectedOutput, actualOutput, testConfig, modelUnderTest, executionStatus, executedAt, executionTime, tokensUsed, cost, score, feedback, isVerified
- 当前仅支持手动创建，与测试端点完全独立

**技术栈**：
- Payload CMS 3.78.0
- Next.js 15 App Router
- PostgreSQL
- TypeScript

### 约束条件

- **最小化破坏**：不能影响现有的手动测试记录创建流程
- **性能要求**：测试执行时间不应显著增加（目标：< 100ms 额外延迟）
- **数据完整性**：创建的记录必须完整且符合 PromptTests schema
- **用户体验**：测试完成后应提供即时反馈（toast + 可选的记录链接）

### 利益相关者

- **最终用户**：需要查看历史测试记录，对比不同模型的表现
- **开发团队**：需要清晰的实现路径，易于维护和调试
- **运维团队**：需要监控 PromptTests collection 的增长速度

## Goals / Non-Goals

**Goals:**
1. ✅ 自动化创建测试记录，无需手动操作
2. ✅ 保留完整的测试执行信息（输入、输出、配置、结果）
3. ✅ 自动生成记录标题，便于识别
4. ✅ 维护现有的手动创建流程（向后兼容）
5. ✅ 性能影响最小化（< 100ms 额外延迟）

**Non-Goals:**
- ❌ 不修改 PromptTests collection schema（使用现有字段）
- ❌ 不实现测试结果的实时 UI 展示（仅在 toast 中提示）
- ❌ 不支持批量测试创建多条记录（单次测试 = 单条记录）
- ❌ 不添加"保存测试"复选框（默认始终创建，可通过环境变量禁用）

## Decisions

### 决策 1：在测试端点中直接创建记录

**选择**：在 `POST /api/test-prompt` 端点中，在返回结果前使用 `req.payload.create()` 创建 PromptTests 记录

**理由**：
- ✅ **简单直接**：在同一个请求中完成测试和创建，事务性强
- ✅ **原子性**：测试失败时不会创建记录，数据一致性好
- ✅ **性能好**：使用 Payload Local API，无需额外的 HTTP 请求
- ✅ **易于调试**：所有逻辑在一个端点中，便于追踪问题

**替代方案及原因**：
- **前端创建**：被拒绝，前端无法直接访问 Payload API，安全性差
- **异步队列**：被拒绝，增加复杂度，且测试结果需要立即返回
- **Hook 创建**：被拒绝，PromptTests 的 hook 无法访问测试上下文

### 决策 2：自动生成记录标题

**选择**：使用格式 `{Prompt Title} - {Model ID} - {Timestamp}` 生成标题

**理由**：
- ✅ **信息完整**：包含 prompt、模型、时间三个关键信息
- ✅ **易于识别**：用户可以快速了解测试内容
- ✅ **避免冲突**：时间戳确保唯一性

**格式示例**：
```
"Claude 3 Opus - claude-3-opus-20240229 - 2026-03-10 14:30"
```

**替代方案及原因**：
- **UUID**：被拒绝，不友好，用户无法识别
- **手动输入**：被拒绝，违背自动化初衷
- **仅使用 prompt 标题**：被拒绝，同一 prompt 的多次测试会冲突

### 决策 3：映射测试结果到 PromptTests 字段

**选择**：建立清晰的字段映射关系

**映射方案**：
```typescript
{
  title: auto-generated,                    // "Prompt - Model - Timestamp"
  description: null,                        // 可选，未来可支持
  prompt: promptId,                         // relationship
  author: req.user.id,                      // 当前用户
  inputVariables: null,                     // 测试未使用变量替换
  expectedOutput: null,                     // 预期输出（未来功能）
  actualOutput: generatedText,              // 实际生成的文本
  testConfig: {                             // LLM 参数
    temperature: prompt.temperature,
    maxTokens: prompt.maxTokens,
    topP: prompt.topP,
    // ... 其他参数
  },
  modelUnderTest: modelId,                 // 使用的模型 ID
  executionStatus: 'completed',            // 或 'failed'
  executedAt: new Date(),                   // 执行时间
  executionTime: responseTime,              // 响应时间（ms）
  tokensUsed: tokensUsed.totalTokens,       // 总 tokens
  cost: estimatedCost,                      // 成本估算
  score: null,                              // 评分（手动或未来自动评估）
  feedback: null,                           // 反馈（手动）
  isVerified: false,                        // 人工验证标志
}
```

### 决策 4：错误处理策略

**选择**：测试失败时创建状态为 'failed' 的记录

**理由**：
- ✅ **完整记录**：失败的测试也是宝贵的信息
- ✅ **问题追踪**：用户可以查看失败原因和频率
- ✅ **透明性**：如实记录所有测试尝试

**失败场景处理**：
- Provider 连接失败 → status: 'failed', actualOutput 包含错误信息
- API key 无效 → status: 'failed', actualOutput: "Authentication failed"
- 超时 → status: 'failed', actualOutput: "Request timeout"
- 其他错误 → status: 'failed', actualOutput: error message

### 决策 5：性能优化策略

**选择**：使用 Payload Local API 的 `overrideAccess: false`

**代码示例**：
```typescript
await req.payload.create({
  collection: 'prompt-tests',
  data: { /* ... */ },
  req,  // 传入 req 以保持上下文和权限检查
  overrideAccess: false,  // 强制执行权限检查
})
```

**理由**：
- ✅ **安全性**：强制检查创建权限，防止绕过访问控制
- ✅ **性能**：Local API 比 HTTP 请求快 10-100 倍
- ✅ **一致性**：与前端使用相同的权限逻辑

**性能预估**：
- Local API 创建：~20-50ms
- HTTP API 创建：~100-200ms
- **预期总延迟增加**：< 100ms

### 决策 6：功能开关

**选择**：添加环境变量 `ENABLE_AUTO_PROMPT_TEST_RECORD`（默认: true）

**理由**：
- ✅ **灵活性**：允许在需要时禁用自动创建
- ✅ **测试环境**：可以在测试环境关闭避免污染数据
- ✅ **渐进式推出**：出现问题可快速关闭

**实现**：
```typescript
const enableAutoCreate = process.env.ENABLE_AUTO_PROMPT_TEST_RECORD !== 'false'
if (enableAutoCreate) {
  await req.payload.create({ /* ... */ })
}
```

## Risks / Trade-offs

### 风险 1：数据库快速增长

**风险**：每次测试创建记录，可能导致 PromptTests collection 快速增长

**影响评估**：
- 假设每天 100 次测试，每月 ~3000 条记录
- 每条记录 ~1-5KB（取决于 actualOutput 大小）
- 月增长：~3-15MB，年增长：~36-180MB

**缓解**：
- ✅ 使用数据库索引优化查询
- ✅ 添加归档策略（如 6 个月后归档到冷存储）
- ✅ 监控 collection 大小，设置告警阈值
- ✅ 考虑添加"清除旧记录"功能

### 风险 2：性能影响

**风险**：创建记录增加测试响应时间，影响用户体验

**缓解**：
- ✅ 使用 Local API 而非 HTTP API（减少 100+ms）
- ✅ 异步创建（未来优化）：先返回结果，后台创建记录
- ✅ 数据库优化：确保 PromptTests 表有正确的索引
- ✅ 性能监控：添加 metrics 跟踪创建时间

**当前设计预估**：
- 额外延迟：50-100ms
- 可接受范围：< 200ms

### 风险 3：记录创建失败

**风险**：测试成功但记录创建失败，数据不一致

**缓解**：
- ✅ **不返回错误**：记录创建失败不应影响测试结果返回
- ✅ **日志记录**：记录创建失败的详细信息
- ✅ **用户提示**：在 toast 中添加"记录保存失败"警告（可选）
- ✅ **重试机制**：未来可添加后台重试逻辑

**实现策略**：
```typescript
try {
  await req.payload.create({ /* ... */ })
} catch (error) {
  console.error('Failed to create prompt test record:', error)
  // 不抛出错误，不影响测试结果返回
}
```

### Trade-offs

| 方面 | 当前方案 | 替代方案 | 权衡结果 |
|------|---------|---------|---------|
| **实时性** | 同步创建（测试中） | 异步创建（测试后） | 选择同步：简单、原子性强 |
| **性能** | +50-100ms 延迟 | 无额外延迟 | 接受延迟：数据完整性优先 |
| **可靠性** | 测试和记录原子性 | 可能不一致 | 选择原子性：数据质量优先 |
| **存储成本** | 每次测试都存储 | 手动选择存储 | 接受成本：完整记录价值高 |

## Migration Plan

### 阶段 1：实现自动创建功能（当前）

**步骤**：
1. 修改 `src/app/x/test-prompt/route.ts`
2. 在返回结果前添加 `req.payload.create()` 调用
3. 映射测试结果字段到 PromptTests schema
4. 添加错误处理和日志
5. 测试验证

**验证标准**：
- ✅ 测试执行后 PromptTests collection 出现新记录
- ✅ 记录包含完整的测试信息
- ✅ API 响应时间增加 < 200ms
- ✅ 现有手动创建流程不受影响

### 阶段 2：UI 改进（可选）

**步骤**：
1. 修改 `src/admin/components/TestPromptButton/index.tsx`
2. 在 toast 中添加"查看记录"链接
3. 链接到新建的 PromptTests 记录

**验证标准**：
- ✅ 测试完成后 toast 显示"查看记录"链接
- ✅ 点击链接正确导航到记录详情

### 阶段 3：增强功能（未来）

**可能的增强**：
- 在 Prompt 详情页显示"测试历史"列表
- 添加 A/B 测试对比功能
- 支持批量测试并创建多条记录
- 自动评分和反馈（使用 LLM 评估输出质量）

### 回滚策略

**如果出现问题**：
1. **快速禁用**：设置环境变量 `ENABLE_AUTO_PROMPT_TEST_RECORD=false`
2. **代码回滚**：移除自动创建逻辑，恢复原有测试端点
3. **数据清理**（可选）：删除自动创建的记录（通过 author 和时间戳筛选）

**回滚步骤**：
1. 设置环境变量禁用功能
2. 验证测试功能恢复正常
3. 评估是否需要清理数据
4. 如需清理，运行脚本删除指定时间范围的记录

## Open Questions

1. **Q: 是否需要添加"保存测试"复选框让用户选择？**
   A: 暂不需要，默认始终创建。如果用户反馈不喜欢，可以添加环境变量控制。

2. **Q: actualOutput 字段长度限制？**
   A: PromptTests schema 中 actualOutput 是 textarea 类型，无明确限制。建议在实际使用中监控，如果过长可以考虑截断或存储到 S3。

3. **Q: 是否需要去重？**
   A: 暂不去重，每次测试都创建新记录，这样可以追踪时间序列变化。如果数据增长过快，可以考虑合并策略。

4. **Q: 记录标题格式是否需要国际化？**
   A: 暂不支持国际化，使用固定格式。如需要未来可添加多语言支持。

5. **Q: 是否需要添加"测试目的"字段？**
   A: 当前不需要，使用 description 字段即可。如果用户反馈需要，可以在 PromptTests collection 中添加 `testPurpose` 字段。

6. **Q: 如何处理高频测试场景？**
   A: 当前设计是 1 次测试 = 1 条记录。如果出现高频测试场景（如自动化 CI/CD），可以考虑：
   - 添加采样策略（如每 10 次测试保存 1 次）
   - 添加"测试会话"概念，一次会话包含多次测试
   - 仅保存失败的测试
