# 实现计划：add-gitlab-api-operations

## 来源
- 提案：openspec/changes/add-gitlab-api-operations/proposal.md
- 设计：openspec/changes/add-gitlab-api-operations/design.md
- 规格：openspec/changes/add-gitlab-api-operations/specs/
- 任务：openspec/changes/add-gitlab-api-operations/tasks.md

## 实现步骤

### Task 1: Issues API (最高优先级)

#### Step 1.1: 添加 Issues 列表和单个查询命令
- **目标**: 实现 `issues` 和 `issue` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: `node gitlab/scripts/gitlab-api.mjs issues '{"project": "test"}'` 确认命令注册

#### Step 1.2: 添加 Issue 创建命令
- **目标**: 实现 `issue-create` / `create_issue` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: 调用 API 创建测试 Issue

#### Step 1.3: 添加 Issue 更新命令
- **目标**: 实现 `issue-update` / `update_issue` 命令（含关闭/重开）
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: 调用 API 更新测试 Issue

#### Step 1.4: 添加 Issue 删除命令
- **目标**: 实现 `issue-delete` / `delete_issue` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: 调用 API 删除测试 Issue

#### Step 1.5: 添加 Issue 评论命令
- **目标**: 实现 `issue-notes` 和 `issue-note-create` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: 调用 API 添加评论

---

### Task 2: Labels API

#### Step 2.1: 添加 Labels 列表命令
- **目标**: 实现 `labels` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: `node gitlab/scripts/gitlab-api.mjs labels '{"project": "test"}'`

#### Step 2.2: 添加 Labels CRUD 命令
- **目标**: 实现 `label-create`, `label-update`, `label-delete` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: 调用 API 完整测试标签 CRUD

---

### Task 3: Snippets API

#### Step 3.1: 添加 Snippets 列表和单个查询命令
- **目标**: 实现 `snippets` 和 `snippet` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: `node gitlab/scripts/gitlab-api.mjs snippets '{"project": "test"}'`

#### Step 3.2: 添加 Snippets CRUD 命令
- **目标**: 实现 `snippet-create`, `snippet-update`, `snippet-delete` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: 调用 API 完整测试 Snippet CRUD

#### Step 3.3: 添加 Snippet Raw 命令
- **目标**: 实现 `snippet-raw` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: 调用 API 获取原始内容

---

### Task 4: Wikis API

#### Step 4.1: 添加 Wikis 列表和单个查询命令
- **目标**: 实现 `wikis` 和 `wiki` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: `node gitlab/scripts/gitlab-api.mjs wikis '{"project": "test"}'`

#### Step 4.2: 添加 Wikis CRUD 命令
- **目标**: 实现 `wiki-create`, `wiki-update`, `wiki-delete` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: 调用 API 完整测试 Wiki CRUD

---

### Task 5: Releases API

#### Step 5.1: 添加 Releases 列表和单个查询命令
- **目标**: 实现 `releases` 和 `release` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: `node gitlab/scripts/gitlab-api.mjs releases '{"project": "test"}'`

#### Step 5.2: 添加 Releases CRUD 命令
- **目标**: 实现 `release-create`, `release-update`, `release-delete` 命令
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: 调用 API 完整测试 Release CRUD

---

### Task 6: 最终验证

#### Step 6.1: 语法检查和命令列表验证
- **目标**: 确认所有命令正确注册，无语法错误
- **改动文件**: `gitlab/scripts/gitlab-api.mjs`
- **验证方式**: 
  - `node --check gitlab/scripts/gitlab-api.mjs`
  - `node gitlab/scripts/gitlab-api.mjs server-config` 检查 commands 列表

#### Step 6.2: 更新 SKILL.md 文档
- **目标**: 在 SKILL.md 中添加新命令说明
- **改动文件**: `gitlab/SKILL.md`
- **验证方式**: 确认文档包含所有新命令

## 执行顺序

Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6