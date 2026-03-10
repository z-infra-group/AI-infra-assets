## Context

### 当前状态

项目使用 Payload CMS 3.78.0 + PostgreSQL，管理 LLM Providers 和 Models 的配置。原有设计采用双向 relationship：

```typescript
LLMProvider {
  models: relationship → LLMModel (hasMany)
}

LLMModel {
  provider: relationship → LLMProvider (required)
}
```

这种设计导致：
1. **数据一致性问题**：双向关系需要手动同步
2. **功能限制**：同一个 model 无法属于多个 providers
3. **复杂度高**：API 调用需要 populate，维护成本高

### 约束条件

- **快速上线需求**：需要尽快完成基础功能
- **未来扩展性**：需要预留迁移到更灵活方案的空间
- **最小化破坏**：尽量减少对现有代码的影响

### 利益相关者

- 开发团队：需要清晰的实施路径
- 最终用户：需要支持多 provider 的同一 model
- 运维团队：需要简单的数据维护方式

## Goals / Non-Goals

**Goals:**
1. ✅ 支持同一个 model（如 GPT-4）属于多个不同 providers
2. ✅ 简化数据模型，消除双向关系的一致性问题
3. ✅ API 使用简单，直接从 provider 获取 models
4. ✅ 为未来迁移到方案3（中间表设计）预留空间

**Non-Goals:**
- ❌ 不完全移除 LLMModels collection（保留为可选目录）
- ❌ 不一次性实现方案3（太复杂，影响上线速度）
- ❌ 不修改其他不相关的 collections

## Decisions

### 决策 1：采用方案1（Provider 内嵌配置）

**选择**：将 Provider.models 改为内嵌数组字段

**理由**：
- ✅ **简单直接**：数据结构清晰，维护成本低
- ✅ **快速实施**：无需创建新 collections 或复杂迁移
- ✅ **API 友好**：直接访问 `provider.models`，无需额外查询
- ✅ **支持多 provider**：同一个 modelId 可在不同 providers 中重复

**替代方案及原因**：
- **方案2（全局唯一 Model ID）**：被拒绝，因为需要强制命名约定（`gpt-4-openai`），用户不友好
- **方案3（中间表设计）**：暂不采纳，虽然最灵活但实施复杂度高，影响上线速度

### 决策 2：保留 LLMModels 为可选目录

**选择**：不删除 LLMModels collection，但将其重新定位为"可选的模型目录"

**理由**：
- ✅ **参考价值**：可以作为模型的"百科全书"，存储通用信息（描述、能力等）
- ✅ **平滑过渡**：为未来迁移到方案3保留基础结构
- ✅ **非破坏性**：不强制依赖，减少对现有代码的影响

**权衡**：
- 保留了额外的 collection，增加少量复杂度
- 但提供了更大的灵活性，便于未来扩展

### 决策 3：移除双向关系，改为单向

**选择**：只保留 Provider → Models 的单向关系

**理由**：
- ✅ **消除同步问题**：无需维护双向一致性
- ✅ **简化逻辑**：hooks 和 API 端点更简单
- ✅ **数据完整性**：单一数据源，避免冲突

**实现**：
- 删除 LLMModel.provider 的 `required: true` 约束
- 删除 LLMProvider.models 的 relationship 引用
- 改为内嵌数组配置

### 决策 4：未来迁移路径（方案3）

**选择**：预留清晰的迁移路径到中间表设计

**迁移策略**：
```typescript
// 当前（方案1）
LLMProvider {
  models: [
    { modelId: 'gpt-4', costPerMillTokens: 0.03 }
  ]
}

// 目标（方案3）
LLMProvider { id: 1, displayName: 'OpenAI' }
LLMModel { id: 101, modelId: 'gpt-4' }
ProviderModelConfig {
  provider: 1,
  model: 101,
  costPerMillTokens: 0.03
}
```

**迁移步骤**：
1. 创建 ProviderModelConfig collection
2. 数据迁移脚本：`Provider.models[]` → `ProviderModelConfig` records
3. 更新代码逻辑（API、Admin UI）
4. 删除 Provider.models 数组字段

**迁移复杂度**：⭐⭐⭐☆☆（中等）
- 数据结构相似，转换逻辑清晰
- 需要处理 modelId 冲突
- 需要更新查询逻辑

## Risks / Trade-offs

### 风险 1：Seed 数据格式变化

**风险**：Seed 数据从 relationship IDs 改为内嵌配置，可能导致现有 seed 失效

**缓解**：
- ✅ 已更新所有相关 seed 文件
- ✅ 添加了注释说明新格式
- ✅ 验证了类型生成正确

### 风险 2：API 响应格式不兼容

**风险**：API 响应从 `[1, 2, 3]` 改为 `[{ modelId: 'gpt-4', ... }]`，可能破坏现有客户端

**缓解**：
- ✅ 检查了所有 API 端点，确认已兼容新格式
- ✅ test-prompt 端点已支持从 `provider.models` 数组读取
- ✅ 无外部客户端依赖（内部 admin API）

