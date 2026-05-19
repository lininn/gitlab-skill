# gitlab-skill

A sanitized Codex skill for working with GitLab through the REST API.

## Repo Layout

- `gitlab/`: the installable Codex skill directory
- `gitlab/SKILL.md`: skill instructions
- `gitlab/scripts/gitlab-api.mjs`: CLI helper for GitLab REST API calls
- `gitlab/.env.example`: example configuration

## Install

Copy `gitlab/` into your Codex skills directory:

```bash
cp -R gitlab ~/.codex/skills/gitlab
```

Then configure:

```bash
GITLAB_API_TOKEN=glpat_xxxxxxxxxxxxxxxxxxxx
GITLAB_API_BASE_URL=https://gitlab.example.com/api/v4
```

For details, see [gitlab/README.md](gitlab/README.md).
