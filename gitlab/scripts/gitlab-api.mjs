#!/usr/bin/env node
import { execFile } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = dirname(SCRIPT_DIR);

loadDotenv(resolve(SKILL_DIR, ".env"));
loadDotenv(resolve(process.cwd(), ".env"));

const API_BASE = process.env.GITLAB_API_BASE_URL || "https://gitlab.example.com/api/v4";
const TOKEN = process.env.GITLAB_API_TOKEN;
const execFileAsync = promisify(execFile);

const [,, command, rawArgs = "{}"] = process.argv;

const commands = {
  "parse-url": parseUrlCommand,
  "me": () => request("GET", "/user"),
  "server-config": serverConfig,
  "get_server_config": serverConfig,
  "project": ({ project }) => request("GET", `/projects/${projectId(project)}`),
  "get_repository_info": ({ repository, project }) => commands.project({ project: project || repository }),
  "get_project_info": getProjectInfo,
  "current-branch": getCurrentBranch,
  "get_current_branch": getCurrentBranch,
  "tree": ({ project, ...query }) => paged("GET", `/projects/${projectId(project)}/repository/tree`, query),
  "branches": ({ project, ...query }) => paged("GET", `/projects/${projectId(project)}/repository/branches`, query),
  "branch": ({ project, branch }) => request("GET", `/projects/${projectId(project)}/repository/branches/${encodeURIComponent(required(branch, "branch"))}`),
  "tags": ({ project, ...query }) => paged("GET", `/projects/${projectId(project)}/repository/tags`, query),
  "tag": ({ project, tag }) => request("GET", `/projects/${projectId(project)}/repository/tags/${encodeURIComponent(required(tag, "tag"))}`),
  "file": ({ project, path, ref }) => request("GET", `/projects/${projectId(project)}/repository/files/${filePath(path)}`, { ref: required(ref, "ref") }),
  "file-raw": ({ project, path, ref }) => request("GET", `/projects/${projectId(project)}/repository/files/${filePath(path)}/raw`, { ref: required(ref, "ref") }, null, "text"),
  "blame": ({ project, path, ref, range }) => request("GET", `/projects/${projectId(project)}/repository/files/${filePath(path)}/blame`, { ref: required(ref, "ref"), ...rangeParams(range) }),
  "compare": ({ project, from, to, ...query }) => request("GET", `/projects/${projectId(project)}/repository/compare`, { from: required(from, "from"), to: required(to, "to"), ...query }),

  "mr": ({ project, iid, ...query }) => request("GET", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}`, query),
  "fetch_pull_request": ({ repository, pullRequestNumber, project, iid, mergeRequestIid, ...query }) => commands.mr({ project: project || repository, iid: iid || mergeRequestIid || pullRequestNumber, ...query }),
  "get_merge_request": ({ projectId, project, repository, mergeRequestIid, iid, pullRequestNumber, ...query }) => commands.mr({ project: project || projectId || repository, iid: iid || mergeRequestIid || pullRequestNumber, ...query }),
  "mrs": ({ project, ...query }) => paged("GET", project ? `/projects/${projectId(project)}/merge_requests` : "/merge_requests", query),
  "create-mr": createMergeRequest,
  "create_merge_request": createMergeRequest,
  "mr-commits": ({ project, iid }) => paged("GET", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/commits`),
  "mr-changes": ({ project, iid, ...query }) => request("GET", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/changes`, query),
  "get_merge_request_changes": ({ repository, project, pullRequestNumber, mergeRequestIid, iid, ...query }) => commands["mr-changes"]({ project: project || repository, iid: iid || mergeRequestIid || pullRequestNumber, ...query }),
  "get_pull_request_files": getPullRequestFiles,
  "mr-diffs": mrDiffs,
  "fetch_code_diff": fetchCodeDiff,
  "mr-versions": ({ project, iid }) => paged("GET", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/versions`),
  "mr-version": ({ project, iid, version }) => request("GET", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/versions/${required(version, "version")}`),
  "mr-version-for-commit": versionForCommit,
  "mr-notes": ({ project, iid, ...query }) => paged("GET", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/notes`, query),
  "mr-note-create": ({ project, iid, body }) => request("POST", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/notes`, null, { body: required(body, "body") }),
  "mr-note-update": ({ project, iid, note, body }) => request("PUT", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/notes/${required(note, "note")}`, null, { body: required(body, "body") }),
  "mr-note-delete": ({ project, iid, note }) => request("DELETE", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/notes/${required(note, "note")}`),
  "add_review_comment": addReviewComment,
  "mr-discussions": ({ project, iid }) => paged("GET", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/discussions`),
  "mr-discussion": ({ project, iid, discussion }) => request("GET", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/discussions/${required(discussion, "discussion")}`),
  "mr-discussion-create": ({ project, iid, body, position }) => request("POST", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/discussions`, null, { body: required(body, "body"), ...positionBody(position) }),
  "mr-discussion-reply": ({ project, iid, discussion, body }) => request("POST", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/discussions/${required(discussion, "discussion")}/notes`, null, { body: required(body, "body") }),
  "mr-discussion-note-update": ({ project, iid, discussion, note, body }) => request("PUT", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/discussions/${required(discussion, "discussion")}/notes/${required(note, "note")}`, null, { body: required(body, "body") }),
  "mr-discussion-note-delete": ({ project, iid, discussion, note }) => request("DELETE", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/discussions/${required(discussion, "discussion")}/notes/${required(note, "note")}`),
  "mr-discussion-resolve": ({ project, iid, discussion, note, resolved }) => request("PUT", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/discussions/${required(discussion, "discussion")}/notes/${required(note, "note")}`, null, { resolved: Boolean(resolved) }),

  "commit": ({ project, sha, ...query }) => request("GET", `/projects/${projectId(project)}/repository/commits/${encodeURIComponent(required(sha, "sha"))}`, query),
  "commits": ({ project, ...query }) => paged("GET", `/projects/${projectId(project)}/repository/commits`, query),
  "commit-diff": ({ project, sha, ...query }) => paged("GET", `/projects/${projectId(project)}/repository/commits/${encodeURIComponent(required(sha, "sha"))}/diff`, query),
  "commit-comments": ({ project, sha }) => paged("GET", `/projects/${projectId(project)}/repository/commits/${encodeURIComponent(required(sha, "sha"))}/comments`),
  "commit-comment-create": ({ project, sha, note, path, line, line_type }) => request("POST", `/projects/${projectId(project)}/repository/commits/${encodeURIComponent(required(sha, "sha"))}/comments`, null, compact({ note: required(note, "note"), path, line, line_type })),
  "commit-statuses": ({ project, sha, ...query }) => paged("GET", `/projects/${projectId(project)}/repository/commits/${encodeURIComponent(required(sha, "sha"))}/statuses`, query),

  "pipelines": ({ project, ...query }) => paged("GET", `/projects/${projectId(project)}/pipelines`, query),
  "pipeline": ({ project, pipeline }) => request("GET", `/projects/${projectId(project)}/pipelines/${required(pipeline, "pipeline")}`),
  "pipeline-jobs": ({ project, pipeline, ...query }) => paged("GET", `/projects/${projectId(project)}/pipelines/${required(pipeline, "pipeline")}/jobs`, query),
  "jobs": ({ project, ...query }) => paged("GET", `/projects/${projectId(project)}/jobs`, query),
  "job": ({ project, job }) => request("GET", `/projects/${projectId(project)}/jobs/${required(job, "job")}`),
  "job-trace": ({ project, job }) => request("GET", `/projects/${projectId(project)}/jobs/${required(job, "job")}/trace`, null, null, "text"),

  "analyze_code_quality": ({ code, language, rules = [] }) => analyzeCode(code, language, rules),
  "analyze_files_batch": analyzeFilesBatch,
  "get_supported_languages": () => ({ supportedLanguages: supportedLanguages(), total: supportedLanguages().length }),
  "get_language_rules": ({ language }) => ({ language, rules: getRules(required(language, "language")).map(publicRule), total: getRules(language).length }),
  "request": ({ method = "GET", path, query, body, response = "json" }) => request(method, required(path, "path"), query, body, response),
};

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});