### 风险 3：数据迁移到方案3 的复杂性

**风险**：未来迁移需要处理数据转换和冲突

**缓解**：
- ✅ 详细的迁移计划（记录在 Tasks 中）
- ✅ 数据结构相似，转换逻辑清晰
- ✅ 可以渐进式迁移，不影响当前使用

### Trade-offs

| 方面 | 方案1（当前） | 方案3（未来） |
|------|--------------|--------------|
| **实施难度** | ⭐⭐☆☆☆ | ⭐⭐⭐⭐☆ |
| **灵活性** | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐⭐ |
| **数据一致性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐☆ |
| **维护成本** | ⭐⭐⭐⭐☆ | ⭐⭐⭐☆☆ |
| **API 简洁性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐☆☆ |

**选择理由**：当前优先考虑实施难度和 API 简洁性，未来再提升灵活性。

## Migration Plan

### 阶段 1：当前改造（方案1）- ✅ 已完成

**步骤**：
1. ✅ 修改 LLMProviders collection：models 改为数组
2. ✅ 修改 LLMModels collection：provider 改为可选
3. ✅ 更新 seed 数据
4. ✅ 更新 hooks（移除 slug 依赖）
5. ✅ 重新生成 TypeScript 类型

**验证**：
- ✅ TypeScript 编译通过
- ✅ Seed 数据格式正确
- ✅ API 端点兼容

### 阶段 2：稳定运行（当前阶段）

**目标**：收集使用反馈，验证方案1的可行性

**时间**：1-3 个月（或直到出现以下触发条件）

**触发迁移的条件**：
- Provider 数量 > 5 个
- Model 总数 > 50 个
- 需要频繁跨 provider 分析数据
- 团队规模扩大，需要更好的数据管理

### 阶段 3：迁移到方案3（未来）

**步骤**：

**3.1 创建新 Collection**
```typescript
// src/collections/ProviderModelConfig/index.ts
export const ProviderModelConfig: CollectionConfig = {
  slug: 'provider-model-configs',
  fields: [
    {
      name: 'provider',
      type: 'relationship',
      relationTo: 'llm-providers',
      required: true,
    },
    {
      name: 'model',
      type: 'relationship',
      relationTo: 'llm-models',
      required: true,
    },
    {
      name: 'costPerMillTokens',
      type: 'number',
    },
    {
      name: 'maxTokens',
      type: 'number',
    },
    {
      name: 'contextLength',
      type: 'number',
    },
    // ... 其他 provider 特有配置
  ],
}
```

**3.2 数据迁移脚本**
```typescript
// scripts/migrate-to-provider-model-configs.ts
async function migrate() {
  const providers = await payload.find({ collection: 'llm-providers' })

  for (const provider of providers.docs) {
    for (const modelData of provider.models) {
      // 1. 查找或创建 LLMModel
      let llmModel = await payload.find({
        collection: 'llm-models',
        where: { modelId: { equals: modelData.modelId } }
      })

      if (!llmModel.docs[0]) {
        llmModel = await payload.create({
          collection: 'llm-models',
          data: {
            modelId: modelData.modelId,
            displayName: modelData.displayName,
          }
        })
      }

      // 2. 创建 ProviderModelConfig
      await payload.create({
        collection: 'provider-model-configs',
        data: {
          provider: provider.id,
          model: llmModel.docs[0].id,
          costPerMillTokens: modelData.costPerMillTokens,
          maxTokens: modelData.maxTokens,
          contextLength: modelData.contextLength,
        }
      })
    }
  }
}
```

**3.3 更新 API 端点**
```typescript
// 修改查询逻辑
const provider = await payload.find({
  collection: 'llm-providers',
  id: providerId,
})

// 新方式
const configs = await payload.find({
  collection: 'provider-model-configs',
  where: { provider: { equals: providerId } },
  depth: 1,
})
const models = configs.docs.map(c => c.model)
```

**3.4 更新 Admin UI**
- 移除 Provider 的 models 数组字段
- 添加 ProviderModelConfig 的 inline 编辑功能
- 创建自定义组件显示 Provider 的 Models

**3.5 清理旧字段**
```sql
-- 创建 migration
ALTER TABLE llm_providers DROP COLUMN models;
```

**回滚策略**：
- 保留 Provider.models 字段直到完全验证
- 使用 feature flags 控制新旧逻辑切换
- 准备快速回滚脚本

## Open Questions

1. **Q: 何时开始方案3迁移？**
   A: 当触发条件满足（Provider > 5个 或 Models > 50个）或团队需要更灵活的管理时

2. **Q: 迁移期间是否支持新旧格式共存？**
   A: 可以使用 feature flags，渐进式迁移，降低风险

3. **Q: LLMModels collection 在方案3中会保留吗？**
   A: 会保留，作为"模型目录"存储通用信息，与 ProviderModelConfig 分离

4. **Q: 如何处理 modelId 冲突（同一 modelId 在多个 providers 中）？**
   A: 在方案3中，modelId 在 LLMModels 中唯一，通过 ProviderModelConfig 关联到多个 providers
