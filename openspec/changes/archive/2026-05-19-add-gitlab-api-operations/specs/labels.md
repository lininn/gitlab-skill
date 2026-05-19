# Spec: Labels API

## Endpoints

| 命令 | GitLab API | 方法 |
|------|-----------|------|
| `labels` | `/projects/:id/labels` | GET |
| `label-create` | `/projects/:id/labels` | POST |
| `label-update` | `/projects/:id/labels/:label_id` | PUT |
| `label-delete` | `/projects/:id/labels/:label_id` | DELETE |

## 参数

### labels
- `project` (required): 项目 ID 或 URL 编码路径
- `with_counts`: 是否包含计数
- `search`: 搜索标签关键词

### label-create
- `project` (required)
- `name` (required): 标签名称
- `color`: 颜色值 (#RRGGBB)
- `description`: 描述
- `priority`: 优先级

### label-update
- `project` (required)
- `label_id` (required): 标签 ID 或名称
- `new_name`: 新名称
- `color`: 新颜色
- `description`: 新描述
- `priority`: 新优先级

### label-delete
- `project` (required)
- `label_id` (required): 标签 ID 或名称

## GitHub 兼容别名

- `repository` → `project`
- `label_name` → `name`
- `label_id` → `label_id`