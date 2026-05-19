# Spec: Issues API

## Endpoints

| 命令 | GitLab API | 方法 |
|------|-----------|------|
| `issues` | `/projects/:id/issues` | GET |
| `issue` | `/projects/:id/issues/:iid` | GET |
| `issue-create` | `/projects/:id/issues` | POST |
| `issue-update` | `/projects/:id/issues/:iid` | PUT |
| `issue-delete` | `/projects/:id/issues/:iid` | DELETE |
| `issue-notes` | `/projects/:id/issues/:iid/notes` | GET |
| `issue-note-create` | `/projects/:id/issues/:iid/notes` | POST |

## 参数

### issues / issue
- `project` (required): 项目 ID 或 URL 编码路径
- `iid` / `issue_id`: Issue IID (仅 issue 需要)
- `state`: opened / closed / all
- `labels`: 逗号分隔的标签
- `search`: 搜索关键词

### issue-create
- `project` (required)
- `title` (required): Issue 标题
- `description`: Issue 描述
- `labels`: 逗号分隔的标签
- `assignee_ids`: 指派人 ID 数组
- `milestone_id`: 里程碑 ID
- `due_date`: 截止日期 (YYYY-MM-DD)
- `weight`: 权重

### issue-update
- `project` (required)
- `iid` (required)
- `title`, `description`, `labels`, `state_event` (close/reopen), `assignee_ids`, `milestone_id`, `due_date`, `weight`

### issue-delete
- `project` (required)
- `iid` (required)

### issue-notes
- `project` (required)
- `iid` (required)
- `sort`: asc / desc
- `order_by`: created_at / updated_at

### issue-note-create
- `project` (required)
- `iid` (required)
- `body` (required): 评论内容

## GitHub 兼容别名

- `repository` → `project`
- `issue_id` → `iid`
- `pullRequestNumber` → `iid` (用于与 MR API 兼容)