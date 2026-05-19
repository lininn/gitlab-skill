# GitLab Skill for Codex

This directory contains a sanitized, publishable Codex skill for operating GitLab through the REST API.

It is adapted from a private internal wrapper, but all organization-specific names, domains, and credentials have been removed. The public version is generic and works with either `gitlab.com` or a self-hosted GitLab instance.

## Contents

- `SKILL.md`: the skill instructions shown to Codex
- `agents/openai.yaml`: small UI metadata file
- `scripts/gitlab-api.mjs`: CLI helper for GitLab REST API calls
- `.env.example`: example environment variables

## Install

Copy this directory to:

```bash
~/.codex/skills/gitlab
```

The expected structure is:

```text
gitlab/
  SKILL.md
  README.md
  .env.example
  agents/
    openai.yaml
  scripts/
    gitlab-api.mjs
```

## Configuration

Create a local `.env` next to the skill or export variables in your shell:

```bash
GITLAB_API_TOKEN=glpat_xxxxxxxxxxxxxxxxxxxx
GITLAB_API_BASE_URL=https://gitlab.example.com/api/v4
```

Notes:

- `GITLAB_API_BASE_URL` should point to the REST API root.
- For `gitlab.com`, use `https://gitlab.com/api/v4`.
- The script loads variables in this order:
  1. Existing process environment
  2. `~/.codex/skills/gitlab/.env`
  3. Current working directory `.env`

## Usage

Examples:

```bash
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs me '{}'
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs project '{"project":"group/project"}'
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr '{"project":"group/project","iid":42}'
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-diffs '{"project":"group/project","iid":42,"unidiff":true}'
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs create_merge_request '{"projectId":"group/project","sourceBranch":"feature/x","targetBranch":"main","title":"Feature X"}'
```

## Security

- No real tokens are included here.
- No private `.env` file is included here.
- No internal hostnames or project paths are included here.
- Do not print tokens in logs or skill output.

## Notes

The script intentionally exposes a broad command set so the skill can inspect repositories, merge requests, diffs, notes, discussions, commits, branches, tags, pipelines, and raw files without needing a separate MCP server.

If you want, I can also split this into two public skills:

- `gitlab`: low-level API inspection and review
- `gitlab-commit-mr`: commit, push, and open merge request workflow
