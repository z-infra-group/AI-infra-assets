# Vercel AI SDK 集成设计

## Context

### 当前状态

当前 `/x/test-prompt` 路由使用原始 HTTP `fetch` 请求与 LLM providers 通信：

- **代码量**: ~900 行，包含 6 个 provider-specific 函数（testWithOpenAI, testWithAnthropic, testWithGoogle, testWithOllama, testWithCustomProvider, testWithAzureOpenAI）
- **维护成本**: 每个新 provider 需要编写新函数，处理不同的 API 格式、错误响应、token 计数方式
- **重复代码**: 大量重复的请求构建、错误处理、超时控制逻辑
- **功能限制**: 不支持流式响应、tool calling、多模态等高级特性

### 约束条件

1. **API 兼容性**: `/x/test-prompt` 接口必须保持 100% 兼容（请求/响应格式不变）
2. **数据兼容性**: PromptTests 记录格式不变，继续自动创建测试记录
3. **权限模型**: 保持现有的所有权验证（只能测试自己拥有的 prompt 和 provider）
4. **成本计算**: 必须继续返回准确的 token 使用和成本估算
5. **Provider 配置**: 基于 LLMProviders collection 动态配置，不硬编码 API keys

## Goals / Non-Goals

**Goals:**
- 简化 LLM 推理代码，减少 60% 以上代码量
- 统一多 provider 接口，易于添加新 provider
- 保留所有现有功能（权限检查、测试记录、成本计算）
- 支持未来扩展（流式响应、tool calling、多模态）

**Non-Goals:**
- 修改 LLMProviders collection schema（配置字段保持不变）
- 修改 PromptTests collection schema（记录格式保持不变）
- 改变前端组件（TestPromptButton 组件无需修改）
- 实现流式响应（当前版本仍然使用非流式 API）

## Decisions

### 1. 使用 AI SDK Core 而非完整 AI SDK

**决策**: 只安装 `ai` 包（AI SDK Core），不安装 UI 包（@ai-sdk/react 等）

**理由**:
- 我们只需要服务端的 `generateText` API
- 不需要 React hooks（useChat, useCompletion 等）
- 减小 bundle 大小，避免不必要的依赖

**替代方案**: 安装完整 AI SDK - 被拒绝因为引入了不需要的 UI 依赖

### 2. Provider 工厂模式

**决策**: 创建 `createAISDKProvider()` 工厂函数，基于 LLMProviders 配置动态创建 AI SDK provider 实例

**实现**:
```typescript
// src/lib/ai-sdk/providers.ts
export function createAISDKProvider(provider: LLMProvider) {
  switch (provider.providerType) {
    case 'openai':
      return createOpenAI({ apiKey: provider.apiKey, baseURL: provider.apiEndpoint })
    case 'anthropic':
      return createAnthropic({ apiKey: provider.apiKey, baseURL: provider.apiEndpoint })
    // ...
  }
}
```

**理由**:
- 支持动态配置（API keys、endpoints 从数据库读取）
- 保持代码 DRY（Don't Repeat Yourself）
- 易于添加新 provider

**替代方案**:
- 全局配置 provider - 被拒绝因为需要支持多用户、多 provider
- 硬编码所有 provider - 被拒绝因为不够灵活

### 3. 保留 calculateCost 函数

**决策**: 继续使用现有的 `calculateCost` 函数，不依赖 AI SDK 的 usage metadata

**理由**:
- AI SDK 的 usage 格式可能与我们现有的 pricing 数据不完全匹配
- 我们已经有了完善的成本计算逻辑（支持 per-token pricing 和 average pricing）
- 需要与 PromptTests 记录保持一致

**权衡**: AI SDK 提供的 `usage` metadata 包含 token 计数，我们可以直接使用，但成本计算需要自定义

### 4. 错误处理策略

**决策**: 使用 AI SDK 的内置错误处理，但转换为现有的错误响应格式

**实现**:
```typescript
try {
  const { text, usage } = await generateText({ model, prompt })
  // 返回标准响应
} catch (error) {
  if (error instanceof AISDKError) {
    // 转换为现有错误格式
    return { success: false, error: mapAISDKError(error) }
  }
}
```

**理由**:
- AI SDK 提供了详细的错误类型（RateLimitError, InvalidArgumentError 等）
- 前端依赖现有的错误消息格式
- 需要保持向后兼容

### 5. 不使用 OpenAI-compatible provider

**决策**: 对于 Cohere、Hugging Face、LM Studio、Custom 等 provider，使用 AI SDK 的 native provider 包而非 generic OpenAI-compatible provider

**实现**:
- 安装 `@ai-sdk/cohere` 用于 Cohere
- 安装 `ollama-ai-provider` 用于 Ollama
- 使用 `createOpenAI()` 配合 custom baseURL 用于其他 OpenAI-compatible providers

**理由**:
- Native provider 提供更好的错误处理和功能支持
- 避免 "best effort" 兼容性带来的潜在问题
- Native provider 通常有更准确的 token 计数和 usage metadata

## Architecture

### 文件结构