async function main() {
  if (!command || !commands[command]) {
    console.error(`Usage: gitlab-api.mjs <command> '<json-args>'`);
    console.error(`Commands: ${Object.keys(commands).sort().join(", ")}`);
    process.exit(2);
  }

  const args = JSON.parse(rawArgs);
  const tokenlessCommands = new Set([
    "parse-url",
    "server-config",
    "get_server_config",
    "current-branch",
    "get_current_branch",
    "analyze_code_quality",
    "analyze_files_batch",
    "get_supported_languages",
    "get_language_rules",
  ]);
  if (!tokenlessCommands.has(command) && !TOKEN) {
    throw new Error("GITLAB_API_TOKEN is required.");
  }
  const result = await commands[command](args);
  if (typeof result === "string") {
    process.stdout.write(result);
    if (!result.endsWith("\n")) process.stdout.write("\n");
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

async function versionForCommit({ project, iid, commit }) {
  const versions = await commands["mr-versions"]({ project, iid });
  const target = required(commit, "commit");
  const found = versions.find((version) => {
    const shas = [
      version.head_commit_sha,
      version.base_commit_sha,
      version.start_commit_sha,
      version.real_size,
    ].filter(Boolean).map(String);
    return shas.some((sha) => sha === target || sha.startsWith(target) || target.startsWith(sha));
  });
  if (!found) {
    return { found: false, commit: target, versions };
  }
  return {
    found: true,
    version: found,
    details: await commands["mr-version"]({ project, iid, version: found.id }),
  };
}

async function mrDiffs({ project, iid, ...query }) {
  try {
    return await paged("GET", `/projects/${projectId(project)}/merge_requests/${required(iid, "iid")}/diffs`, query);
  } catch (error) {
    if (!String(error.message || error).includes("404")) {
      throw error;
    }
    const changes = await commands["mr-changes"]({ project, iid, ...query });
    return changes?.changes || changes;
  }
}

async function fetchCodeDiff({ repository, project, pullRequestNumber, mergeRequestIid, iid, commitSha, sha, filePath, path, ...query }) {
  const resolvedProject = project || repository;
  const resolvedIid = iid || mergeRequestIid || pullRequestNumber;
  const resolvedSha = sha || commitSha;
  const wantedPath = filePath || path;
  let data;
  if (resolvedIid) {
    data = await commands["mr-changes"]({ project: resolvedProject, iid: resolvedIid, ...query });
    const changes = Array.isArray(data) ? data : data?.changes;
    if (wantedPath && Array.isArray(changes)) {
      data = { ...data, changes: changes.filter((file) => file.new_path === wantedPath || file.old_path === wantedPath || file.filename === wantedPath) };
    }
  } else if (resolvedSha) {
    data = await commands["commit-diff"]({ project: resolvedProject, sha: resolvedSha, ...query });
    if (wantedPath && Array.isArray(data)) {
      data = data.filter((file) => file.new_path === wantedPath || file.old_path === wantedPath);
    }
  } else {
    throw new Error("pullRequestNumber/mergeRequestIid/iid or commitSha/sha is required");
  }
  return data;
}

async function getPullRequestFiles(args) {
  const data = await commands["get_merge_request_changes"](args);
  const changes = Array.isArray(data) ? data : data?.changes || [];
  return {
    pullRequestNumber: args.pullRequestNumber || args.mergeRequestIid || args.iid,
    repository: args.repository || args.project,
    provider: "gitlab",
    totalFiles: changes.length,
    files: changes.map((file) => ({
      filename: file.new_path || file.old_path,
      status: file.new_file ? "added" : file.deleted_file ? "deleted" : file.renamed_file ? "renamed" : "modified",
      oldPath: file.old_path,
      newPath: file.new_path,
      newFile: file.new_file,
      renamedFile: file.renamed_file,
      deletedFile: file.deleted_file,
      diff: file.diff,
    })),
  };
}

async function addReviewComment({ repository, project, pullRequestNumber, mergeRequestIid, iid, body, filePath, line, position }) {
  const resolvedProject = project || repository;
  const resolvedIid = iid || mergeRequestIid || pullRequestNumber;
  if (position) {
    return commands["mr-discussion-create"]({ project: resolvedProject, iid: resolvedIid, body, position });
  }
  if (filePath && line !== undefined) {
    const mr = await commands.mr({ project: resolvedProject, iid: resolvedIid });
    return commands["mr-discussion-create"]({
      project: resolvedProject,
      iid: resolvedIid,
      body,
      position: {
        base_sha: mr.diff_refs?.base_sha,
        start_sha: mr.diff_refs?.start_sha,
        head_sha: mr.diff_refs?.head_sha,
        position_type: "text",
        old_path: filePath,
        new_path: filePath,
        new_line: line,
      },
    });
  }
  return commands["mr-note-create"]({ project: resolvedProject, iid: resolvedIid, body });
}

async function createMergeRequest(args) {
  const project = args.project || args.projectId || args.repository;
  const sourceBranch = args.sourceBranch || args.source_branch || args.source;
  const targetBranch = args.targetBranch || args.target_branch || args.destinationBranch || args.destination_branch || "main";
  const title = args.title || args.mr_title || args.mergeRequestTitle || titleFromBranch(required(sourceBranch, "sourceBranch"));
  return request("POST", `/projects/${projectId(project)}/merge_requests`, null, compact({
    source_branch: sourceBranch,
    target_branch: targetBranch,
    title,
    description: args.description || args.body || args.mergeRequestDescription,
    assignee_id: args.assigneeId || args.assignee_id,
    reviewer_ids: args.reviewerIds || args.reviewer_ids,
    remove_source_branch: args.deleteSourceBranch || args.delete_source_branch || args.removeSourceBranch || args.remove_source_branch,
    squash: args.squash || args.shouldSquash || args.squash_commits,
  }));
}

async function getCurrentBranch({ workingDirectory = process.cwd() } = {}) {
  const branch = (await git(["branch", "--show-current"], workingDirectory)).trim();
  const remote = (await git(["remote", "get-url", "origin"], workingDirectory).catch(() => "")).trim();
  return { workingDirectory, branch, remote, project: remote ? projectFromRemote(remote) : undefined };
}

async function getProjectInfo({ workingDirectory = process.cwd(), remoteName = "origin" } = {}) {
  const remote = (await git(["remote", "get-url", remoteName], workingDirectory)).trim();
  const project = projectFromRemote(remote);
  const info = project ? await commands.project({ project }) : null;
  return { workingDirectory, remoteName, remote, project, info };
}

async function git(args, cwd) {
  const { stdout } = await execFileAsync("git", args, { cwd });
  return stdout;
}

function projectFromRemote(remote) {
  const normalized = String(remote || "").trim();
  const sshMatch = normalized.match(/^[^@]+@[^:]+:(.+?)(?:\.git)?$/);
  if (sshMatch) return sshMatch[1].replace(/\.git$/, "");

  const httpsMatch = normalized.match(/^(?:https?|ssh):\/\/[^/]+\/(.+?)(?:\.git)?$/);
  if (httpsMatch) return httpsMatch[1].replace(/\.git$/, "");

  return undefined;
}

function serverConfig() {
  return {
    apiBaseUrl: API_BASE,
    provider: "gitlab",
    authConfigured: Boolean(TOKEN),
    supportedLanguages: supportedLanguages(),
    commands: Object.keys(commands).sort(),
  };
}

async function request(method, path, query, body, responseType = "json") {
  const base = API_BASE.replace(/\/+$/, "");
  const normalizedPath = String(path).replace(/^\/+/, "");
  const url = new URL(`${base}/${normalizedPath}`);
  for (const [key, value] of Object.entries(compact(query || {}))) {
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    method,
    headers: compact({
      "PRIVATE-TOKEN": TOKEN,
      "Content-Type": body ? "application/json" : undefined,
      "Accept": responseType === "text" ? "text/plain, */*" : "application/json",
    }),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${url.pathname}${url.search} -> ${response.status} ${response.statusText}\n${text}`);
  }
  if (responseType === "text") return text;
  if (!text) return null;
  return JSON.parse(text);
}

async function paged(method, path, query = {}) {
  const perPage = query.per_page || 100;
  let page = query.page || 1;
  const all = [];
  while (true) {
    const batch = await request(method, path, { ...query, per_page: perPage, page });
    if (!Array.isArray(batch)) return batch;
    all.push(...batch);
    if (batch.length < perPage || query.page) return all;
    page += 1;
  }
}

function parseUrlCommand({ url }) {
  const parsed = parseGitlabUrl(required(url, "url"));
  return parsed;
}

function parseGitlabUrl(input) {
  const url = new URL(input);
  const marker = "/-/";
  const pathname = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  const markerIndex = pathname.indexOf(marker);
  const project = markerIndex >= 0 ? pathname.slice(0, markerIndex) : pathname;
  const rest = markerIndex >= 0 ? pathname.slice(markerIndex + marker.length) : "";
  const mrMatch = rest.match(/^merge_requests\/(\d+)/);
  const commitMatch = rest.match(/^commit\/([^/]+)/);
  return compact({
    host: url.hostname,
    project,
    mergeRequestIid: mrMatch ? Number(mrMatch[1]) : undefined,
    commit: commitMatch ? commitMatch[1] : url.searchParams.get("commit_id") || undefined,
    path: pathname,
    anchor: url.hash ? url.hash.slice(1) : undefined,
    search: Object.fromEntries(url.searchParams.entries()),
  });
}

function projectId(project) {
  const value = required(project, "project");
  return /^\d+$/.test(String(value)) ? String(value) : encodeURIComponent(String(value));
}

function filePath(path) {
  return encodeURIComponent(required(path, "path"));
}

function required(value, name) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${name} is required`);
  }
  return value;
}

function compact(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== null));
}

