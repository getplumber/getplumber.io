# Docs Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix every audit finding applicable to the getplumber.io repo and implement the CLI-first target IA, delivered as one PR from a feature branch.

**Architecture:** Content fixes land page by page (Tasks 1-9), then the IA restructure (Tasks 10-12: new configuration page, sidebar re-tabbing with a new `sidebar.hidden` flag, getting-started rewrite), then whole-site verification (Task 13). The spec is the validated audit report `docs/superpowers/audits/2026-08-10-docs-audit.md`; finding references below (e.g. "BROKEN #3") count within its severity sections in order.

**Tech Stack:** Astro 5 + MDX docs site, Tailwind, Zod content schema (`src/content.config.ts`), Vercel redirects (`vercel.json`).

## Global Constraints

- Branch: all work happens on branch `docs/audit-fixes` cut from `main`. One PR at the end. Never commit to `main`.
- Commits: conventional commits; **never** any `Co-Authored-By: Claude` / AI attribution trailer (repo CLAUDE.md rule). Do not touch `package-lock.json`.
- **No em dashes (—) in any new or edited prose.** Use commas, colons, periods, or ` | ` separators. (Repo owner style rule.)
- The audit report and this plan are read-only inputs. Do not edit them.
- Repo root: `/Users/thomasboni/workspace/github.com/getplumber/getplumber.io`. All paths below are relative to it.
- MDX components `Aside`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Steps`, `Badge`, `Button` are auto-imported in docs MDX (astro-auto-import, see `astro.config.mjs:59-70`); never add import lines for them in `.mdx` files.
- Existing URLs must keep working. The only URL that changes behavior is `/docs/use-plumber/controls` (redirected in Task 11). The two deleted pages (Task 9) already 404 in production.
- Cheap verification per task: `grep` assertions given in each task. Full verification (`npm run lint`, `npm run build`) runs in Tasks 5, 11, 12, and 13; don't run the full build in every small task.
- Cross-repo findings are OUT of scope for code changes; they are listed in the PR body (Task 13): plumber repo (README SHA-pinned line, `action.yml` min-points default, `--version` flag alias, MR-comment screenshot regeneration), platform repo (`install.sh` word prompts, compose `${VAR:-default}` interpolation, `.gitignore` `.env.*`, `JOBS_*` config source of truth).

---

### Task 0: Create the feature branch

**Files:** none (git only).

- [ ] **Step 1: Branch**

```bash
git checkout main && git pull --ff-only 2>/dev/null; git checkout -b docs/audit-fixes
```

Expected: `Switched to a new branch 'docs/audit-fixes'`. No commit in this task.

---

### Task 1: Fix `cli/github/index.mdx` (BROKEN #1, #2, #4-github-half; FRICTION #5; COSMETIC #2)

**Files:**
- Modify: `src/docs/data/docs/en/cli/github/index.mdx`

**Interfaces:**
- Produces: corrected page content; Task 13 greps assert the fixed strings.

- [ ] **Step 1: Fix the `score` input default (BROKEN #1)**

In the "All inputs" table, find the `score` row. It currently says default `true` with description "Include the full points breakdown. The Plumber score is shown by default; set `false` for the banner without the per-issue-code breakdown." Change the default cell to `false` and the description to: "Add the full per-issue-code points breakdown on top of the score banner. Off by default; set `true` to include it." (This matches `action.yml`'s own description.)

- [ ] **Step 2: Fix the README pin Tip (BROKEN #2)**

Around line 75 there is a Tip linking to `https://github.com/getplumber/plumber#option-3-github-action` claiming a "ready-to-paste SHA-pinned `uses:` line... auto-updated on new releases". The anchor doesn't exist and the README section holds a `@<version>` placeholder, not a SHA. Replace the Tip's text so it: (a) links to `https://github.com/getplumber/plumber#github-action` (the real `## GitHub Action` heading anchor), and (b) drops the auto-updated-SHA claim, instead stating that the snippet on this page is already pinned to the latest release SHA and the README shows the general shape. Keep the Tip's surrounding `<Aside>` structure.

