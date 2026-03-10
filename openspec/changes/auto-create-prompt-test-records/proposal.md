## Why

当前用户在 Prompts collection 中点击"Test Prompt"按钮后，测试结果仅在 toast 通知中临时显示，没有持久化存储到 PromptTests collection。这导致：
1. **测试结果丢失**：用户无法查看历史测试记录
2. **无法追踪**：无法追溯 prompt 在不同模型、不同时间点的表现
3. **重复测试**：无法对比不同测试结果，需要重复执行
4. **手动创建**：用户需要手动在 PromptTests collection 中创建测试记录，增加操作成本

自动化测试记录创建可以提升用户体验，保留完整的测试历史，并为后续的 A/B 测试和 prompt 优化提供数据基础。

## What Changes

### 功能变更

**自动化测试记录创建**：
- ✅ 在 `/api/test-prompt` 端点执行测试后，自动在 PromptTests collection 中创建记录
- ✅ 测试记录包含：prompt 引用、模型信息、输入输出、执行时间、tokens、cost、状态等
- ✅ 记录标题自动生成为：`{Prompt Title} - {Model ID} - {Timestamp}`
- ✅ 执行状态自动更新：pending → running → completed/failed
- ✅ 作者自动设置为当前测试执行用户
- ✅ 与现有 PromptTests collection 完全兼容

**可选功能**（待讨论）：
- ⏸️ 是否在 Admin UI 中显示"查看测试记录"链接
- ⏸️ 是否支持批量测试并创建多条记录
- ⏸️ 是否添加"保存测试"复选框让用户选择是否创建记录

### 技术变更

**API 端点修改**：
- `POST /api/test-prompt` - 在返回测试结果的同时，创建 PromptTests 记录

**Collection Hook**：
- 可选：在 PromptTests afterCreate hook 中添加通知或其他自动化逻辑

**UI/UX 改进**：
- 测试完成后，toast 通知中添加"查看记录"链接
- 在 Prompt 详情页添加"测试历史"列表（可选）

## Capabilities

### New Capabilities

**prompt-test-auto-creation**: 自动化创建 prompt 测试记录，在测试执行后自动将结果持久化到 PromptTests collection，包含完整的执行信息、模型配置和输出结果。

### Modified Capabilities

**prompt-testing**:
- REQUIREMENT CHANGE: 测试执行后不仅返回结果，还要自动创建 PromptTests 记录。测试结果从临时显示变为持久化存储。

**prompt-test-management**:
- REQUIREMENT CHANGE: 支持通过 API 自动创建测试记录，而不仅仅是手动创建。记录字段映射应与测试端点返回的数据格式一致。

## Impact

### 代码变更

**API 端点**:
- `src/app/x/test-prompt/route.ts` - 修改 POST handler，在返回结果前创建 PromptTests 记录

**Collections**:
- `src/collections/PromptTests/index.ts` - 可能需要调整字段以适配自动化创建（如标题自动生成）

**Components**:
- `src/admin/components/TestPromptButton/index.tsx` - 更新 toast 通知，添加"查看记录"链接（可选）

### 数据库变更

**新增数据**：
- 每次测试执行创建一条 PromptTests 记录
- 估计：如果每天 100 次测试，每月增加 ~3000 条记录

**Migration**:
- 无需 schema 变更，使用现有 PromptTests collection 结构

### 性能影响

**API 响应时间**：
- 增加：~50-100ms（创建 PromptTests 记录的时间）
- 缓解：可以使用 `req.payload.create()` 在同一个请求中完成

**数据库写入频率**：
- 增加：每次测试触发一次写入
- 监控：需要关注 PromptTests collection 的增长速度

### 依赖变更

**新增依赖**: 无

**移除依赖**: 无

### Breaking Changes

**无破坏性变更**：
- ✅ 向后兼容：手动创建的 PromptTests 记录继续工作
- ✅ API 响应格式不变：仍返回测试结果
- ✅ 可选功能：用户可以选择是否启用自动创建（通过环境变量或功能开关）

### 兼容性

**向后兼容**:
- ✅ 现有手动创建的测试记录不受影响
- ✅ API 响应格式保持一致

**向前兼容**:
- ✅ 为未来功能预留空间（如批量测试、A/B 测试对比）
