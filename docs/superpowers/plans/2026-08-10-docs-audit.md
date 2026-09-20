# Docs Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a ranked audit report of https://getplumber.io/docs/ (developer POV + product consistency) at `docs/superpowers/audits/2026-08-10-docs-audit.md`, including a proposed CLI-first target IA.

**Architecture:** Three evidence-gathering passes (persona journeys on the live site with real CLI execution, source-diff consistency checks against the local product repos, page-by-page completeness sweep) write standardized findings into per-task notes files; a final task merges them into one ranked report. Spec: `docs/superpowers/specs/2026-08-10-docs-audit-design.md`.

**Tech Stack:** Chrome browser tools (claude-in-chrome MCP), the released `plumber` CLI binary, `gh` CLI, grep/diff over local repos, `npx linkinator` for link checking.

## Global Constraints

- This is an **audit**: do not modify any docs page, config, or product code. The ONLY file created in the repo is the final report `docs/superpowers/audits/2026-08-10-docs-audit.md`; all working notes live outside the repo (see below).
- Commits: conventional commits, **never** add `Co-Authored-By: Claude` or any AI attribution (repo CLAUDE.md rule). Do not touch `package-lock.json`.
- Working notes directory (NOT in the repo, do not commit): `/private/tmp/claude-501/-Users-thomasboni-workspace-github-com-getplumber-getplumber-io/7866e624-e0c4-4f8e-afb2-87ec237e48ca/scratchpad/audit-notes/`: referred to as `$NOTES` below. Create it with `mkdir -p` at the start of every task (idempotent).
- Local repo paths (all under `/Users/thomasboni/workspace/github.com/getplumber/`):
  - Docs site: `getplumber.io` (docs content in `src/docs/data/docs/en/`, sidebar in `src/docs/config/en/sidebarNavData.json.ts`, redirects in `vercel.json`, controls data in `src/data/issues.ts`)
  - CLI: `plumber` (source of truth for commands, controls, `action.yml`)
  - Platform: `platform` and `monorepo`
  - Scan targets for real execution: `plumber-lab-github`, `plumber-lab-gitlab`
- Every finding, in every notes file, uses this exact format (one bullet per finding):
  `- [SEVERITY] <live URL>: <what is wrong> | Evidence: <command output / file:line> | Fix: <proposed fix>`
  where SEVERITY is one of `BROKEN` (copy-paste fails, wrong info, dead link), `MISLEADING` (works but docs say otherwise), `FRICTION` (works but requires thinking/guessing), `COSMETIC`.
- Browser tasks: load Chrome MCP tools in ONE ToolSearch call (`select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__find`), call `tabs_context_mcp` first, create a NEW tab, and close it when the task ends. Journey tasks must run sequentially (one browser user at a time).
- If a step is blocked by missing credentials (e.g. no `GITLAB_TOKEN`), do NOT fake results: record the block itself as a finding-pass limitation in the notes file under a `## Blocked` heading and move on.

---

### Task 1: Baseline facts - latest release + real CLI help output

**Files:**
- Create: `$NOTES/00-baseline.md`, `$NOTES/help/*.txt`
- No repo files touched.

**Interfaces:**
- Produces: `$NOTES/00-baseline.md` containing `LATEST_RELEASE=<tag>` on its first line; `$NOTES/help/` directory with real `--help` output; `$NOTES/bin/plumber` (the released binary). Tasks 2, 3, 5, 6 consume these.

- [ ] **Step 1: Record the latest release tag**

```bash
mkdir -p "$NOTES" "$NOTES/help" "$NOTES/bin"
gh release view --repo getplumber/plumber --json tagName,publishedAt \
  --jq '"LATEST_RELEASE=" + .tagName + "  (published " + .publishedAt + ")"' \
  | tee "$NOTES/00-baseline.md"
```

Expected: a line like `LATEST_RELEASE=v0.4.x (published ...)`.

- [ ] **Step 2: Download and verify the released binary exactly as the docs tell a macOS user to**

Use the macOS Apple Silicon commands from https://getplumber.io/docs/cli/installation (Binary tab), adapted only to install into `$NOTES/bin` instead of `/usr/local/bin`:

```bash
cd "$NOTES/bin"
curl -LO https://github.com/getplumber/plumber/releases/latest/download/plumber-darwin-arm64
chmod +x plumber-darwin-arm64
mv plumber-darwin-arm64 plumber
./plumber --version
```

Expected: version output matching `LATEST_RELEASE`. If the download 404s or the version mismatches, record a `BROKEN` finding in `$NOTES/00-baseline.md`.

- [ ] **Step 3: Capture real help output for every command**

```bash
P="$NOTES/bin/plumber"
"$P" --help                > "$NOTES/help/root.txt"        2>&1
"$P" analyze --help        > "$NOTES/help/analyze.txt"     2>&1
for sub in $(awk '/Available Commands:/,/^$/' "$NOTES/help/root.txt" | awk 'NR>1 && NF {print $1}'); do
  "$P" "$sub" --help > "$NOTES/help/$sub.txt" 2>&1 || true
done
ls "$NOTES/help/"
```

Expected: one `.txt` per command (at minimum `root.txt`, `analyze.txt`, plus config-related commands).

- [ ] **Step 4: Record findings**

Append to `$NOTES/00-baseline.md` any finding from steps 2-3 in the standard format (or `_No findings._`).

---

### Task 2: Journey 1 - GitHub developer (live site + real execution)

**Files:**
- Create: `$NOTES/01-journey-github.md`
- No repo files touched.

**Interfaces:**
- Consumes: `$NOTES/bin/plumber`, `$NOTES/help/*.txt` (Task 1).
- Produces: `$NOTES/01-journey-github.md`: findings + a `## Path log` section listing each page visited and each decision point, and a `## Timing` line estimating minutes-to-first-score. Task 8 consumes it.

- [ ] **Step 1: Start the journey on the docs landing page**

Load Chrome tools (see Global Constraints), create a new tab, navigate to `https://getplumber.io/docs/`. Persona: *"I'm a GitHub developer. I want to scan my repo's Actions workflows. I will only do what the page explicitly tells me; any moment I have to choose or guess gets logged."* Log in `## Path log`: what the landing page shows, which link a GitHub dev would click, how many clicks/decisions until an install command is on screen.

- [ ] **Step 2: Follow the site's own path to installation and install for real**

Follow links the site offers (expected route: landing → CLI → GitHub page or Installation page; log the actual route). Copy the install command the page shows for macOS and run it verbatim in the terminal (Homebrew tab: `brew tap getplumber/plumber && brew install plumber`: run it for real; if Homebrew install succeeds use that binary for step 3, otherwise fall back to `$NOTES/bin/plumber` and record a `BROKEN` finding).

- [ ] **Step 3: Run the first scan exactly as documented**

From the GitHub docs page (`https://getplumber.io/docs/cli/github`), copy the first local-scan command shown and run it against the local clone `/Users/thomasboni/workspace/github.com/getplumber/plumber-lab-github` (cd there first). Log verbatim: the command, whether it needed edits before it would run (each edit = `FRICTION`), whether a token was required and whether the page said so beforehand, the resulting score/output. If it fails: `BROKEN`, with full output as evidence.

- [ ] **Step 4: Verify the GitHub Action snippet against the real action**

Copy the GitHub Actions workflow snippet from the page. Do not push it; instead diff every `uses:`/`with:` input against `/Users/thomasboni/workspace/github.com/getplumber/plumber/action.yml` (inputs, defaults, version tag). Any input in the snippet that `action.yml` doesn't define, wrong default described, or stale version tag = finding.

- [ ] **Step 5: Record navigation/UX findings and close the tab**

While on the pages: test the docs search (query `install`, log whether the top results are useful), click every link on the visited pages that a first-timer would plausibly click, log any 404/wrong target. Write all findings + `## Timing` estimate to `$NOTES/01-journey-github.md`. Close the browser tab.

---

### Task 3: Journey 2 - GitLab developer (live site + real execution)

**Files:**
- Create: `$NOTES/02-journey-gitlab.md`
- No repo files touched.