function rangeParams(range) {
  if (!range) return {};
  return compact({
    "range[start]": range.start,
    "range[end]": range.end,
  });
}

function positionBody(position) {
  return position ? { position } : {};
}

function titleFromBranch(branch) {
  return String(branch)
    .split("/")
    .pop()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function supportedLanguages() {
  return Object.keys(ruleSets());
}

function ruleSets() {
  const common = [
    rule("todo-comment", /\b(TODO|FIXME|HACK|XXX)\b/gi, "TODO/FIXME comment found", "info", "maintenance"),
    rule("long-line", /.{121,}/g, "Line exceeds 120 characters", "warning", "style"),
    rule("trailing-whitespace", /\s+$/gm, "Trailing whitespace found", "info", "style"),
  ];
  const js = [
    rule("no-console-log", /console\.log\(/g, "Console.log statement found", "warning", "debug"),
    rule("no-var", /\bvar\s+/g, "Use let or const instead of var", "warning", "best-practice"),
    rule("no-eval", /\beval\(/g, "eval() is dangerous and should be avoided", "error", "security"),
    rule("arrow-function-spacing", /=>\s*{/g, "Consider using consistent arrow function spacing", "info", "style"),
    ...common,
  ];
  return {
    javascript: js,
    typescript: [
      ...js,
      rule("no-any", /:\s*any\b/g, "Avoid using any type, use specific types", "warning", "type-safety"),
      rule("explicit-return-type", /function\s+\w+\([^)]*\)\s*{/g, "Consider adding explicit return type", "info", "type-safety"),
    ],
    python: [
      rule("no-print", /\bprint\(/g, "Consider using logging instead of print", "warning", "debug"),
      rule("pep8-line-length", /.{89,}/g, "Line exceeds PEP 8 recommendation (88 characters)", "warning", "style"),
      rule("unused-import", /^import\s+\w+.*$/gm, "Potential unused import (manual check required)", "info", "cleanup"),
      ...common,
    ],
    java: [
      rule("system-out-println", /System\.out\.println\(/g, "Use proper logging instead of System.out.println", "warning", "debug"),
      rule("public-class-naming", /public\s+class\s+[a-z]/g, "Class names should start with uppercase letter", "error", "naming"),
      ...common,
    ],
    go: [
      rule("no-fmt-println", /fmt\.Println\(/g, "Consider using proper logging instead of fmt.Println", "warning", "debug"),
      rule("error-handling", /if\s+err\s*!=\s*nil\s*{/g, "Good error handling practice", "info", "best-practice"),
      ...common,
    ],
  };
}

function rule(name, pattern, message, severity, type) {
  return { name, pattern, message, severity, type };
}

function getRules(language) {
  return ruleSets()[String(language).toLowerCase()] || ruleSets().javascript;
}

function publicRule({ name, message, severity, type }) {
  return { name, message, severity, type };
}

function analyzeFilesBatch({ files, rules = [] }) {
  const results = required(files, "files").map((file) => ({
    filePath: file.path,
    language: file.language,
    analysis: analyzeCode(file.content, file.language, rules),
  }));
  const totalIssues = results.reduce((sum, result) => sum + result.analysis.issues.length, 0);
  const totalLines = results.reduce((sum, result) => sum + result.analysis.lineCount, 0);
  const averageComplexity = results.length
    ? Math.round((results.reduce((sum, result) => sum + result.analysis.metrics.cyclomaticComplexity, 0) / results.length) * 100) / 100
    : 0;
  return {
    totalFiles: results.length,
    totalLines,
    totalIssues,
    averageComplexity,
    issuesByType: {
      error: results.reduce((sum, result) => sum + result.analysis.metrics.issueCount.error, 0),
      warning: results.reduce((sum, result) => sum + result.analysis.metrics.issueCount.warning, 0),
      info: results.reduce((sum, result) => sum + result.analysis.metrics.issueCount.info, 0),
    },
    results,
  };
}

function analyzeCode(code, language, customRules = []) {
  const normalizedLanguage = String(required(language, "language")).toLowerCase();
  const lines = String(required(code, "code")).split("\n");
  const issues = [];
  for (const ruleItem of getRules(normalizedLanguage)) {
    if (customRules.length > 0 && !customRules.includes(ruleItem.name)) continue;
    lines.forEach((line, index) => {
      const pattern = new RegExp(ruleItem.pattern.source, ruleItem.pattern.flags);
      if (pattern.test(line)) {
        issues.push({
          line: index + 1,
          column: Math.max(1, line.search(new RegExp(ruleItem.pattern.source, ruleItem.pattern.flags.replace("g", ""))) + 1),
          type: ruleItem.type,
          message: ruleItem.message,
          severity: ruleItem.severity,
          rule: ruleItem.name,
        });
      }
    });
  }
  const suggestions = [];
  if (lines.length > 100) suggestions.push("Consider breaking this file into smaller modules");
  if (issues.filter((issue) => issue.severity === "error").length > 5) suggestions.push("Multiple errors found - consider reviewing code structure");
  if (issues.filter((issue) => issue.severity === "warning").length > 10) suggestions.push("High number of warnings - consider code refactoring");
  if ((normalizedLanguage === "javascript" || normalizedLanguage === "typescript") && issues.some((issue) => issue.rule === "no-console-log")) {
    suggestions.push("Replace console.log with proper logging framework");
  }
  const cyclomaticComplexity = complexity(String(code), normalizedLanguage);
  const maintainabilityIndex = maintainability(String(code), issues.length);
  return {
    language: normalizedLanguage,
    codeLength: String(code).length,
    lineCount: lines.length,
    issues,
    suggestions,
    metrics: {
      cyclomaticComplexity,
      maintainabilityIndex,
      issueCount: {
        error: issues.filter((issue) => issue.severity === "error").length,
        warning: issues.filter((issue) => issue.severity === "warning").length,
        info: issues.filter((issue) => issue.severity === "info").length,
      },
    },
  };
}

function complexity(code, language) {
  const patterns = {
    javascript: /\b(if|else|while|for|switch|case|catch|&&|\|\||\?)\b/g,
    typescript: /\b(if|else|while|for|switch|case|catch|&&|\|\||\?)\b/g,
    python: /\b(if|elif|else|while|for|try|except|and|or)\b/g,
    java: /\b(if|else|while|for|switch|case|catch|&&|\|\||\?)\b/g,
    go: /\b(if|else|for|switch|case|&&|\|\|)\b/g,
  };
  return ((code.match(patterns[language] || patterns.javascript) || []).length) + 1;
}

function maintainability(code, issueCount) {
  const lines = code.split("\n").length;
  const comments = (code.match(/\/\/|\/\*|\*\/|#/g) || []).length;
  let score = 100;
  score -= Math.min(lines / 10, 30);
  score -= Math.min(issueCount * 2, 40);
  score += Math.min((comments / lines) * 20, 20);
  return Math.max(0, Math.round(score));
}

function loadDotenv(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = parseEnvValue(rawValue);
  }
}

function parseEnvValue(rawValue) {
  const value = rawValue.trim();
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value.replace(/\s+#.*$/, "");
}
