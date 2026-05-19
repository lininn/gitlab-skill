# Spec: Snippets API

## Endpoints

| 命令 | GitLab API | 方法 |
|------|-----------|------|
| `snippets` | `/projects/:id/snippets` | GET |
| `snippet` | `/projects/:id/snippets/:id` | GET |
| `snippet-create` | `/projects/:id/snippets` | POST |
| `snippet-update` | `/projects/:id/snippets/:id` | PUT |
| `snippet-delete` | `/projects/:id/snippets/:id` | DELETE |
| `snippet-raw` | `/projects/:id/snippets/:id/raw` | GET |

## 参数

### snippets
- `project` (required): 项目 ID 或 URL 编码路径
- `per_page`: 每页数量
- `page`: 页码

### snippet
- `project` (required)
- `id` (required): Snippet ID

### snippet-create
- `project` (required)
- `title` (required): 标题
- `description`: 描述
- `visibility`: private / internal / public
- `files` (required): 文件数组 [{ file_path, content }]
- `content` (deprecated): 使用 files 代替

### snippet-update
- `project` (required)
- `id` (required)
- `title`, `description`, `visibility`, `files`

### snippet-delete
- `project` (required)
- `id` (required)

### snippet-raw
- `project` (required)
- `id` (required)

## GitHub 兼容别名

- `repository` → `project`
- `snippet_id` → `id`
- `file_name` → `file_path`