**Interfaces:**
- Consumes: `$NOTES/bin/plumber` or brew-installed binary (Tasks 1-2).
- Produces: `$NOTES/02-journey-gitlab.md`: same structure as Task 2's notes (`## Path log`, findings, `## Timing`, optional `## Blocked`). Task 8 consumes it.

- [ ] **Step 1: Walk the GitLab path on the live site**

New tab → `https://getplumber.io/docs/` → follow the site's own links to the GitLab page (`/docs/cli/gitlab`). Same persona rules and `## Path log` as Task 2.

- [ ] **Step 2: Run the first GitLab scan exactly as documented**

Copy the first local-scan command from the page and run it against `/Users/thomasboni/workspace/github.com/getplumber/plumber-lab-gitlab` (cd there first). If the command requires `GITLAB_TOKEN` and none is available in the environment (`env | grep -i gitlab`), record the limitation under `## Blocked`, then still verify the command's flags exist in `$NOTES/help/analyze.txt`.

- [ ] **Step 3: Verify the GitLab CI component snippet against the real component**

Copy the CI component snippet from the page and cross-check it against the component source in the `plumber` repo (`/Users/thomasboni/workspace/github.com/getplumber/plumber/gitlab/`: find the component template with `ls` and `grep -rn "spec:" `). Check: input names, defaults, version ref. Mismatches = findings.

- [ ] **Step 4: Check MR-comment / badge claims**

The GitLab page shows screenshots (badge comment, MR comments). Verify the features they depict are real: `grep -rn -i "comment\|badge" /Users/thomasboni/workspace/github.com/getplumber/plumber/gitlab/ --include='*.go' -l` and skim the matched files. A screenshot of a feature that no longer exists or behaves differently = `MISLEADING`.

- [ ] **Step 5: Record findings and close the tab**

Write all findings to `$NOTES/02-journey-gitlab.md`. Close the tab.

---

### Task 4: Journey 3 - Self-hoster (live site, read-verified against source)

**Files:**
- Create: `$NOTES/03-journey-selfhost.md`
- No repo files touched.

**Interfaces:**
- Produces: `$NOTES/03-journey-selfhost.md`: same structure as Task 2's notes. Task 8 consumes it.

- [ ] **Step 1: Walk the self-hoster path on the live site**

New tab → `https://getplumber.io/docs/` → Getting Started → Installation. Persona: *"I'm evaluating Plumber for my team; I want the platform running locally first."* Log in `## Path log`: is it obvious which of the four install options to pick? Does Getting Started give any value before demanding an install? Each unforced decision = `FRICTION`.

- [ ] **Step 2: Read the Docker Compose Local guide and verify every command against source**

On `https://getplumber.io/docs/installation/docker-compose-local`: for every command, file name, env var, and default credential the page shows, verify it exists in the platform source: `grep -rn "<the-exact-string>" /Users/thomasboni/workspace/github.com/getplumber/platform /Users/thomasboni/workspace/github.com/getplumber/monorepo --include='*.yml' --include='*.yaml' --include='*.env*' -l` (adjust includes as needed; locate compose files first with `find ... -name 'docker-compose*'`). Do NOT deploy. Mismatches = findings.

- [ ] **Step 3: Spot-check the production Docker Compose + reference pages the same way**

