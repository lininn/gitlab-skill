# Proposal: Add GitLab API Operations (Issues, Labels, Snippets, Wikis, Releases)

## 背景

当前 GitLab MCP Skill (`gitlab-api.mjs`) 已实现：
- 项目/仓库信息 (project, tree, branches, tags, file, compare)
- Merge Requests (21个命令)
- 提交 (commit, commits, commit-diff, comments, statuses)
- CI/CD (pipelines, jobs)
- 代码质量分析

**遗漏的高价值 API**：
- Issues 问题管理
- Labels 标签管理
- Snippets 代码片段
- Wikis Wiki 页面
- Releases 发布版本

## 需求

补全以上 5 个模块的完整 CRUD 操作，与现有代码风格保持一致：
- 使用 `paged()` 辅助函数处理分页
- 使用 `projectId()` 处理项目标识
- 使用 `compact()` 过滤空值
- 支持 GitHub 兼容的参数别名（如 `issue_id` → `iid`）

## 设计方案：分批实现

### 第一批：Issues（最高优先级）
- `issues` - 列表项目 Issue
- `issue` - 获取单个 Issue
- `issue-create` / `create_issue` - 创建 Issue
- `issue-update` / `update_issue` - 更新 Issue（含关闭/重开）
- `issue-delete` / `delete_issue` - 删除 Issue
- `issue-notes` - Issue 评论列表
- `issue-note-create` - 创建 Issue 评论

### 第二批：Labels + Snippets
**Labels:**
- `labels` - 列表项目标签
- `label-create` / `create_label` - 创建标签
- `label-update` / `update_label` - 更新标签
- `label-delete` / `delete_label` - 删除标签

**Snippets:**
- `snippets` - 列表项目代码片段
- `snippet` - 获取单个代码片段
- `snippet-create` / `create_snippet` - 创建代码片段
- `snippet-update` / `update_snippet` - 更新代码片段
- `snippet-delete` / `delete_snippet` - 删除代码片段
- `snippet-raw` - 获取代码片段原始内容

### 第三批：Wikis + Releases
**Wikis:**
- `wikis` - 列表 Wiki 页面
- `wiki` - 获取单个 Wiki 页面（含内容）
- `wiki-create` / `create_wiki` - 创建 Wiki 页面
- `wiki-update` / `update_wiki` - 更新 Wiki 页面
- `wiki-delete` / `delete_wiki` - 删除 Wiki 页面

**Releases:**
- `releases` - 列表项目发布
- `release` - 获取单个发布
- `release-create` / `create_release` - 创建发布
- `release-update` / `update_release` - 更新发布
- `release-delete` / `delete_release` - 删除发布

## 实现约束

1. **零依赖**：继续使用 Node.js 内置模块
2. **风格一致**：复用现有辅助函数
3. **向后兼容**：添加命令不影响现有功能
4. **错误处理**：保持现有的错误处理模式