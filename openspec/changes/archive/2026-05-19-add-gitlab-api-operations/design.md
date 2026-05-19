# Design: Add GitLab API Operations

## 技术方案

采用**零依赖、单一文件**架构，继续复用 `gitlab-api.mjs` 中的现有辅助函数：

- `request(method, path, query, body)` - 通用 HTTP 请求
- `paged(method, path, query)` - 分页处理
- `projectId(project)` - 项目标识处理
- `compact(object)` - 过滤空值
- 命令注册在 `commands` 对象中

## 架构决策

1. **命令命名**：使用 `kebab-case`（如 `issue-create`），同时注册 `snake_case` 别名（如 `create_issue`）
2. **参数别名**：参考 GitHub 风格，支持 `issue_id` → `iid`, `project_id` → `project`
3. **错误处理**：复用现有的 404 降级模式（如 mr-diffs 降级到 mr-changes）
4. **分页策略**：列表操作默认使用 `paged()`，100 条/页

## 新增辅助函数

无需新增，保持与现有代码一致。

## 验证策略

1. 语法检查：`node --check gitlab-api.mjs`
2. 命令列表：`gitlab-api.mjs server-config` 确认���命令已注册
3. 实际调用测试（使用提供的 API 凭证）