Same verification for `https://getplumber.io/docs/installation/docker-compose` and `https://getplumber.io/docs/installation/reference` (env-var reference table vs the platform's actual config parsing: locate with `grep -rn "getenv\|env:" ` in the platform backend config package).

- [ ] **Step 4: Record findings and close the tab**

Write findings + `## Timing` (estimated time-to-running-platform per the docs) to `$NOTES/03-journey-selfhost.md`. Close the tab.

---

### Task 5: Consistency pass - CLI commands, flags, exit codes, config modes

**Files:**
- Create: `$NOTES/04-consistency-cli.md`
- No repo files touched.

**Interfaces:**
- Consumes: `$NOTES/help/*.txt` (Task 1).
- Produces: `$NOTES/04-consistency-cli.md` findings. Task 8 consumes it.

- [ ] **Step 1: Extract every CLI claim from the docs**

Source pages (read in the repo, they render 1:1):
`src/docs/data/docs/en/cli/reference/index.mdx`, `cli/github/index.mdx`, `cli/gitlab/index.mdx`, `cli/installation.mdx` (repo `getplumber.io`). List every flag (`--...`), subcommand, exit code, and config-mode claim into a scratch list.

- [ ] **Step 2: Diff flags and subcommands against real help output**

For each documented flag/subcommand, confirm it appears in the matching `$NOTES/help/*.txt`. Then reverse: list flags in `$NOTES/help/analyze.txt` missing from the reference page. Both directions produce findings (`BROKEN` if docs show a flag the binary lacks; `FRICTION`/`MISLEADING` if the binary has undocumented important flags).

- [ ] **Step 3: Verify exit codes and config modes in source**

Exit codes: `grep -rn "os.Exit\|ExitCode" /Users/thomasboni/workspace/github.com/getplumber/plumber/cmd /Users/thomasboni/workspace/github.com/getplumber/plumber/main.go`. Config modes (no config / extended / full): compare the reference section against `/Users/thomasboni/workspace/github.com/getplumber/plumber/configuration/` and `defaultConfig/`. Mismatches = findings.

- [ ] **Step 4: Record findings**

Write to `$NOTES/04-consistency-cli.md` (or `_No findings._`).

---

### Task 6: Consistency pass - controls catalog, versions, install channels

**Files:**
- Create: `$NOTES/05-consistency-catalog.md`
- No repo files touched.

**Interfaces:**
- Consumes: `LATEST_RELEASE` from `$NOTES/00-baseline.md` (Task 1).
- Produces: `$NOTES/05-consistency-catalog.md` findings. Task 8 consumes it.

- [ ] **Step 1: Diff the controls catalog**

Extract control/issue codes from the docs data: `grep -on '"code": *"[^"]*"\|code: *"[^"]*"' /Users/thomasboni/workspace/github.com/getplumber/getplumber.io/src/data/issues.ts | sort -u` (adapt the pattern to the file's actual shape after reading its head). Extract the real catalog from the CLI repo: inspect `/Users/thomasboni/workspace/github.com/getplumber/plumber/control/` and `policies/` (`ls`, then grep for the code/ID field). Diff both lists; every control present on one side only = finding (`MISLEADING` for docs-only, `FRICTION` for undocumented product controls).

- [ ] **Step 2: Check version pins in docs against LATEST_RELEASE**

```bash
grep -rn "v0\.4\.[0-9]*" /Users/thomasboni/workspace/github.com/getplumber/getplumber.io/src/docs/data/docs/en --include='*.mdx'
```

Every pin older than `LATEST_RELEASE` = `MISLEADING` finding (stale pinned version in copy-paste snippet). Known pin sites: `cli/installation.mdx:39,43`, `cli/github/index.mdx:99,229,237`, `cli/gitlab/index.mdx:165,208,220,539,568`.

- [ ] **Step 3: Verify every documented install channel exists**

- Homebrew: `brew tap-info getplumber/plumber` or check https://github.com/getplumber/homebrew-plumber (local clone exists at `/Users/thomasboni/workspace/github.com/getplumber/homebrew-plumber`: check formula name/version).
- mise: confirm `mise use -g github:getplumber/plumber` resolves (`mise ls-remote github:getplumber/plumber | tail -3` if mise is installed; otherwise verify release assets exist, since the github backend uses them).
- Docker: `docker manifest inspect getplumber/plumber:latest > /dev/null && echo OK` (or `curl -s https://hub.docker.com/v2/repositories/getplumber/plumber/tags/latest`).
- Release binaries incl. Windows + checksums: `gh release view --repo getplumber/plumber --json assets --jq '.assets[].name'`: every filename referenced in `cli/installation.mdx` must appear.

Missing/renamed channel or asset = `BROKEN`.

- [ ] **Step 4: Record findings**

Write to `$NOTES/05-consistency-catalog.md`.

---

### Task 7: Completeness sweep - remaining pages + site-wide link check

**Files:**
- Create: `$NOTES/06-sweep.md`
- No repo files touched.

**Interfaces:**
- Produces: `$NOTES/06-sweep.md` findings. Task 8 consumes it.

- [ ] **Step 1: Site-wide link check**

```bash
npx -y linkinator https://getplumber.io/docs/ --recurse --skip "linkedin.com|twitter.com|x.com" --format csv > "$NOTES/linkinator.csv"
grep -v ",200," "$NOTES/linkinator.csv" | grep -v "^url" || echo "no broken links"
```

Every non-200 internal link = `BROKEN` finding (note: treat 403/429 from external rate-limiters as `COSMETIC`, verify manually in the browser before reporting).

- [ ] **Step 2: Page-level check of every page not covered by Tasks 2-6**

Read each of these in the repo (`src/docs/data/docs/en/`) AND glance at its live rendering: `plumber-score/index.mdx`, `ambassador-program.mdx`, `authentication/overview.mdx`, `use-plumber/controls.mdx`, `use-plumber/issues.mdx`, `use-plumber/register-templates.mdx`, `use-plumber/roles-permissions.mdx`, `installation/kubernetes.mdx`, `installation/podman.mdx`, `installation/troubleshooting.mdx`, `getting-started/index.mdx`, `cli/index.mdx`. Per page ask: Is it accurate (spot-check 2-3 claims against product source)? Is it clear to a first-timer? Is there dead content (e.g. the commented-out YouTube embed in `getting-started/index.mdx:25-35`)? Does it belong where it sits in the sidebar (`src/docs/config/en/sidebarNavData.json.ts`)?

- [ ] **Step 3: Record findings**

Write to `$NOTES/06-sweep.md`, one finding per bullet, grouped under a `### <page>` heading per page.

---

### Task 8: Write the audit report + target IA, commit

**Files:**
- Create: `docs/superpowers/audits/2026-08-10-docs-audit.md` (repo `getplumber.io`)

**Interfaces:**
- Consumes: all `$NOTES/*.md` files (Tasks 1-7).
- Produces: the committed report, the project's deliverable.

- [ ] **Step 1: Merge and rank findings**

Read every `$NOTES/*.md`. Deduplicate (same page + same root cause = one finding, keep the strongest evidence). Order: BROKEN, MISLEADING, FRICTION, COSMETIC; within a severity, order by how early the page sits in a first-timer's path (getting started > CLI pages > platform > misc).

- [ ] **Step 2: Write the report**

Structure (from the spec, exactly):

```markdown
# Docs Audit: 2026-08-10

## TL;DR: Top 10 issues
1. ...

## Findings
### Broken
- **<page URL>**: <what> | Evidence: <...> | Fix: <...>
### Misleading
### Friction
### Cosmetic

## Blocked checks
<anything from the ## Blocked sections of the notes>

## Proposed target IA (CLI-first)
### Sidebar/tab structure
<concrete tree: tabs → sections → pages, marking moved/new/deleted pages>
### New getting-started flow
<the exact copy-paste blocks, in order, using only commands verified in Tasks 1-3>
### Redirects
<table: old URL → new URL, formatted to drop into vercel.json's redirect array>
```

Rules for the IA section: the getting-started flow must reach a first score with zero decisions (pre-pick the install method per OS via tabs, pre-fill the analyze command); every command block must be one already executed successfully during Tasks 1-3; complexity (config modes, self-hosting, CI integration) appears only as "go further" links. Check `vercel.json` in the repo root for the current redirect format before writing the redirect table.

- [ ] **Step 3: Self-check the report**

Verify: every finding has URL + evidence + fix; no finding appears twice; every command in the IA section traces to a successful execution in the notes; TL;DR has exactly the 10 highest-impact items.

- [ ] **Step 4: Commit**

```bash
cd /Users/thomasboni/workspace/github.com/getplumber/getplumber.io
git add docs/superpowers/audits/2026-08-10-docs-audit.md
git commit -m "docs(audit): add developer-POV docs audit with CLI-first target IA"
```

No AI co-author trailer.

- [ ] **Step 5 (optional): Publish the report as a private artifact page**

If running in a harness with the Artifact tool: publish the report file as a private artifact (title "Plumber Docs Audit", stable favicon) so the user gets a comfortable reading link. Skip silently if the tool is unavailable.
