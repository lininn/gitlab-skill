# Spec: Wikis API

## Endpoints

| 命令 | GitLab API | 方法 |
|------|-----------|------|
| `wikis` | `/projects/:id/wikis` | GET |
| `wiki` | `/projects/:id/wikis/:slug` | GET |
| `wiki-create` | `/projects/:id/wikis` | POST |
| `wiki-update` | `/projects/:id/wikis/:slug` | PUT |
| `wiki-delete` | `/projects/:id/wikis/:slug` | DELETE |

## 参数

### wikis
- `project` (required): 项目 ID 或 URL 编码路径
- `with_content`: 是否包含内容

### wiki
- `project` (required)
- `slug` (required): Wiki 页面 slug

### wiki-create
- `project` (required)
- `title` (required): 页面标题
- `content` (required): 页面内容
- `format`: markdown / rdoc / asciidoc / org (默认 markdown)

### wiki-update
- `project` (required)
- `slug` (required)
- `title`, `content`, `format`

### wiki-delete
- `project` (required)
- `slug` (required)

## GitHub 兼容别名

- `repository` → `project`
- `wiki_slug` → `slug`
- `page_title` → `title`