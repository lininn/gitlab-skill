name: gitlab
description: Access GitLab with a direct GitLab REST API client. Use this skill for GitLab projects, merge requests, diffs, commits, branches, files, discussions, notes, review comments, pipelines, and self-hosted or gitlab.com API access.
---

# GitLab

Use this skill when the task is about a GitLab repository, merge request, commit, diff, note, discussion, file, branch, or pipeline. It talks directly to the GitLab REST API.

Do not use unauthenticated scraping for GitLab. Do not print tokens. The API token is loaded from `GITLAB_API_TOKEN`, `~/.codex/skills/gitlab/.env`, or the current working directory `.env` in that order.

## Command Shape

Run the bundled API client:

```bash
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs <command> '<json-args>'
```

Prefer JSON args so paths, comments, and Chinese text do not break shell parsing.

The shared `.env` keys are:

```bash
GITLAB_API_TOKEN=glpat_xxxxxxxxxxxxxxxxxxxx
GITLAB_API_BASE_URL=https://gitlab.example.com/api/v4
```

Useful commands:

```bash
# Parse a GitLab URL into project path, MR IID, commit id, and anchor.
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs parse-url '{"url":"https://gitlab.example.com/group/project/-/merge_requests/1117/diffs?commit_id=...#..."}'

# Current authenticated user.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs me '{}'

# Project and repository.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs project '{"project":"group/project"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs get_repository_info '{"repository":"group/project"}'
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs get_current_branch '{"workingDirectory":"/path/to/repo"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs get_project_info '{"workingDirectory":"/path/to/repo"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs tree '{"project":"group/project","ref":"main","recursive":false}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs file '{"project":"group/project","path":"src/index.ts","ref":"main"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs file-raw '{"project":"group/project","path":"src/index.ts","ref":"main"}'

# Merge requests and diffs.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr '{"project":"group/project","iid":1117}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs get_merge_request '{"projectId":"group/project","mergeRequestIid":1117}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs fetch_pull_request '{"repository":"group/project","pullRequestNumber":1117}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-changes '{"project":"group/project","iid":1117,"unidiff":true}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs get_merge_request_changes '{"repository":"group/project","mergeRequestIid":1117}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs get_pull_request_files '{"repository":"group/project","mergeRequestIid":1117}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-diffs '{"project":"group/project","iid":1117,"unidiff":true}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs fetch_code_diff '{"repository":"group/project","pullRequestNumber":1117,"filePath":"src/a.ts"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-versions '{"project":"group/project","iid":1117}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-version-for-commit '{"project":"group/project","iid":1117,"commit":"c79a160ced7ffbffcf1466edbf7691f84afc3ec9"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs create_merge_request '{"projectId":"group/project","sourceBranch":"feature/x","targetBranch":"main","title":"Feature X"}'

# MR notes and discussions.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-notes '{"project":"group/project","iid":1117}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-note-create '{"project":"group/project","iid":1117,"body":"review note"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-note-update '{"project":"group/project","iid":1117,"note":123,"body":"updated note"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-note-delete '{"project":"group/project","iid":1117,"note":123}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs add_review_comment '{"repository":"group/project","pullRequestNumber":1117,"body":"review note"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-discussions '{"project":"group/project","iid":1117}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-discussion-create '{"project":"group/project","iid":1117,"body":"line note","position":{"base_sha":"...","start_sha":"...","head_sha":"...","position_type":"text","new_path":"src/a.ts","old_path":"src/a.ts","new_line":12}}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-discussion-reply '{"project":"group/project","iid":1117,"discussion":"...","body":"reply"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-discussion-note-update '{"project":"group/project","iid":1117,"discussion":"...","note":123,"body":"updated reply"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-discussion-note-delete '{"project":"group/project","iid":1117,"discussion":"...","note":123}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs mr-discussion-resolve '{"project":"group/project","iid":1117,"discussion":"...","note":123,"resolved":true}'

# Commits and comments.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs commit '{"project":"group/project","sha":"c79a160ced7ffbffcf1466edbf7691f84afc3ec9"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs commit-diff '{"project":"group/project","sha":"c79a160ced7ffbffcf1466edbf7691f84afc3ec9","unidiff":true}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs commit-comments '{"project":"group/project","sha":"..."}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs commit-comment-create '{"project":"group/project","sha":"...","note":"comment","path":"src/a.ts","line":12,"line_type":"new"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs commit-statuses '{"project":"group/project","sha":"..."}'

# CI, branches, tags, and jobs.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs branches '{"project":"group/project"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs tags '{"project":"group/project"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs pipelines '{"project":"group/project","ref":"main"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs pipeline-jobs '{"project":"group/project","pipeline":182770}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs job-trace '{"project":"group/project","job":123456}'

# Issues.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs issues '{"project":"group/project","state":"opened"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs issue '{"project":"group/project","iid":42}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs issue-create '{"project":"group/project","title":"Bug report","description":"Description","labels":"bug,urgent"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs issue-update '{"project":"group/project","iid":42,"state_event":"close"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs issue-delete '{"project":"group/project","iid":42}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs issue-notes '{"project":"group/project","iid":42}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs issue-note-create '{"project":"group/project","iid":42,"body":"Comment text"}'

# Labels.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs labels '{"project":"group/project"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs label-create '{"project":"group/project","name":"bug","color":"#FF0000","description":"Bug reports"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs label-update '{"project":"group/project","label_id":"bug","new_name":"defect","color":"#FF5555"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs label-delete '{"project":"group/project","label_id":"bug"}'

# Snippets.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs snippets '{"project":"group/project"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs snippet '{"project":"group/project","id":1}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs snippet-create '{"project":"group/project","title":"Example","files":[{"file_path":"example.js","content":"console.log(1)"}]}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs snippet-update '{"project":"group/project","id":1,"title":"Updated title"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs snippet-delete '{"project":"group/project","id":1}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs snippet-raw '{"project":"group/project","id":1}'

# Wikis.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs wikis '{"project":"group/project"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs wiki '{"project":"group/project","slug":"home"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs wiki-create '{"project":"group/project","title":"Home","content":"Welcome to the wiki"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs wiki-update '{"project":"group/project","slug":"home","content":"Updated content"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs wiki-delete '{"project":"group/project","slug":"home"}'

# Releases.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs releases '{"project":"group/project"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs release '{"project":"group/project","tag_name":"v1.0.0"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs release-create '{"project":"group/project","tag_name":"v1.0.0","name":"Version 1.0.0","description":"Release notes"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs release-update '{"project":"group/project","tag_name":"v1.0.0","description":"Updated notes"}'
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs release-delete '{"project":"group/project","tag_name":"v1.0.0"}'

# Lightweight code analysis helpers.
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs get_server_config '{}'
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs get_supported_languages '{}'
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs get_language_rules '{"language":"typescript"}'
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs analyze_code_quality '{"language":"typescript","code":"const x: any = 1\\nconsole.log(x)"}'
node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs analyze_files_batch '{"files":[{"path":"src/a.ts","language":"typescript","content":"const x: any = 1"}]}'

# Generic escape hatch for GitLab API endpoints.
GITLAB_API_TOKEN=... node ~/.codex/skills/gitlab/scripts/gitlab-api.mjs request '{"method":"GET","path":"/projects/group%2Fproject/merge_requests/1117"}'
```

## Review Workflow

For MR review URLs:

1. Run `parse-url`.
2. Run `mr` to get source/target branches and SHAs.
3. Run `mr-diffs` first. If the server is older and rejects it, run `mr-changes`.
4. If the URL has `commit_id`, run `mr-version-for-commit` and `commit-diff` for commit-specific context.
5. Use `mr-discussions` and `mr-notes` before adding comments so you do not duplicate existing feedback.

## API References

This skill is based on official GitLab REST API docs for Merge Requests, Discussions, Commits, Repositories, and Repository Files.
