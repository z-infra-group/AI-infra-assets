# Integrate Vercel AI SDK

## Why

当前 `/x/test-prompt` 路由使用原始 HTTP 请求与各个 LLM provider 通信，每个 provider 都有独立的函数（`testWithOpenAI`, `testWithAnthropic` 等），存在大量重复代码和不同的 API 格式处理逻辑。这种方式难以维护，添加新 provider 需要编写大量代码，且缺少统一的错误处理、流式响应支持等高级特性。

Vercel AI SDK 提供了统一的接口来与主流 LLM provider 通信，支持 OpenAI、Anthropic、Google、Cohere 等 50+ provider，可以大幅简化代码、提高可维护性，并为未来功能（如流式响应、tool calling、多模态支持）打下基础。

## What Changes

- **替换 HTTP 请求逻辑**: 移除所有手动的 `fetch` 调用和 provider-specific 函数（`testWithOpenAI`, `testWithAnthropic`, `testWithGoogle`, `testWithOllama`, `testWithCustomProvider`, `testWithAzureOpenAI`）
- **引入 Vercel AI SDK**: 添加 `ai` 包作为依赖，使用 `generateText` API 替代直接 HTTP 请求
- **统一 Provider 配置**: 基于 LLMProviders collection 的配置动态创建 Vercel AI SDK 的 provider 实例
- **保留成本计算**: 继续使用现有的 `calculateCost` 函数计算测试成本
- **保持 API 兼容性**: `/x/test-prompt` 接口的请求/响应格式保持不变，确保前端无需修改
- **支持高级特性**: 为流式响应、tool calling、图像生成等未来功能预留扩展点

## Capabilities

### New Capabilities
- `llm-inference`: 使用 Vercel AI SDK 进行 LLM 推理，支持多 provider 统一接口、流式响应、自动重试、错误处理等特性

### Modified Capabilities
- `prompt-testing`: 将 prompt testing 的底层实现从直接 HTTP 请求改为使用 Vercel AI SDK，但测试流程、权限控制、结果格式等用户可见行为保持不变

## Impact

### Code Changes
- **主要修改**: `src/app/x/test-prompt/route.ts`
  - 移除 ~500 行 provider-specific 函数
  - 添加 Vercel AI SDK 集成代码（预计 ~100 行）
  - 保留认证、权限检查、测试记录创建等逻辑
- **新增文件**:
  - `src/lib/ai-sdk/providers.ts`: Provider 工厂函数，根据 LLMProviders 配置创建 AI SDK provider 实例
  - `src/lib/ai-sdk/config.ts`: AI SDK 配置和辅助函数

### Dependencies
- **新增**: `ai` (Vercel AI SDK)
- **可选新增**: `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google` (如果需要特定 provider 的优化)

### APIs
- **内部**: `/x/test-prompt` 实现细节改变，但接口契约（请求/响应格式）保持 100% 兼容
- **外部**: 无影响

### Data
- **PromptTests collection**: 记录格式不变，继续自动创建测试记录
- **LLMProviders collection**: 配置字段不变，但需要正确映射到 AI SDK provider 配置

### Performance
- **代码大小**: 减少 ~60%（从 ~900 行到 ~350 行）
- **维护性**: 大幅提升（添加新 provider 只需配置，无需编码）
- **功能扩展**: 支持流式响应、tool calling、多模态等高级特性（可选）

### Migration
- **无需数据迁移**: 无 schema 变更
- **无需前端变更**: API 接口保持兼容
- **测试策略**: 在现有 prompt 测试基础上验证新实现的正确性
