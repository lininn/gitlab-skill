# Spec: Releases API

## Endpoints

| 命令 | GitLab API | 方法 |
|------|-----------|------|
| `releases` | `/projects/:id/releases` | GET |
| `release` | `/projects/:id/releases/:tag_name` | GET |
| `release-create` | `/projects/:id/releases` | POST |
| `release-update` | `/projects/:id/releases/:tag_name` | PUT |
| `release-delete` | `/projects/:id/releases/:tag_name` | DELETE |

## 参数

### releases
- `project` (required): 项目 ID 或 URL 编码路径
- `per_page`: 每页数量
- `page`: 页码

### release
- `project` (required)
- `tag_name` (required): 标签名称

### release-create
- `project` (required)
- `tag_name` (required): 标签名
- `name`: 发布名称
- `description`: 发布描述 (支持 Markdown)
- `ref`: 如果标签不存在，从 ref 创建
- `milestones`: 关联的里程碑数组
- `released_at`: 发布时间 (ISO 8601)
- `assets:links`: 资源链接数组

### release-update
- `project` (required)
- `tag_name` (required)
- `name`, `description`, `milestones`, `released_at`, `assets:links`

### release-delete
- `project` (required)
- `tag_name` (required)

## GitHub 兼容别名

- `repository` → `project`
- `release_tag` → `tag_name`
- `tag` → `tag_name`
- `release_name` → `name`