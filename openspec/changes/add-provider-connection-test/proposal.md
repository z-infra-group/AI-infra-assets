## Why

用户在 AI Infrastructure Assets 系统中需要完整的测试能力来验证配置和功能是否正常工作：

1. **Provider 配置验证**：用户保存 LLM Provider 配置后，无法验证连接是否可用。错误或无效的配置（如错误的 API Key、不可达的 Endpoint）会在实际使用时才暴露，导致调试困难和时间浪费。
2. **Prompt 功能测试**：用户创建和优化 Prompts 后，需要快速测试 prompt 在实际 LLM 上的表现，确保 prompt 质量和预期效果。

需要在配置保存和 prompt 创建时提供即时验证机制。

## What Changes

### Provider Connection Testing
- **新增前端组件**：在 LLM Providers 编辑页面添加"测试连接"按钮，显示在侧边栏位置
- **新增 API 端点**：创建 `POST /api/test-llm-provider` 端点执行连接测试
- **支持多种 Provider Types**：
  - OpenAI: 调用 `/v1/models` 端点
  - Anthropic: 发送最小 messages 请求
  - Google Gemini: 调用 models list
  - Ollama: 调用 `/api/tags` 端点
  - LM Studio: 调用 `/v1/models` 端点
  - Azure OpenAI: 调用 deployments endpoint
  - AWS Bedrock: 调用 list foundation models
  - Custom Generic: 使用用户配置的 endpoint 尝试 GET 请求
- **测试逻辑**：优先尝试获取模型列表验证 API 完整性，失败时降级为仅显示连接状态
- **超时控制**：默认 10 秒超时
- **权限控制**：仅 provider 创建者可以执行测试
- **错误处理**：返回用户友好的错误信息，脱敏敏感数据
- **UI 反馈**：显示测试结果（成功/失败）、响应时间、可用模型数量

### Prompt Testing UI
- **新增前端组件**：在 Prompts 编辑页面添加"测试 Prompt"按钮
- **新增 API 端点**：创建 `POST /api/test-prompt` 端点执行 prompt 测试
- **测试逻辑**：
  - 读取 prompt 的 content 和配置（temperature, maxTokens 等）
  - 从 prompt 的 modelScores 选择一个模型进行测试
  - 调用对应 provider 的 API 进行实际推理
  - 返回生成的响应和元数据（tokens used, cost, response time）
- **权限控制**：仅 prompt 创建者可以执行测试
- **错误处理**：捕获 provider API 错误，返回用户友好的错误信息
- **UI 反馈**：显示测试结果（生成的响应、tokens 使用、成本估算）

## Capabilities

### New Capabilities
- `provider-connection-test`: LLM Provider 连接测试功能，支持验证 API Key 和 Endpoint 配置的正确性，以及获取可用模型列表
- `prompt-testing-ui`: Prompt 测试 UI 功能，支持在 admin 面板中直接测试 prompts 并查看 LLM 响应结果

### Modified Capabilities
- `llm-provider-management`: 扩展现有 LLM Provider 管理能力，增加配置验证和测试功能（新增 UI 组件和 API 端点，不修改现有需求）
- `prompt-management`: 扩展现有 Prompt 管理能力，增加 prompt 测试功能（新增 UI 组件和 API 端点，不修改现有需求）

## Impact

- **新增代码**:
  - `src/admin/components/TestProviderConnection/index.tsx`: Provider 测试连接按钮组件
  - `src/app/api/test-llm-provider/route.ts`: Provider 连接测试 API 端点
  - `src/admin/components/TestPromptButton/index.tsx`: Prompt 测试按钮组件
  - `src/app/api/test-prompt/route.ts`: Prompt 测试 API 端点
- **修改代码**:
  - `src/collections/LLMProviders/index.ts`: 注册 TestProviderConnection 组件到 admin.components
  - `src/collections/Prompts/index.ts`: 注册 TestPromptButton 组件到 admin.components
- **新增依赖**: 无（使用现有 fetch API、Payload hooks 和 Local API）
- **数据库变更**: 无（仅读取现有配置）
- **权限影响**:
  - Provider 测试：利用现有 access control，测试端点继承 provider 的 read 权限
  - Prompt 测试：利用现有 access control，测试端点继承 prompt 的 read 权限
