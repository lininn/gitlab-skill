# gitlab-skill

A sanitized, portable skill for working with GitLab through the REST API.

## Repo Layout

- `gitlab/`: the installable generic skill directory
- `gitlab/SKILL.md`: skill instructions
- `gitlab/scripts/gitlab-api.mjs`: CLI helper for GitLab REST API calls
- `gitlab/.env.example`: example configuration

## Install

Copy `gitlab/` into your agent's skills directory and keep the folder name as `gitlab`.

Example for Codex:

```bash
cp -R gitlab ~/.codex/skills/gitlab
```

For other skill-based agents such as Claude setups, copy the same `gitlab/` folder into that agent's skills directory and preserve the internal relative paths.

Then configure:

```bash
GITLAB_API_TOKEN=glpat_xxxxxxxxxxxxxxxxxxxx
GITLAB_API_BASE_URL=https://gitlab.example.com/api/v4
```

For details, see [gitlab/README.md](gitlab/README.md).