```
src/lib/ai-sdk/
├── providers.ts       # Provider 工厂函数
├── config.ts          # AI SDK 配置和辅助函数
└── types.ts           # 类型定义（可选，使用 AI SDK 内置类型）

src/app/x/test-prompt/
└── route.ts           # 修改后的路由（使用 AI SDK）
```

### 数据流

```
POST /x/test-prompt
  ↓
1. 认证 & 权限检查（保持不变）
  ↓
2. 获取 prompt 和 provider 配置（保持不变）
  ↓
3. createAISDKProvider(provider) ← 新增
  ↓
4. generateText({ model, prompt }) ← 替换 fetch 调用
  ↓
5. calculateCost(tokens, modelDoc) ← 保持不变
  ↓
6. 创建 PromptTests 记录（保持不变）
  ↓
7. 返回响应（格式不变）
```

## Risks / Trade-offs

### Risk 1: AI SDK 不支持某些自定义 provider

**风险**: 用户配置的自定义 endpoint 可能不被 AI SDK 的 native provider 支持

**缓解措施**:
- 对于 OpenAI-compatible endpoints，使用 `createOpenAI()` 配合自定义 baseURL
- 提供清晰的错误消息，说明哪些 provider 类型被支持
- 保留 fallback 到原始 HTTP 请求的选项（可选）

### Risk 2: Token 计数差异

**风险**: AI SDK 返回的 token 计数可能与现有实现不同，导致成本计算不准确

**缓解措施**:
- 在测试阶段对比新旧实现的 token 计数
- 如果差异显著，优先使用 provider 返回的 usage metadata
- 记录 token 计数到 PromptTests，便于后续分析

### Risk 3: 依赖体积增加

**风险**: AI SDK 及其 provider 包可能增加 bundle 大小

**缓解措施**:
- AI SDK Core 很小（~50KB gzipped）
- 只安装需要的 provider 包（按需加载）
- Next.js 自动 tree-shaking 未使用的代码

### Risk 4: Breaking changes in AI SDK

**风险**: Vercel AI SDK 可能有 breaking changes，导致升级困难

**缓解措施**:
- 锁定 `ai` 包版本在 package.json
- 关注 AI SDK changelog，评估升级影响
- 良好的测试覆盖确保升级安全

### Trade-off: 灵活性 vs. 抽象

**权衡**: AI SDK 提供统一接口，但可能牺牲一些 provider-specific 功能

**评估**:
- 对于 prompt testing 场景，统一接口足够
- 如需 provider-specific 功能，可以使用 provider options 参数
- 必要时可以回退到原始 HTTP 请求（escape hatch）

## Migration Plan

### 阶段 1: 安装依赖和基础设施（1-2 小时）

1. 安装依赖:
   ```bash
   pnpm add ai
   pnpm add @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
   pnpm add @ai-sdk/azure ollama-ai-provider @ai-sdk/cohere
   ```

2. 创建文件:
   - `src/lib/ai-sdk/providers.ts`
   - `src/lib/ai-sdk/config.ts`

3. 更新 TypeScript 配置（如需要）

### 阶段 2: 实现 Provider 工厂（2-3 小时）

1. 实现 `createAISDKProvider()` 函数
2. 支持所有现有的 provider 类型
3. 处理自定义 endpoints 和 auth types
4. 添加单元测试

### 阶段 3: 替换 test-prompt 路由（2-3 小时）

1. 移除所有 `testWith*` 函数
2. 替换为 `generateText()` 调用
3. 保留所有其他逻辑（认证、权限、测试记录）
4. 添加错误映射

### 阶段 4: 测试和验证（2-3 小时）

1. 单元测试：mock AI SDK responses
2. 集成测试：测试各个 provider
3. 手动测试：通过 admin UI 测试 prompts
4. 对比测试：新旧实现结果对比
5. 性能测试：确保响应时间没有显著增加

### 阶段 5: 部署和监控（1 小时）

1. 部署到开发环境
2. 监控错误日志和性能指标
3. 收集用户反馈
4. 修复发现的问题
5. 部署到生产环境

### 总计: 8-12 小时

### Rollback 策略

如果新实现出现严重问题：

1. **立即回滚**:
   - Git revert 到迁移前的 commit
   - 重新部署旧版本
   - 无需数据库迁移

2. **数据回滚**:
   - 不需要（PromptTests 记录格式不变）

3. **回滚后修复**:
   - 保留新代码在分支
   - 修复问题后重新部署

## Open Questions

1. **AWS Bedrock 支持**: AI SDK 有 `@ai-sdk/amazon-bedrock` 包，但 Bedrock 需要复杂的 SigV4 签名。当前我们的 Bedrock 实现返回 "not supported" 错误。是否应该在新版本中启用 Bedrock 支持？

2. **流式响应**: 虽然当前版本不实现流式响应，但未来是否需要在 test-prompt 路由中支持？这可能会改变 API 契约。

3. **自定义 Provider 验证**: 如何验证用户配置的自定义 endpoint 是否真的与 AI SDK 兼容？是否需要添加测试端点？

4. **成本计算精度**: 如果 AI SDK 的 token 计数与现有实现不同，应该优先使用哪个？是否需要添加配置选项？