- [ ] **Step 3: Fix `pull_request: null` (FRICTION #5)**

Line ~87: change `    pull_request: null` to `    pull_request:` (bare key, no value) inside the workflow YAML block.

- [ ] **Step 4: Fix Silent Mode `--print false` (BROKEN #4, github half)**

Lines ~317-323 ("Silent Mode (JSON Only)"): change `--print false` to `--print=false`. Then scan the whole file for any other boolean flag shown with a space-separated value (`grep -n "print false\|score false\|print true" src/docs/data/docs/en/cli/github/index.mdx`) and convert to `=` form.

- [ ] **Step 5: Footnote the `min-points` default (COSMETIC #2)**

In the "All inputs" table `min-points` row, change the default cell from `100` to `""` and append to its description: "Empty means the CLI default gate of 100 points." (This matches `action.yml`'s literal `default: ""`.)

- [ ] **Step 6: Verify and commit**

```bash
grep -n "print=false" src/docs/data/docs/en/cli/github/index.mdx        # >=1 hit
grep -cn "print false" src/docs/data/docs/en/cli/github/index.mdx || true # 0 hits
grep -n "pull_request:$" src/docs/data/docs/en/cli/github/index.mdx      # 1 hit
grep -n "option-3-github-action" src/docs/data/docs/en/cli/github/index.mdx || true # 0 hits
git add src/docs/data/docs/en/cli/github/index.mdx
git commit -m "fix(docs): correct GitHub Action inputs, README tip, and silent-mode example"
```

---

### Task 2: Fix `cli/gitlab/index.mdx` (BROKEN #4-gitlab-half; MISLEADING #1, #2, #3; FRICTION #6, #7)

**Files:**
- Modify: `src/docs/data/docs/en/cli/gitlab/index.mdx`
- Possibly delete: `src/docs/data/docs/en/cli/img/merge-request-comments.png` (only if unreferenced after the edit)

**Interfaces:**
- Produces: corrected page content; Task 13 greps assert the fixed strings.

- [ ] **Step 1: Fix Silent Mode (BROKEN #4, gitlab half)**

Lines ~351-360: change `--print false` to `--print=false`; scan the file for other space-separated boolean flag values as in Task 1 Step 4.

- [ ] **Step 2: Add the `glsast_file` input row (MISLEADING #1)**

In the component "All inputs" table, add a row: name `glsast_file`, default `gl-sast-report.json`, description: "Write a GitLab SAST report and upload it via `artifacts:reports:sast`, feeding the Security Dashboard and the MR security widget." Place it next to the `pbom_cyclonedx_file` row.

- [ ] **Step 3: Fix the `image` default (MISLEADING #2)**

In the same table, the `image` row default currently reads `getplumber/plumber:0.1`. Change it to: "digest-pinned `getplumber/plumber` image tracking the latest release" (do not hardcode the sha256, it changes each release).

- [ ] **Step 4: Remove the stale MR-comment screenshot (MISLEADING #3)**

The "Merge Request Comments" section shows `./img/merge-request-comments.png` (old percentage/threshold format contradicting the letter-grade format described in the text and shown in the badge screenshot). Remove the image reference (keep the section text and feature list). Then check `grep -rn "merge-request-comments" src/` and if the file is now unreferenced, `git rm src/docs/data/docs/en/cli/img/merge-request-comments.png`. Add an HTML comment in the section: `{/* TODO(follow-up): re-add a screenshot regenerated from a current build; tracked in PR body */}`. This is the one sanctioned TODO comment; it marks a cross-repo follow-up.

- [ ] **Step 5: Add the GitLab mirror note (FRICTION #6)**

Immediately after the first `include: component:` snippet, add:

```mdx
<Aside variant="info">
  The pinned commit SHAs in these snippets refer to
  [gitlab.com/getplumber/plumber](https://gitlab.com/getplumber/plumber), the GitLab mirror
  that hosts the CI component. The mirror has its own commit history: its SHAs are
  intentionally different from the GitHub repository's SHAs for the same release tag.
</Aside>
```

- [ ] **Step 6: Document `--provider` (FRICTION #7)**

In the local-scan section (near where `--gitlab-url` / `--project` are shown), add a short paragraph plus example: "Plumber auto-detects the provider from your git remote. If your repo's remote does not match the CI provider you want to audit (mirrors, migrations, repos hosted on one platform but running CI on another), force it:" followed by

```bash
plumber analyze --provider gitlab
```

Also add a row to the page's Troubleshooting table (if present; otherwise a one-line Aside): "Scan targets the wrong provider | The git remote points elsewhere; add `--provider gitlab`."

- [ ] **Step 7: Verify and commit**

```bash
grep -n "print=false" src/docs/data/docs/en/cli/gitlab/index.mdx   # >=1
grep -n "glsast_file" src/docs/data/docs/en/cli/gitlab/index.mdx   # >=1
grep -n "provider gitlab" src/docs/data/docs/en/cli/gitlab/index.mdx # >=1
grep -n "plumber:0.1" src/docs/data/docs/en/cli/gitlab/index.mdx || true # 0
git add -A src/docs/data/docs/en/cli
git commit -m "fix(docs): correct GitLab component inputs and document provider override"
```

---

### Task 3: Fix `cli/installation.mdx` (BROKEN #3; FRICTION #4) and retitle for search (FRICTION #3, retitle half)

**Files:**
- Modify: `src/docs/data/docs/en/cli/installation.mdx`

**Interfaces:**
- Produces: page retitled to "CLI Installation" (frontmatter `title`); sidebar label stays "Installation". Task 12 does not depend on this but Task 13 asserts it.

- [ ] **Step 1: Drop the `v` prefix in the versioned Homebrew snippet (BROKEN #3)**

Lines 39 and 43: `plumber@v0.4.36` becomes `plumber@0.4.36` in the `brew install` line, the `brew link` line, and the keg-only Aside path (`/usr/local/opt/plumber@0.4.36/bin/plumber`).

- [ ] **Step 2: Add a verify step to every install tab (FRICTION #4)**

At the end of each of the five `TabsContent` blocks (homebrew, mise, binary, docker, source), add:

**Verify:**

```bash
plumber version
```

For the docker tab use `docker run --rm getplumber/plumber:latest version` instead. Add one sentence after the first verify block only: "Note: it is `plumber version` (a subcommand); `plumber --version` is not a flag and exits with an error."

- [ ] **Step 3: Retitle the page (FRICTION #3, retitle half)**

Frontmatter: `title: "Installation"` becomes `title: "CLI Installation"`. Keep `sidebar.label: "Installation"` unchanged (the sidebar already scopes by tab; the title change disambiguates search results and browser tabs).

- [ ] **Step 4: Verify and commit**

```bash
grep -c "plumber@v0" src/docs/data/docs/en/cli/installation.mdx || true  # 0
grep -c "plumber version" src/docs/data/docs/en/cli/installation.mdx     # >=5
grep -n 'title: "CLI Installation"' src/docs/data/docs/en/cli/installation.mdx # 1
git add src/docs/data/docs/en/cli/installation.mdx
git commit -m "fix(docs): correct versioned Homebrew formula name and add install verify steps"
```

---

### Task 4: Fix `cli/reference/index.mdx` (MISLEADING #4; FRICTION #8, #9)

**Files:**
- Modify: `src/docs/data/docs/en/cli/reference/index.mdx`

**Interfaces:**
- Produces: corrected reference. Task 10 later EXTRACTS the `## Configuration` section from this same file; to avoid conflicts, this task must NOT touch the `## Configuration` section (lines ~15-61).

- [ ] **Step 1: Split the exit-3 row (MISLEADING #4)**

In `## Exit Codes` (~line 385), the row for code `3` currently reads "a check could not be verified and `--fail-warnings` is set". Replace with two cases in the same row (or two rows if the table style allows): "Data collection was degraded (some controls could not be verified): always exits 3, regardless of the score gate. Also returned when `--fail-warnings` is set and warnings occurred." Update the `dataCollectionDegraded` JSON-field description (~line 472) to match: a degraded run never exits 0.

- [ ] **Step 2: Document the `PLUMBER_ANALYZE_*` convention (FRICTION #8)**

In the "Environment variables" section (~lines 110-117), append: "Every `plumber analyze` flag can also be set through an environment variable following the convention `PLUMBER_ANALYZE_<FLAG>` with the flag name uppercased and dashes replaced by underscores (for example `PLUMBER_ANALYZE_MIN_SCORE=B`, `PLUMBER_ANALYZE_OUTPUT=report.json`). Flags take precedence over environment variables. The exact variable for each flag is shown in `plumber analyze --help`."

- [ ] **Step 3: Add `completion` and `version` (FRICTION #9)**

In `## Command Reference`, after the last `plumber config` subsection, add:

```mdx
### `plumber completion`

Generate a shell completion script for bash, zsh, fish, or PowerShell:

​```bash
plumber completion zsh > "${fpath[1]}/_plumber"   # zsh example
​```

Run `plumber completion --help` for per-shell installation instructions.

### `plumber version`

Print the CLI version:

​```bash
plumber version
​```
```

(Remove the zero-width characters before the backtick fences when writing; they exist here only so this plan's own fence doesn't break.)

- [ ] **Step 4: Verify and commit**

```bash
grep -n "PLUMBER_ANALYZE_" src/docs/data/docs/en/cli/reference/index.mdx  # >=2
grep -n "plumber completion" src/docs/data/docs/en/cli/reference/index.mdx # >=1
git add src/docs/data/docs/en/cli/reference/index.mdx
git commit -m "fix(docs): correct exit code 3, document env-var convention and missing commands"
```

---

### Task 5: Fix `src/data/issues.ts` (BROKEN #5; MISLEADING #5)

**Files:**
- Modify: `src/data/issues.ts`

**Interfaces:**
- Produces: ISSUE-103 with nested config example; ISSUE-601 carrying the workflow-name content; the ex-601 security-policy content moved to a platform-scoped entry. Task 13 asserts via build.

- [ ] **Step 1: Fix ISSUE-103's config surface (BROKEN #5)**

Around lines 1892-1924: set `controlConfigKey: "containerImageMustNotUseForbiddenTags"` (it currently says `containerImagesMustBePinnedByDigest`). Rewrite the `goodExample` YAML to the nested shape:

```yaml
containerImageMustNotUseForbiddenTags:
  enabled: true
  containerImagesMustBePinnedByDigest: true
```

Update the adjacent `tip` text so it names `containerImagesMustBePinnedByDigest` as a sub-option of `containerImageMustNotUseForbiddenTags`, not a standalone control.

- [ ] **Step 2: Swap ISSUE-601 and ISSUE-422 content (MISLEADING #5)**

Current state: the entry with `code: "ISSUE-601"` (~lines 1353-1390) holds "Missing security policy source on project" (GitLab/Platform-only), while the entry with `code: "ISSUE-422"` (~lines 1392-1431, `status: "roadmap"`) holds "Workflow has no explicit name" (`workflowsMustHaveExplicitName`), which is the CLI's REAL ISSUE-601 (CLI `control/codes.go`: ISSUE-601 = `workflowsMustHaveExplicitName`, DocURL points at `/docs/cli/issues/ISSUE-601`).

Perform the swap by reassigning codes, not by moving blocks: the workflow-name entry gets `code: "ISSUE-601"` and drops `status: "roadmap"` (it is live in the CLI, so it must appear in the controls table); the security-policy entry gets `code: "ISSUE-422"` and KEEPS a non-live status (`status: "roadmap"`) unless `grep -rn "ISSUE-422" ../plumber/control/` proves the CLI ships it (it does not, per the audit). Check `src/data/issueCodeRedirects.ts` and add no redirect entries (both codes still exist; only their content changed). Check `src/data/issueCategoryOrder.ts` for per-code ordering references to 601/422 and keep categories coherent (the workflow-name entry belongs with the workflow hygiene category, the security-policy entry with the GitLab project settings category; follow the file's existing category values).

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit -p tsconfig.json 2>/dev/null || npm run lint
grep -n 'controlConfigKey: "containerImageMustNotUseForbiddenTags"' src/data/issues.ts # 1
git add src/data/issues.ts
git commit -m "fix(docs): correct ISSUE-103 config shape and restore real ISSUE-601 content"
```

---

### Task 6: Fix Platform installation pages (MISLEADING #6, #7; BROKEN #6; FRICTION #10, #11)

**Files:**
- Modify: `src/docs/data/docs/en/installation/docker-compose.mdx`
- Modify: `src/docs/data/docs/en/installation/docker-compose-local.mdx`
- Modify: `src/docs/data/docs/en/installation/troubleshooting.mdx`
- Modify: `src/docs/data/docs/en/installation/reference.mdx`

**Interfaces:**
- Produces: corrected platform install docs. Task 13 asserts.

- [ ] **Step 1: Installer prompt wording (MISLEADING #6)**

`docker-compose-local.mdx` ~line 50: change `Choose **"Local"**` to `Choose option **2 (Local)**: type `2` and press Enter`. `docker-compose.mdx` ~line 67: change `Choose **"Production"**` to `Choose option **1 (Production)**: type `1` and press Enter`.

- [ ] **Step 2: Backup-free sed commands (FRICTION #10)**

Both files carry three sequential `sed -i."" "s/^SECRET_KEY=.*/..."` style commands (`docker-compose-local.mdx:137-139`, `docker-compose.mdx:161-163`). Replace the `sed -i.""` invocations with a portable no-backup form using perl:

```bash
perl -pi -e "s/^SECRET_KEY=.*/SECRET_KEY=$(openssl rand -hex 32)/" .env
```

(mirror the same substitution targets the sed versions had for all three variables). Add one sentence after the block: "These commands edit `.env` in place and leave no backup file behind."

- [ ] **Step 3: Troubleshooting anchor (BROKEN #6)**

`troubleshooting.mdx:22`: change the link `docker-compose/#-gitlab-oidc` to `docker-compose/#step-4-configure-gitlab-oidc`.

- [ ] **Step 4: Reference page truth pass (MISLEADING #7 + FRICTION #11)**

In `reference.mdx`: (a) for the rows `JOBS_LISTEN_ADDR`, `JOBS_LISTEN_PORT`, `JOBS_SESSION_TTL`, `LOG_LEVEL`, `LOG_FORMATTER`, `JOBS_REDIS_HOST`, `JOBS_REDIS_PORT`, `JOBS_REDIS_DB`, `JOBS_REDIS_USER`, `JOBS_REDIS_SET_NAMESPACES_TTL`, change the "Required" marker to "Fixed by the Docker Compose deployment" and add a preceding Aside: "On Docker Compose installs these values are set inside `compose.yml` itself; changing them in `.env` has no effect. Edit the compose file if you must override them." (b) Add a new "Deployment profile & images" section documenting the vars the install guides instruct users to set: `DOMAIN_NAME` (public hostname, Production), `COMPOSE_PROFILES` (`local` or `production`), `CERT_RESOLVER` (`letsencrypt` or `custom`), `FRONTEND_IMAGE_TAG` / `BACKEND_IMAGE_TAG` (image versions, default latest release), `GITLEAKS_PATH` (path to the gitleaks binary inside the containers; fixed by the images). Descriptions come from their usage in the install guides on the same site; keep each to one line.

- [ ] **Step 5: Verify and commit**

```bash
grep -rn "sed -i" src/docs/data/docs/en/installation/ || true      # 0 hits
grep -n "step-4-configure-gitlab-oidc" src/docs/data/docs/en/installation/troubleshooting.mdx # 1
grep -n "DOMAIN_NAME" src/docs/data/docs/en/installation/reference.mdx # >=1
git add src/docs/data/docs/en/installation
git commit -m "fix(docs): correct installer prompts, env-var reference, and OIDC anchor"
```

---

### Task 7: Mark Maintainer as planned in `roles-permissions.mdx` (MISLEADING #8)

**Files:**
- Modify: `src/docs/data/docs/en/use-plumber/roles-permissions.mdx`

- [ ] **Step 1: Mark the role**

In the roles table (~lines 24-27) and the Maintainer detail section (~lines 43-54): retitle the role as `Maintainer <Badge text="Planned" variant="caution" />` (the `Badge` MDX component is auto-imported) and add an Aside at the top of the Maintainer section: "The Maintainer tier is not yet enforced. Until it ships, routes documented as Maintainer-gated are available to Admins only, and the Settings > Authorization allowlist has no effect on access level." Keep the permission table rows but mark the Maintainer column header "(planned)".

- [ ] **Step 2: Verify and commit**

```bash
grep -n "Planned" src/docs/data/docs/en/use-plumber/roles-permissions.mdx # >=2
git add src/docs/data/docs/en/use-plumber/roles-permissions.mdx
git commit -m "fix(docs): mark Maintainer role as planned, matching shipped RBAC"
```

---

### Task 8: Rewrite `register-templates.mdx` around the current import flow (BROKEN #7)

**Files:**
- Modify: `src/docs/data/docs/en/use-plumber/register-templates.mdx`
- Read (ground truth, do not modify): `/Users/thomasboni/workspace/github.com/getplumber/monorepo/platform/frontend/src/app/(app)/catalog/import/import-view.tsx` and `/Users/thomasboni/workspace/github.com/getplumber/monorepo/platform/frontend/docs/legacy-map/catalog.md`

- [ ] **Step 1: Read the product source**

Read `import-view.tsx` (~lines 360-417 carry the flow) and `legacy-map/catalog.md` (dropped features list). Extract: how a user starts an import ("Import CI/CD templates"), what they provide (a GitLab project path or URL), what the importer does (imports the whole repo, reads template metadata live via the GitLab GraphQL API), what is NOT involved (no `.r2.yml` manifest, no `template_release` component, no per-template registration).

- [ ] **Step 2: Rewrite the page**

Replace the page body (keep frontmatter, updating `title`/`description` to "Import CI/CD templates") with: a one-paragraph overview of the current flow; a Steps block (open Catalog, click Import CI/CD templates, enter the GitLab project, confirm; Plumber reads template metadata live); a short "What changed from R2Devops Hub" Aside stating that `.r2.yml` manifests, the R2 import flow, and the `template_release` versioning component are retired and are no longer read. Remove the dead `r2devops.io/catalog/.../template_release` link. Every claim in the new page must be checked against `import-view.tsx`; do not carry over any sentence from the old page unverified.

- [ ] **Step 3: Verify and commit**

```bash
grep -cn "r2.yml\|template_release\|r2devops.io/catalog" src/docs/data/docs/en/use-plumber/register-templates.mdx || true # 0 outside the "What changed" Aside; the Aside may name them as retired but must carry no links to them
git add src/docs/data/docs/en/use-plumber/register-templates.mdx
git commit -m "fix(docs): rewrite template import page for the current importer"
```

---

### Task 9: Delete orphaned pages and fix the favicon 404 (BROKEN #8, #9; COSMETIC #3)

**Files:**
- Delete: `src/docs/data/docs/en/ambassador-program.mdx`
- Delete: `src/docs/data/docs/en/authentication/` (whole directory)
- Modify: `src/docs/layouts/BaseHead.astro:33`

- [ ] **Step 1: Delete the orphans**

```bash
git rm src/docs/data/docs/en/ambassador-program.mdx
git rm -r src/docs/data/docs/en/authentication
grep -rn "ambassador-program\|authentication/overview" src/ || true  # expect 0 hits
```

Both pages 404 in production today (no routes are generated for undeclared sections), so no redirects are needed.

- [ ] **Step 2: Fix the favicon reference**

`src/docs/layouts/BaseHead.astro:33` references `/favicons/favicon-96x96.png`, which does not exist in `public/favicons/` (16/32/48 do). Change the line to reference the existing 48px asset:

```html
<link rel="icon" type="image/png" href="/favicons/favicon-48x48.png" sizes="48x48" />
```

- [ ] **Step 3: Verify and commit**

```bash
test -f public/favicons/favicon-48x48.png && echo OK
grep -rn "favicon-96x96" src/ || true   # 0 hits
git add -A
git commit -m "fix(docs): remove orphaned pages and dead favicon reference"
```

---

### Task 10: Create `/docs/cli/configuration` (target IA: NEW page)

**Files:**
- Create: `src/docs/data/docs/en/cli/configuration.mdx`
- Modify: `src/docs/data/docs/en/cli/reference/index.mdx` (extract the `## Configuration` section)
- Modify: `src/docs/data/docs/en/cli/index.mdx` (update the reference-pointer sentence)

**Interfaces:**
- Produces: page at URL `/docs/cli/configuration` (glob loader: file `cli/configuration.mdx` gets id `cli/configuration`). Task 12's getting-started links to it as `/docs/cli/configuration`.

- [ ] **Step 1: Create the new page**

Move the entire `## Configuration` section of `cli/reference/index.mdx` (lines ~15-61: intro, `### No configuration`, `### Extended configuration (recommended)`, `### Full configuration`) into a new `cli/configuration.mdx` with frontmatter:

```yaml
---
title: "Configuration"
seoTitle: "Configure the Plumber CLI - .plumber.yaml and config modes"
description: "Tune the Plumber CLI with one .plumber.yaml: run with zero config, extend the baseline, or manage a full config, plus the plumber config commands."
sidebar:
  label: "Configuration"
  order: 5
  indent: true
section: "api"
---
```

Promote the three `###` headings to `##`. At the end add a short "Managing config files" section: one sentence per `plumber config` subcommand family (init/generate to create, view/diff/resolve to inspect, migrate/slim/validate to maintain) linking each mention to `/docs/cli/reference#plumber-config-init` style anchors.

- [ ] **Step 2: Replace the section in the reference**

In `cli/reference/index.mdx`, replace the moved `## Configuration` section with a two-line stub: `## Configuration` heading followed by "Configuration modes are documented on the [Configuration](/docs/cli/configuration) page. The `plumber config` commands are documented below." (Keeping the heading preserves the `#configuration` anchor used by existing cross-links, including `cli/index.mdx:19`.)

- [ ] **Step 3: Update `cli/index.mdx`**

Line ~45 mentions "the three [configuration modes](/docs/cli/reference#configuration)". Repoint that link to `/docs/cli/configuration`.

- [ ] **Step 4: Verify and commit**

```bash
grep -n "Extended configuration" src/docs/data/docs/en/cli/configuration.mdx    # 1
grep -n "Extended configuration" src/docs/data/docs/en/cli/reference/index.mdx || true # 0
git add src/docs/data/docs/en/cli
git commit -m "feat(docs): extract CLI configuration guide into its own page"
```

---

### Task 11: IA re-tab: sidebar, hidden flag, redirects (target IA structure)

**Files:**
- Modify: `src/docs/config/en/sidebarNavData.json.ts`
- Modify: `src/content.config.ts` (docs schema: add `sidebar.hidden`)
- Modify: the sidebar rendering component (locate it: `grep -rln "getTabSections\|sidebar" src/docs/layouts/DocsLayout.astro src/docs/components --include='*.astro' | head`; the component that lists a section's pages must skip docs with `sidebar.hidden === true`)
- Modify: `src/docs/data/docs/en/use-plumber/controls.mdx` (frontmatter: add `hidden: true` under `sidebar:`)
- Modify: `vercel.json`

**Interfaces:**
- Consumes: nothing from other tasks (independent of Tasks 10/12 content).
- Produces: CLI tab is the default landing tab; `/docs/use-plumber/controls` redirects to `/docs/cli/controls`. Task 12's rewritten getting-started renders under the CLI tab because the section moves here.

- [ ] **Step 1: Re-tab the sidebar config**

In `sidebarNavData.json.ts`: (a) reorder the `tabs` array to `api` (Open Source CLI) first, then `score`, then `main` (Platform); (b) move the `getting-started` section object out of the `main` tab's `sections` and insert it as the FIRST section of the `api` tab (before the existing `cli` section); (c) keep the `cli` section's existing `navLinks` EXACTLY as they are (`/docs/use-plumber/controls` + `/docs/use-plumber/issues`): these hrefs drive the `/docs/cli/controls` alias route generation in `[...slug].astro:85-104` and are displayed rewritten to `/docs/cli/*` on the CLI tab by `resolveSharedDocsHref`; (d) update the `main` tab's `description` to "Platform documentation: continuous monitoring, dashboards, team workflows".

Route consequence to verify in Step 5: `/docs/getting-started` is now generated under `sectionId: "api"`, so the CLI tab renders as active on the landing page. That IS the "default tab" mechanism; there is no separate default-tab setting.

- [ ] **Step 2: Add `sidebar.hidden` to the schema**

In `src/content.config.ts` docsCollection schema, inside the `sidebar` object add `hidden: z.boolean().optional(),` with comment `// hide from sidebar nav; page still builds (used for pages aliased into another tab)`.

- [ ] **Step 3: Filter hidden pages in the sidebar component**

Locate the component that maps a section's docs to sidebar entries (start from `DocsLayout.astro`; follow the import that renders the left nav). Where it iterates section docs, add a filter `doc.data.sidebar?.hidden !== true`. Do not filter in `getAdjacentPages` (prev/next may still traverse it on the CLI tab where the page is visible via navLinks).

- [ ] **Step 4: Hide controls from the Platform tab and redirect the old URL**

Add `hidden: true` under `sidebar:` in `use-plumber/controls.mdx` frontmatter. In `vercel.json`, add to the `redirects` array (before the `/admin` entry, matching the existing entry style):

```json
{
  "source": "/docs/use-plumber/controls",
  "destination": "/docs/cli/controls",
  "permanent": true
},
{
  "source": "/docs/use-plumber/controls/",
  "destination": "/docs/cli/controls",
  "permanent": true
}
```

- [ ] **Step 5: Build and verify routes**

```bash
npm run build 2>&1 | tail -5
test -d dist/docs/cli/controls && echo "cli/controls OK"
test -d dist/docs/getting-started && echo "getting-started OK"
grep -l "Open Source CLI" dist/docs/getting-started/index.html >/dev/null && echo "CLI tab present on landing"
```

Also verify the Platform sidebar no longer lists Controls: `grep -c "use-plumber/controls" dist/docs/installation/index.html` should be 0 (links on the Platform tab pages).

- [ ] **Step 6: Commit**

```bash
git add src/docs/config/en/sidebarNavData.json.ts src/content.config.ts src/docs/data/docs/en/use-plumber/controls.mdx vercel.json <sidebar-component-path>
git commit -m "feat(docs): make Open Source CLI the default docs tab and canonicalize controls URL"
```

---

### Task 12: Rewrite getting-started + installation intro (target IA: REWRITTEN pages; FRICTION #1, #2; COSMETIC #1)

**Files:**
- Modify: `src/docs/data/docs/en/getting-started/index.mdx` (full rewrite)
- Modify: `src/docs/data/docs/en/installation/index.mdx` (absorb pitch + cards)

**Interfaces:**
- Consumes: `/docs/cli/configuration` (Task 10), CLI-first tab mapping (Task 11).
- Produces: the CLI quickstart landing page.

- [ ] **Step 1: Rewrite `getting-started/index.mdx`**

Replace the entire file with (this is the full target content; the commented-out YouTube block from lines 25-35 dies with the rewrite, closing COSMETIC #1):

```mdx
---
title: Get your first Plumber Score
seoTitle: Get Started with Plumber - Scan your CI/CD in 2 minutes
description: "Install the open-source Plumber CLI and get a security score for your GitHub Actions or GitLab CI/CD pipelines in under two minutes."
sidebar:
  order: 1
  label: Getting Started
---

Plumber scans your CI/CD pipelines for security problems and grades them from
<span class="text-primary-400 dark:text-primary-300 font-bold">A</span> to
<span class="font-bold text-red-400 dark:text-red-300">E</span>. Three commands to your
first score:

## 1. Install

<Tabs defaultValue="macos">
  <TabsList>
    <TabsTrigger value="macos">macOS</TabsTrigger>
    <TabsTrigger value="linux">Linux</TabsTrigger>
  </TabsList>
  <TabsContent value="macos">
    ```bash
    brew tap getplumber/plumber
    brew install plumber
    ```
  </TabsContent>
  <TabsContent value="linux">
    ```bash
    brew tap getplumber/plumber
    brew install plumber
    ```
  </TabsContent>
</Tabs>

No Homebrew? [All install methods →](/docs/cli/installation)

## 2. Verify

```bash
plumber version
```

```text
plumber version 0.4.36
```

## 3. Get your first score

Run from any repo that has GitHub Actions workflows or a `.gitlab-ci.yml`:

```bash
cd path/to/your/repo
plumber analyze
```

Plumber detects the provider from your git remote, evaluates its security controls, and
prints a score banner. Exit codes: `0` passed, `1` score below the gate, `2` runtime error.

<Aside variant="info">
  **GitHub repo?** If you are logged in with the `gh` CLI, authentication is automatic.
  Otherwise set `GH_TOKEN`. **GitLab repo?** Set `GITLAB_TOKEN`. Details on the
  [GitHub](/docs/cli/github#authentication) and [GitLab](/docs/cli/gitlab#authentication) pages.
</Aside>

## Go further

<div class="not-content grid gap-6 sm:grid-cols-2 my-8">
  <a href="/docs/cli/github" class="group block rounded-2xl border bg-card text-card-foreground shadow-sm no-underline transition-colors hover:border-primary/50">
    <div class="flex flex-col space-y-2 p-6">
      <div class="text-xl font-semibold tracking-tight text-card-foreground">Gate your CI</div>
      <div class="text-muted-foreground text-sm">Add Plumber to GitHub Actions or the GitLab CI component and block pipelines below your minimum score.</div>
      <div class="pt-2 text-primary text-sm font-medium group-hover:underline">GitHub Actions → · <a href="/docs/cli/gitlab" class="text-primary">GitLab CI →</a></div>
    </div>
  </a>
  <a href="/docs/plumber-score" class="group block rounded-2xl border bg-card text-card-foreground shadow-sm no-underline transition-colors hover:border-primary/50">
    <div class="flex flex-col space-y-2 p-6">
      <div class="text-xl font-semibold tracking-tight text-card-foreground">Understand your score</div>
      <div class="text-muted-foreground text-sm">How the A to E grade and the points system work.</div>
      <div class="pt-2 text-primary text-sm font-medium group-hover:underline">Plumber Score →</div>
    </div>
  </a>
  <a href="/docs/cli/configuration" class="group block rounded-2xl border bg-card text-card-foreground shadow-sm no-underline transition-colors hover:border-primary/50">
    <div class="flex flex-col space-y-2 p-6">
      <div class="text-xl font-semibold tracking-tight text-card-foreground">Tune the controls</div>
      <div class="text-muted-foreground text-sm">One .plumber.yaml that extends the baseline with just what you change. See every control in the <a href="/docs/cli/controls" class="text-primary">catalog</a>.</div>
      <div class="pt-2 text-primary text-sm font-medium group-hover:underline">Configuration →</div>
    </div>
  </a>
  <a href="/docs/installation" class="group block rounded-2xl border bg-card text-card-foreground shadow-sm no-underline transition-colors hover:border-primary/50">
    <div class="flex flex-col space-y-2 p-6">
      <div class="text-xl font-semibold tracking-tight text-card-foreground">Monitor continuously</div>
      <div class="text-muted-foreground text-sm">The self-hosted Plumber Platform: dashboards, issue lifecycle, team roles, always-on auditing.</div>
      <div class="pt-2 text-primary text-sm font-medium group-hover:underline">Platform installation →</div>
    </div>
  </a>
</div>

## Community & support

- Join our [Discord community](/discord)
- Open a ticket: [help@plumber.helpscoutapp.com](mailto:help@plumber.helpscoutapp.com)
```

Fix-up rule: nested `<a>` inside `<a>` (the "Gate your CI" card) is invalid HTML; when writing the file, make that card a `<div>` with two sibling links instead. Verify the `#authentication` anchors exist on the github/gitlab pages (`grep -n "## Auth" src/docs/data/docs/en/cli/github/index.mdx src/docs/data/docs/en/cli/gitlab/index.mdx`); if the real heading ids differ, link to the pages without fragments.

- [ ] **Step 2: Absorb the pitch and cards into `installation/index.mdx`**

Prepend to the page (after the intro sentence): the platform-value pitch from the OLD getting-started ("CI/CD pipelines are the backbone..." block and the three value bullets) and the four Quick Installation cards, in ONE consistent order matching both the card row and the existing bullet list: Docker Compose (with a "(recommended)" label), Docker Compose Local, Kubernetes, Podman. Reorder the existing "Installation methods" bullets to that same order (they currently read Docker Compose, Docker Compose Local, Kubernetes, Podman: keep it; the sidebar order set by each page's `sidebar.order` frontmatter must be checked and aligned to the same order: `grep -n "order:" src/docs/data/docs/en/installation/*.mdx`; adjust the four method pages' `sidebar.order` values if needed so sidebar = cards = bullets).

- [ ] **Step 3: Build, verify, commit**

```bash
npm run build 2>&1 | tail -3
grep -c "brew tap getplumber/plumber" dist/docs/getting-started/index.html  # >=1
grep -c "Docker Compose" dist/docs/installation/index.html                  # >=2
git add src/docs/data/docs/en/getting-started/index.mdx src/docs/data/docs/en/installation
git commit -m "feat(docs): CLI-first getting started with zero-decision quickstart"
```

---

### Task 13: Whole-site verification and PR

**Files:** none new (fixes only if verification fails).

- [ ] **Step 1: Full validation**

```bash
npm run lint
npm run build
```

Both must pass clean. Fix and amend into the relevant commit if not.

- [ ] **Step 2: Assertion sweep over `dist/`**

```bash
grep -rl "print false" dist/docs/cli/ && echo "FAIL: space-form print" || echo OK
grep -rl "plumber@v0.4" dist/docs/cli/ && echo "FAIL: v-prefix formula" || echo OK
grep -rl "pull_request: null" dist/docs/cli/ && echo "FAIL: null trigger" || echo OK
grep -rl "option-3-github-action" dist/docs/ && echo "FAIL: dead readme anchor" || echo OK
grep -rl "favicon-96x96" dist/ && echo "FAIL: favicon" || echo OK
test -d dist/docs/ambassador-program && echo "FAIL: orphan built" || echo OK
test -d dist/docs/cli/configuration && echo OK || echo "FAIL: config page missing"
```

All lines must print OK.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin docs/audit-fixes
gh pr create --title "docs: fix audit findings and make the docs CLI-first" --body "<body>"
```

PR body must contain: (a) one-line summary; (b) "Closes all in-repo findings from docs/superpowers/audits/2026-08-10-docs-audit.md (31 findings; 27 in-repo, 4 cross-repo follow-ups)"; (c) the IA summary (CLI tab default, getting-started rewritten as CLI quickstart, one redirect added); (d) a "Cross-repo follow-ups" checklist: plumber repo: add a real SHA-pinned uses: line to the README GitHub Action section or keep docs pointing at the site snippet; harmonize action.yml min-points default; consider a --version flag alias; regenerate the MR-comment screenshot from a current build. platform repo: make install.sh accept word answers or keep numeric docs; switch compose environment blocks to ${VAR:-default} interpolation if the reference vars should be operator-settable; add .env.* to .gitignore; publish the JOBS_* config source of truth. (e) note that search-result scoping/boosting (FRICTION #3, second half) was deliberately not implemented; the page retitle covers the actionable part and search scoping needs a Pagefind integration decision.
No AI attribution anywhere in the PR body.

---

## Self-review results

- Spec coverage: all 31 findings mapped: BROKEN 1-9 → Tasks 1,1,3,1+2,5,6,8,9,9; MISLEADING 1-8 → Tasks 2,2,2,4,5,6,6,7; FRICTION 1-11 → Tasks 12,12,3(retitle)+13(PR note),3,1,2,2,4,4,6,6; COSMETIC 1-3 → Tasks 12,1,9. Target IA → Tasks 10,11,12. Cross-repo halves of BROKEN #2, COSMETIC #2, MISLEADING #3, #6 and FRICTION #4 (CLI flag alias) → PR body follow-ups (Task 13).
- Placeholders: the single TODO comment in Task 2 Step 4 is deliberate and PR-tracked; no other TBD/TODO.
- Consistency: `/docs/cli/configuration` id and links match between Tasks 10 and 12; navLinks preservation (Task 11) matches the alias mechanism in `[...slug].astro:85-104`; `sidebar.hidden` name consistent across schema, component filter, and controls.mdx frontmatter.
