# gitlab-skill

A sanitized, portable skill for working with GitLab through the REST API.

## Repo Layout

- `gitlab/`: the installable generic skill directory
- `gitlab/SKILL.md`: skill instructions
- `gitlab/scripts/gitlab-api.mjs`: CLI helper for GitLab REST API calls
- `gitlab/.env.example`: example configuration

## Install

Copy `gitlab/` into your agent's skills directory and keep the folder name as `gitlab`.

Codex:

```bash
cp -R gitlab ~/.codex/skills/gitlab
```

Claude Code:

```bash
mkdir -p ~/.claude/skills
cp -R gitlab ~/.claude/skills/gitlab
```

Other skill-based agents:

Copy the same `gitlab/` folder into that agent's skills directory and preserve the internal relative paths.

Then configure:

```bash
GITLAB_API_TOKEN=glpat_xxxxxxxxxxxxxxxxxxxx
GITLAB_API_BASE_URL=https://gitlab.example.com/api/v4
```

Example `.env` locations:

- Codex: `~/.codex/skills/gitlab/.env`
- Claude Code: `~/.claude/skills/gitlab/.env`
- Project-local fallback: `<your-project>/.env`

For details, see [gitlab/README.md](gitlab/README.md).
