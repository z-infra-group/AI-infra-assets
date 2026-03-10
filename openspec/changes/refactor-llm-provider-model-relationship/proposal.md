## Why

LLM Providers 和 LLM Models 之间存在双向关联导致数据一致性问题，且无法支持同一个 model（如 GPT-4）属于多个不同 providers（OpenAI、Azure、自定义端点）的场景。当前设计要求每个 model 必须属于单一 provider，限制了系统的灵活性。此外，双向关系需要手动同步维护，增加复杂性和出错风险。

需要一种既能简化当前实现（方便快速上线），又能为未来扩展（支持同一 model 多 provider 部署）留出空间的数据模型设计。

## What Changes

### 当前改造（方案1：Provider 内嵌 Model 配置）

**LLMProviders Collection**:
- ✅ 将 `models` 字段从 `relationship` 改为 `array` 类型
- ✅ 每个 model 配置内嵌在 provider 中：`{ modelId, displayName, maxTokens, contextLength, costPerMillTokens }`
- ✅ 移除对 LLMModels collection 的依赖
- ✅ 移除 SEO fields（与其他 admin-only collections 保持一致）

**LLMModels Collection**:
- ✅ 将 `provider` 字段从 `required: true` 改为可选
- ✅ 重新定位为"可选的模型目录"（catalog/reference），而非必需的配置源
- ✅ 移除 SEO fields

**Seed 数据**:
- ✅ 更新 provider seed 数据，包含 models 数组配置
- ✅ 更新 model seed 数据，provider 改为可选参考

### 未来迁移（方案3：中间表设计）

**创建新 Collection**:
- 新增 `ProviderModelConfig` collection 作为中间表
- 支持每个 provider-model 组合的独立配置
- 完全解耦 LLMProvider 和 LLMModel

**数据迁移**:
- 从 Provider.models 数组提取数据到 ProviderModelConfig
- 从 LLMModels 目录创建通用 model 记录
- 建立正确的 relationship 引用

**代码更新**:
- 更新 API 端点（test-llm-provider, test-prompt）
- 更新 Admin UI 组件
- 更新查询逻辑

## Capabilities

### New Capabilities

**llm-provider-model-configuration**: LLM Provider 和 Model 的配置管理，支持内嵌配置（当前）和未来迁移到中间表设计。

### Modified Capabilities

**llm-provider-management**:
- REQUIREMENT CHANGE: 从双向 relationship 改为单向内嵌配置
- 移除对 LLMModels 的强依赖
- Provider 现在直接包含 models 配置数组

**llm-model-management**:
- REQUIREMENT CHANGE: 从必需的 provider 关系改为可选参考
- LLMModels 重新定位为可选的模型目录，而非配置源

## Impact

### 代码变更

**Collections**:
- `src/collections/LLMProviders/index.ts` - models 字段类型变更
- `src/collections/LLMModels/index.ts` - provider 字段 required 属性移除
- `src/collections/LLMProviders/hooks/revalidateProvider.ts` - 已更新（移除 slug 依赖）
- `src/collections/LLMModels/hooks/revalidateModel.ts` - 已更新（移除 slug 依赖）

**Seed 数据**:
- `src/endpoints/seed/provider-1.ts` - 添加 models 数组
- `src/endpoints/seed/provider-2.ts` - 添加 models 数组
- `src/endpoints/seed/model-1.ts` - provider 改为可选
- `src/endpoints/seed/model-2.ts` - provider 改为可选

**API 端点**（已兼容，无需修改）:
- `src/app/x/test-llm-provider/route.ts` - 已支持内嵌配置
- `src/app/x/test-prompt/route.ts` - 已支持从 provider.models 读取

### 数据库变更

**当前（方案1）**:
- 无需 migration（数据结构从 relationship 改为 array，Payload 自动处理）
- 现有 relationship 数据会丢失（如果有的话）

**未来（方案3迁移）**:
- 需要创建 migration 脚本
- 需要数据转换逻辑（array → ProviderModelConfig）
- 需要处理可能的 modelId 冲突

### 依赖变更

**新增依赖**: 无

**移除依赖**:
- LLMProviders 不再强依赖 LLMModels collection

### Breaking Changes

**API 响应格式变化**:
```typescript
// 之前
{
  models: [1, 2, 3]  // relationship IDs
}

// 现在
{
  models: [
    { modelId: 'gpt-4', displayName: 'GPT-4', ... }
  ]
}
```

**Seed 数据格式变化**:
- Provider 创建时需要提供完整的 models 数组配置
- Model 创建时 provider 字段变为可选

### 兼容性

**向后兼容**:
- ❌ API 响应格式不兼容（relationship IDs → 内嵌配置）
- ✅ 查询语法兼容（仍可通过 `models.modelId` 过滤）

**向前兼容**:
- ✅ 为方案3迁移预留空间
- ✅ LLMModels 作为可选目录保留，便于未来扩展
