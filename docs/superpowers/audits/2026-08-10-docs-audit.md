# Docs Audit: 2026-08-10

Developer-point-of-view audit of getplumber.io/docs, executed against the live site and the
real product (`plumber` v0.4.36 = `LATEST_RELEASE` at audit time). Every finding below was
verified by running the documented command, fetching the live page, or reading the product
source, never by assumption. Findings are deduplicated (same page + same root cause = one
finding, strongest evidence kept) and ordered BROKEN > MISLEADING > FRICTION > COSMETIC;
within a severity, by how early the page sits in a first-timer's path.

Severity legend: **BROKEN** = a documented command/link/claim fails outright when followed.
**MISLEADING** = docs state something the product contradicts. **FRICTION** = correct but
costs a first-timer time, guesses, or confidence. **COSMETIC** = no user-facing harm today.

Totals: **9 BROKEN, 8 MISLEADING, 11 FRICTION, 3 COSMETIC** (31 findings).

## TL;DR: Top 10 issues

1. **The docs front door sends every visitor to the self-hosted Platform.** `/docs` redirects
   to a Getting Started page that is 100% Platform (Docker Compose/Kubernetes/Podman) with the
   Platform tab pre-selected; a developer who just wants to scan a repo must notice a small
   3-way sidebar toggle and consciously pick "Open Source CLI". This is the root problem the
   target IA below fixes.
2. **The "Silent Mode (JSON Only)" example is a silent no-op** on both `/docs/cli/github` and
   `/docs/cli/gitlab`: `--print false` (space-separated) does not disable printing; only
   `--print=false` does. Verified against the released v0.4.36 binary.
3. **The documented "install a specific version" Homebrew command fails hard**:
   `brew install getplumber/plumber/plumber@v0.4.36`: the formula has no `v` prefix
   (`plumber@0.4.36`). Verified live with `brew info`.
4. **The GitHub Action `score` input default is documented backwards** (`true` in the docs
   table; `"false"` in `action.yml`, whose own description says "Off by default"), and the
   same page's example contradicts its own table.
5. **The "copy the SHA-pinned `uses:` line from the README" Tip is doubly broken**: the link
   anchor (`#option-3-github-action`) doesn't exist, and the README section it means contains
   `getplumber/plumber@<version>`: a placeholder, not a SHA-pinned line.
6. **ISSUE-103's copy-paste config is silently ignored**: the docs present
   `containerImagesMustBePinnedByDigest` as a top-level control key, but it is a nested
   sub-option of `containerImageMustNotUseForbiddenTags`; pasting the "good example" enables
   nothing.
7. **`/docs/use-plumber/register-templates` documents a retired product**: the whole `.r2.yml`
   manifest / "Import R2 templates" / `template_release` workflow was dropped in the rebuild;
   the current importer never reads those files. Includes a dead `r2devops.io/catalog/...` link.
8. **The Maintainer role in `/docs/use-plumber/roles-permissions` is not implemented**:
   `DeriveRole()` never returns it (its own code comment says Maintainer-gated routes are
   Admin-only "in the interim"), a real access-control surprise for a security product.
9. **Ten "Required" env vars on `/docs/installation/reference` have no effect** on Docker
   Compose installs: they are hardcoded literals in `compose.yml`'s `environment:` block,
   which overrides `.env`.
10. **The very first command a fresh install invites fails**: the Binary install tab has no
    verify step, and the conventional `plumber --version` exits 2 (`unknown flag`); the real
    command is `plumber version`, stated nowhere on the installation page.

## Findings

### Broken

- **https://getplumber.io/docs/cli/github**: The "All inputs" table documents the GitHub
  Action input `score` as defaulting to `true` ("The Plumber score is shown by default; set
  `false`..."), but the real `action.yml` default is `"false"` and its description says the
  opposite ("Off by default; set true to also include the per-issue-code breakdown"). The page
  even contradicts itself: its own "Customizing the action" example sets `score: "true"`,
  which only makes sense if the default is `false`. | Evidence: docs table row vs
  `getplumber/plumber` `action.yml` on `origin/main` (`default: "false"`, description "Off by
  default"); all other 23 documented inputs and all 3 outputs match exactly. | Fix: change the
  table default cell to `false` and reword the description to match `action.yml`.

- **https://getplumber.io/docs/cli/github**: The Tip "Pin by commit SHA... Copy the
  ready-to-paste SHA-pinned `uses:` line from the GitHub Action section of the README,
  auto-updated on new releases" is broken twice over. (1) The link targets
  `https://github.com/getplumber/plumber#option-3-github-action`, an anchor that does not
  exist: the README's only relevant heading is `## GitHub Action` (id
  `user-content-github-action`), so the click silently lands at the top of the README. (2) The
  README section itself contains `- uses: getplumber/plumber@<version>`, a literal
  placeholder, not a SHA-pinned line and not auto-updated; a user who trusts the pointer over
  the website's own (correct, v0.4.36-pinned) snippet ends up with a workflow that doesn't
  parse as a real action ref. | Evidence: `src/docs/data/docs/en/cli/github/index.mdx:75`
  (link target); `grep -n "^#" README.md` on `origin/main` → only `146:## GitHub Action`, no
  "Option 3" heading; live GitHub HTML contains `id="user-content-github-action"` and no
  `option-3-github-action`; `README.md:167` → `- uses: getplumber/plumber@<version>`. | Fix:
  repoint the link to `#github-action`, and either make the README actually carry a
  CI-updated SHA-pinned line or drop the claim and point users at the website snippet (which
  is already correct).

- **https://getplumber.io/docs/cli/installation**: The "Install a specific version" Homebrew
  snippet uses a formula name that does not exist: `brew install
  getplumber/plumber/plumber@v0.4.36` (and `brew link plumber@v0.4.36`); the real formula has
  no `v` prefix. Copy-pasting fails hard. | Evidence: ran live: `brew info
  getplumber/plumber/plumber@v0.4.36` → `Error: No available formula or cask... Did you mean
  getplumber/plumber/plumber@0.4.36`; the tap ships only `Formula/plumber@0.4.36.rb` (class
  `PlumberAT0436`), and the tap's own README uses the no-`v` form. Doc source:
  `src/docs/data/docs/en/cli/installation.mdx:39,43`. | Fix: drop the `v` in both the install
  and the `brew link` line (and the caption comment).

- **https://getplumber.io/docs/cli/github** and **https://getplumber.io/docs/cli/gitlab**:
  The "Silent Mode (JSON Only)" example on both pages uses `--print false`
  (space-separated), which does not suppress the report: `--print` is a boolean flag with
  `NoOptDefVal`, so a bare `--print` sets it `true` and the trailing `false` is swallowed as
  an unused positional. Copy-pasting the example still prints the full banner + report. |
  Evidence: ran the released v0.4.36 binary: `plumber analyze --print false --output
  /tmp/out2.json` printed the full banner/report (exit 0); `plumber analyze --print=false
  --output /tmp/out1.json` correctly printed only `Results written to: /tmp/out1.json`. Doc
  sources: `src/docs/data/docs/en/cli/github/index.mdx:317-323`,
  `src/docs/data/docs/en/cli/gitlab/index.mdx:351-360`. | Fix: change both examples to
  `--print=false` (and apply the `=` form anywhere a boolean flag is shown with a value).

- **https://getplumber.io/docs/cli/issues/ISSUE-103** (and its row in
  `/docs/cli/controls`): The "good example" `.plumber.yaml` uses
  `containerImagesMustBePinnedByDigest` as a standalone top-level control key; it is actually
  a boolean sub-option of the `containerImageMustNotUseForbiddenTags` control, so the pasted
  config is silently ignored (unknown top-level key) instead of enabling digest pinning. |
  Evidence: `src/data/issues.ts:1892,1918-1921,1924` (controlConfigKey, goodExample, tip) vs
  CLI ground truth: `control/codes.go` registry for ISSUE-103 → `ControlName:
  "containerImageMustNotUseForbiddenTags"`; `configuration/plumberconfig.go:28-30` schema
  `["enabled", "tags", "containerImagesMustBePinnedByDigest"]` (nested); the CLI's shipped
  `.plumber.yaml` shows the real nested shape. | Fix: set `controlConfigKey:
  "containerImageMustNotUseForbiddenTags"` and rewrite the goodExample to the nested form
  (`containerImageMustNotUseForbiddenTags: { enabled: true,
  containerImagesMustBePinnedByDigest: true }`).

- **https://getplumber.io/docs/installation/troubleshooting**: The "`Redirect URI Invalid`
  error in GitLab" entry links to `docker-compose/#-gitlab-oidc`, an anchor that no longer
  exists on the Docker Compose page (its heading was reworded to `#### Step 4: Configure
  GitLab OIDC`, id `step-4-configure-gitlab-oidc`); the click lands at the top of the page at
  exactly the moment a reader is mid-troubleshooting OIDC. The stale id matches the
  emoji-prefixed heading style still used on the Kubernetes/Podman pages, classic anchor
  drift, invisible to link checkers (the base URL returns 200). | Evidence:
  `src/docs/data/docs/en/installation/troubleshooting.mdx:22` vs
  `docker-compose.mdx:136`; live page HTML shows `id="step-4-configure-gitlab-oidc"` and no
  `-gitlab-oidc` id. | Fix: update the link to `docker-compose/#step-4-configure-gitlab-oidc`.

- **https://getplumber.io/docs/use-plumber/register-templates**: The entire page documents a
  retired workflow: per-template `.r2.yml` manifests, an "Import R2 templates" flow, and a
  `template_release` auto-versioning component, all explicitly dropped in the platform
  rebuild ("Everything hub-only is dropped"). The current importer ("Import CI/CD templates")
  imports a whole GitLab repo and reads metadata live via GraphQL; it never looks for a
  `.r2.yml`, so a reader who authors one gets nothing. The page also contains a dead link,
  `https://r2devops.io/catalog/gitlab/r2devops/hub/template_release` (301 → getplumber.io
  path that 404s), a symptom of the same rot. | Evidence:
  `monorepo/platform/frontend/docs/legacy-map/catalog.md` dropped-items list (`[-] .r2.yml
  file link`, `[-] R2-file sidebar/format docs`, ...);
  `monorepo/platform/frontend/src/app/(app)/catalog/import/import-view.tsx:360-417` (current
  flow, no manifest concept); live page still ships the stale content (`grep -c "R2 file"` →
  7); `curl -sL -w "%{http_code}"` on the template_release link → 404. | Fix: rewrite the
  page around the current "import a GitLab project" flow and delete (or clearly mark
  legacy/removed) the `.r2.yml` format, R2-import steps, and `template_release` sections.

- **https://getplumber.io/docs/ambassador-program** and
  **https://getplumber.io/docs/authentication/overview**: Both pages 404 live despite
  well-formed source files, for the same structural reason: `src/pages/docs/[...slug].astro`'s
  `getStaticPaths()` only builds routes whose first path segment matches a section id declared
  in `sidebarNavData.json.ts`, and neither `ambassador-program` nor `authentication` is
  declared anywhere, so no route is ever generated. Neither page is linked from anywhere else
  (`grep -rln` → no hits). The ambassador page's content is also stale pre-rebrand material:
  its "Find ambassador on r2devops.io/team" link 301s to `getplumber.io/team`, which 404s. |
  Evidence: `curl -s -o /dev/null -w "%{http_code}"` → `404` for both (site's own custom 404
  page); `sidebarNavData.json.ts` declares only `plumber-score`, `cli`, `getting-started`,
  `installation`, `use-plumber`; `curl -sL -w "%{http_code} %{url_effective}"
  https://r2devops.io/team` → `404 https://getplumber.io/team`. | Fix: delete both orphaned
  `.mdx` files (recommended, see also the Cosmetic finding on the authentication file's demo
  content), or wire them into a declared section if they are meant to ship.

- **https://getplumber.io/docs/** (site-wide): `<link rel=icon sizes=96x96
  href=/favicons/favicon-96x96.png>` 404s on every one of the 190 crawled docs pages. Impact
  is minor (browsers fall back to the SVG/ICO icons, which do exist), but it is a genuine 404
  asset reference on every page; ranked last within BROKEN because it sits in the page chrome,
  not on any reading path. | Evidence: linkinator crawl: 190/190 pages reference it, all 404;
  `curl -sI https://getplumber.io/favicons/favicon-96x96.png` → `HTTP/2 404`; the
  `/favicons/` directory serves `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`,
  `site.webmanifest` fine. | Fix: add the missing PNG to `/public/favicons/` or drop the
  stale `<link>` tag from the head partial.

### Misleading

- **https://getplumber.io/docs/cli/gitlab**: The GitLab CI component's "All inputs" table is
  missing the `glsast_file` input entirely (no table row, no example, zero page occurrences of
  "glsast" or "SAST"), even though it is a real, working input that writes a GitLab SAST
  report auto-uploaded via `artifacts:reports:sast` for the Security Dashboard / MR security
  widget, the same tier of feature as `pbom_cyclonedx_file`, which is documented right next
  to it. | Evidence: `getplumber/plumber/templates/plumber.yml` (`origin/main`) defines
  `glsast_file` wired through `PLUMBER_ANALYZE_GLSAST` and `artifacts.reports.sast`; the CLI
  documents the matching `--glsast` flag in `analyze --help`; live page text has zero
  occurrences. | Fix: add a `glsast_file` row (default `gl-sast-report.json`) and mention the
  Security Dashboard integration.

- **https://getplumber.io/docs/cli/gitlab**: The "All inputs" table lists the component's
  `image` default as `getplumber/plumber:0.1`; the real default is a digest-pinned image
  tracking the latest release. The `:0.1` string appears on the page only inside the stale
  MR-comment screenshot (as an example finding), suggesting the table was copied from that
  screenshot rather than the component source. | Evidence: `templates/plumber.yml`
  (`origin/main`, commit `77eb302`): `image: default:
  "getplumber/plumber@sha256:67693267c677...823bc4" #v0.4.36`. | Fix: state the real default
  ("digest-pinned image, updated each release") in the table row.

- **https://getplumber.io/docs/cli/gitlab**: The "Merge Request Comments" screenshot shows
  the old deprecated percentage/threshold comment format (badge "Plumber 71.4%", a
  "Compliance" column, "⚠ Compliance: 71.4% is below threshold (100%)"), while the adjacent
  Features list correctly describes the current letter-score (A–E) format. The "Project
  Badges" screenshot on the same page does show a letter grade, an internal inconsistency
  between two screenshots on one page. The feature itself is real
  (`gitlab/mrcomment.go` implements create/update). | Evidence: screenshot zoom at region
  (608,190)-(968,520) on the live page vs the Features bullets and the badge screenshot. |
  Fix: regenerate the MR-comment screenshot from a current build.

- **https://getplumber.io/docs/cli/reference**: The Exit Codes table says code `3` means "a
  check could not be verified and `--fail-warnings` is set", implying exit 3 requires
  `--fail-warnings`. In source, a degraded data-collection run (`dataCollectionDegraded`)
  unconditionally exits 3, before the gate, regardless of `--fail-warnings`. This also
  undercuts the page's own `dataCollectionDegraded` JSON-field description ("treat the run as
  suspect even if it passed its gate"): from the CLI's point of view a degraded run can never
  exit as passing. | Evidence: `cmd/analyze_shared.go:312-324` (`finalizeRun` checks
  `DataCollectionDegraded` first, unconditionally), `cmd/root.go:78-90` (both error types →
  exit 3). Doc text: `src/docs/data/docs/en/cli/reference/index.mdx:392,472`. | Fix: split
  the exit-3 row into the two real cases (degraded data → always 3; `--fail-warnings` +
  warnings → 3).

- **https://getplumber.io/docs/cli/issues/ISSUE-601** (and
  `/docs/use-plumber/issues/ISSUE-601`): The live ISSUE-601 page shows unrelated content
  ("Missing security policy source on project", a GitLab/Platform-only control), while the
  CLI's real ISSUE-601 is "Workflow has no explicit `name:` field"
  (`workflowsMustHaveExplicitName`), and the CLI's `DocURL` links straight to this wrong
  page. The correct content sits misfiled under ISSUE-422 with `status: "roadmap"`, which
  hides it from the controls table entirely, so the real control has no findable page at all.
  No entry in `issueCodeRedirects.ts` connects 601 ↔ 422, so this is an un-fixed mismatch,
  not a handled rename. | Evidence: CLI `control/codes.go:155-156,724-731` (ISSUE-601 =
  `workflowsMustHaveExplicitName`, DocURL → `/docs/cli/issues/ISSUE-601`);
  `policies/anonymous_definition.rego:19` emits `"ISSUE-601"`; site
  `src/data/issues.ts:1353-1390` files ISSUE-601 as the security-policy control and
  `:1392-1431` files the workflow-name content under ISSUE-422/roadmap;
  `ControlsTable.astro:52` excludes roadmap entries. | Fix: swap the two entries so ISSUE-601
  carries the workflow-name content (with its real bench/roadmap status), and give the
  security-policy control its own code (or confirm its live code with product).

- **https://getplumber.io/docs/installation/docker-compose-local** and
  **https://getplumber.io/docs/installation/docker-compose**: The docs say "Choose "Local""
  / "Choose "Production"" at the installer prompt, but `install.sh`'s `prompt_choice` only
  accepts a number: it prints a numbered menu ("1. Production... 2. Local...", "Choice
  (1-2):") and re-prompts with "Please enter a number between 1 and 2" on anything
  non-numeric, typing the documented word literally errors. | Evidence: `install.sh:108-129`
  (numeric-only validation `[[ "$CHOICE" =~ ^[0-9]+$ ]]`), `install.sh:194-196` (the
  Production/Local menu). | Fix: "Choose option 2, Local (localhost, no TLS)" / "Choose
  option 1, Production (domain, TLS, reverse proxy)".

- **https://getplumber.io/docs/installation/reference**: The reference table presents
  `JOBS_LISTEN_ADDR`, `JOBS_LISTEN_PORT`, `JOBS_SESSION_TTL`, `LOG_LEVEL`, `LOG_FORMATTER`,
  `JOBS_REDIS_HOST/PORT/DB/USER`, and `JOBS_REDIS_SET_NAMESPACES_TTL` as operator-configurable
  ("Required", with example values), but on both Docker Compose paths they are hardcoded
  literals in the `environment:` block of `compose.yml`/`compose.local.yml`, and Compose
  gives `environment:` precedence over `env_file: .env`, so setting them in `.env` silently
  does nothing. | Evidence: `platform/compose.local.yml:7-26`, `platform/compose.yml:9-32`
  (literal values, no `${VAR:-default}` interpolation, unlike the `JOBS_DB_*` vars nearby,
  which do interpolate and are genuinely settable). | Fix: mark these rows "fixed by the
  Docker Compose deployment" (or split the table by deployment method), or switch the compose
  files to `${VAR:-default}` interpolation so the table becomes true.

- **https://getplumber.io/docs/use-plumber/roles-permissions**: The page documents a 4-tier
  role model in which "Maintainer" is a distinct role granted via a Settings > Authorization
  allowlist with its own permission set. That tier is not implemented: `DeriveRole()` (the
  single authority on role status, whose doc comment cites this exact docs page) never
  returns `RoleMaintainer` and states "Maintainer (authorized-maintainer groups) is a
  follow-up, so Maintainer-gated routes are Admin-only in the interim". An operator who sets
  up the allowlist expecting scoped Maintainer access gets either full Admin or nothing, a
  real access-control surprise for a security product. | Evidence:
  `monorepo/platform/backend/rbac/roles.go:49-58` (unused `RoleMaintainer` enum),
  `:179-182` (doc comment, quoted), `:191-224` (implementation returns only
  `RoleOrgAdmin`/`RoleMember`/`RoleNone`); docs table at
  `src/docs/data/docs/en/use-plumber/roles-permissions.mdx:24-27,43-54`. | Fix: mark the
  Maintainer rows "planned, not yet available" until the authorized-maintainer-groups path
  ships.

### Friction

- **https://getplumber.io/docs/**: The docs root 308-redirects to `/docs/getting-started`,
  which renders as pure Platform content (Docker Compose/Kubernetes/Podman install cards)
  with the **Platform** tab pre-selected; nothing on the page mentions the CLI, GitHub
  Actions, or scanning a repo. A developer with the most common intent ("scan my repo") must
  notice the small 3-way sidebar toggle and consciously override the default before any
  relevant command appears, the first and largest decision point of the whole journey. |
  Evidence: live redirect + page text ("Plumber Platform... Quick Installation Guide");
  sidebar shows `Plumber Score / Open Source CLI / Platform` with Platform selected. | Fix:
  make the docs landing CLI-first (see "Proposed target IA" below), or at minimum add a "Just
  want to scan a repo? → Open Source CLI" callout above the fold.

- **https://getplumber.io/docs/getting-started**: The four Platform install options appear
  in three different orders across the Getting Started cards, the sidebar nav, and the
  Installation intro, and only the Installation intro marks a "(recommended)" default
  (Docker Compose). A first-timer on Getting Started alone has no signal which option is the
  general recommendation. | Evidence: card order = Docker Compose, Kubernetes, Docker Compose
  Local, Podman (no label); sidebar = Docker Compose, Docker Compose Local, Kubernetes,
  Podman; `/docs/installation` is the only surface with "recommended". | Fix: one consistent
  order everywhere + the "(recommended)" label on the cards.

- **https://getplumber.io/docs/cli** (docs search, site-wide): Searching `install` (the
  single most likely first query) returns 15 results in which the CLI installation page ranks
  3rd, sandwiched between near-identically-titled Platform results ("Installation
  Introduction", "Installation methods") and followed by 4+ more Platform-only hits, even
  when searching from a CLI page. | Evidence: search modal results for `install` on
  `/docs/cli/github`: `/docs/installation/` and `/docs/installation/#installation-methods`
  rank above `/docs/cli/installation/`. | Fix: scope/boost search by the section being
  browsed, and retitle the CLI page "CLI Installation" to disambiguate results.

- **https://getplumber.io/docs/cli/installation**: The Binary tab ends at `mv ...
  /usr/local/bin/plumber` with no verify step, and the conventional first command,
  `plumber --version`, fails hard (exit 2, `Error: unknown flag: --version`); the real
  command is the subcommand `plumber version`. | Evidence: ran the freshly downloaded
  v0.4.36 binary: `plumber --version` → exit 2; `plumber version` → exit 0, `plumber version
  0.4.36`; root `--help` lists no version flag. | Fix: add a one-line "Verify: `plumber
  version`" step to every install tab, and/or add a `--version` flag alias to the CLI.

- **https://getplumber.io/docs/cli/github**: The GitHub Actions workflow snippet renders
  (and copy-pastes, verified via the page's own copy button) `pull_request: null` instead of
  the conventional bare `pull_request:`. It is valid, functionally equivalent YAML, but it is
  not what any human writes, doesn't match the repo README's own example, and makes a
  first-timer pause to wonder whether "null" is a typo before trusting the paste. | Evidence:
  clipboard capture after the copy button: `on:\n  push:\n    branches: [main]\n
  pull_request: null`; `README.md:152-155` uses plain `pull_request:`. | Fix: fix the
  MDX/code-block source so an empty YAML mapping value renders and copies as a bare key.

- **https://getplumber.io/docs/cli/gitlab**: The page never says that the GitLab CI
  component's pinned commit SHAs (e.g. `bec6c5b3...` labeled `v0.4.36`) refer to
  `gitlab.com/getplumber/plumber`, a separate GitLab mirror with its own commit graph, not
  the GitHub repo, which is the only host the page names by link. A security-conscious reader
  who pin-verifies against GitHub (the reasonable, encouraged move before trusting a
  third-party CI component) finds the SHA missing and may conclude the pin is fabricated,
  exactly what happened mid-audit before the mirror was identified. | Evidence: GitHub clone:
  `git rev-list -n 1 v0.4.36` → `e81ed496...` (no `bec6c5b3...` anywhere); `git ls-remote
  https://gitlab.com/getplumber/plumber.git` → `bec6c5b3...` at `HEAD`/`main` (commit message
  `chore(release): v0.4.36` per GitLab API). The SHA is correct for the repo it refers to;
  the docs just never identify that repo. | Fix: add a one-line note by the first `include:
  component:` snippet naming the GitLab mirror and stating its SHAs are independent of the
  GitHub repo's.

- **https://getplumber.io/docs/cli/gitlab**: `--provider` (the flag that forces GitLab
  detection when the git remote doesn't match the intended CI provider: mirrors, migrations,
  multi-platform repos) is never mentioned on the page, zero hits for "provider", even
  though it is a real, working flag. A user in that situation has no documented escape hatch.
  (Caveat honored from the journey notes: auto-detection itself worked exactly as documented
  on the lab fixture; the gap is purely that the override flag is undiscoverable.) |
  Evidence: `analyze --help`: `--provider string  Force provider: 'github' or 'gitlab'
  (overrides auto-detection...)`; verified `plumber analyze --provider gitlab` forces the
  GitLab path (fails with the documented `GITLAB_TOKEN` error, exit 2, proving the flag
  works); live page text has zero occurrences. | Fix: document `--provider` alongside
  `--gitlab-url`/`--project` and add a Troubleshooting row for remote/provider mismatches.

- **https://getplumber.io/docs/cli/reference**: Every `analyze` flag has a matching
  `PLUMBER_ANALYZE_*` env-var override (~26 in total; e.g. `PLUMBER_ANALYZE_MIN_SCORE`,
  `PLUMBER_ANALYZE_OUTPUT`), the natural way to set flags from CI variables, but the
  "Environment variables" section lists only the four token/update vars. | Evidence: every
  flag line in `analyze --help` ends with `(env: PLUMBER_ANALYZE_<NAME>)`; doc section at
  `src/docs/data/docs/en/cli/reference/index.mdx:110-117` omits all of them. | Fix: add one
  line stating the `PLUMBER_ANALYZE_<FLAG>` convention (or the full mapping table).

- **https://getplumber.io/docs/cli/reference**: `plumber completion`
  (bash/fish/powershell/zsh) is a real top-level command mentioned nowhere across the four
  CLI docs pages, and `plumber version` is likewise absent from the Command Reference (only
  `analyze`, `config`, `explain` are documented). | Evidence: `plumber --help` lists
  `analyze, completion, config, explain, help, version`; `grep -rn "plumber completion"
  src/docs/data/docs/en/cli/` → nothing. | Fix: add a short "Shell completion" subsection and
  a one-line `plumber version` entry.

- **https://getplumber.io/docs/installation/docker-compose-local** (and
  `/docs/installation/docker-compose` Step 5): The documented secret-generation commands
  (`sed -i."" "s/^SECRET_KEY=.*/.../" .env`, ×3) work on both macOS and GNU sed but silently
  leave a stray backup file `.env.` (trailing dot) that is not covered by `.gitignore` (which
  ignores only `.env`), and because the three seds run sequentially, that backup can contain
  the real generated `SECRET_KEY` and/or `JOBS_DB_PASSWORD` in plaintext, sitting untracked
  in a security tool's own install directory. | Evidence: ran the exact command on macOS
  `/usr/bin/sed` and GNU `gsed` against a scratch copy; both produced the `.env.` backup
  with pre-edit content; `platform/.gitignore:1` is `.env` only. | Fix: use a backup-free
  portable form (platform-conditional `sed -i ''` / `sed -i`, or `perl -pi -e`), or add
  `.env.*` to `.gitignore` and tell users to delete the backup.

- **https://getplumber.io/docs/installation/reference**: The page claims to be the global
  configuration reference ("All configuration is managed through environment variables") but
  omits vars the install guides themselves tell the operator to set: `DOMAIN_NAME`,
  `COMPOSE_PROFILES`, `CERT_RESOLVER`, `FRONTEND_IMAGE_TAG`, `BACKEND_IMAGE_TAG`, plus
  `GITLEAKS_PATH` (hardcoded in every backend/worker block). | Evidence: `grep -n` matches in
  `platform/compose.yml` for all of them; none appear in the fetched reference page text,
  while `/docs/installation/docker-compose` Steps 3 and 6 explicitly instruct setting
  `DOMAIN_NAME`/`COMPOSE_PROFILES`/`CERT_RESOLVER` in `.env`. | Fix: add "Deployment Profile"
  and "Image Versions" sections to the reference (and document or explicitly fix-and-note
  `GITLEAKS_PATH`).

### Cosmetic

- **https://getplumber.io/docs/getting-started**: `src/docs/data/docs/en/getting-started/index.mdx`
  lines 25-35 carry a fully commented-out YouTube embed ("What we're building, and why it
  matters", iframe for `kjqPoTq8QAA`) that never renders, dead source content that will
  confuse the next editor and should not survive the page's rewrite. | Evidence: MDX comment
  block at lines 25-35 (`{/* ... <iframe ... youtube.com/embed/kjqPoTq8QAA ... */}`). | Fix:
  delete the commented block (or restore the section deliberately if the video is current).

- **https://getplumber.io/docs/cli/github**: The `min-points` input: `action.yml` declares a
  literal `default: ""` while the docs table says the default is `100`. Functionally the
  empty string falls through to the CLI's default gate of 100 points, and `action.yml`'s own
  description text says 100, so nothing misbehaves, but the two surfaces should state the
  same thing. | Evidence: `action.yml` `min-points: default: ""` (description mentions 100)
  vs the docs table default cell `100`. | Fix: harmonize: either set `default: "100"` in
  `action.yml` or footnote the docs cell ("empty = CLI default, 100").

- **https://getplumber.io/docs/authentication/overview** (repo hygiene: the page itself
  404s, see Broken; the issue lives in its source file
  `src/docs/data/docs/en/authentication/overview.mdx`): The file is starter-template
  scaffolding: its own banner reads "**Demo Page** -
  This is a demo page to showcase the multi-tab documentation feature", and the body is
  generic placeholder text (`api.example.com`, a fake JWT, made-up session claims) unrelated
  to Plumber. It sits in the real content tree where a future sidebar edit could accidentally
  ship fabricated API docs as real documentation. | Evidence: file lines 7-9 and body. | Fix:
  delete `src/docs/data/docs/en/authentication/` entirely.

## Blocked checks

Honest accounting of what could **not** be verified, and what was done instead:

- **GitLab journey: no live authenticated GitLab scan.** No `GITLAB_TOKEN` and no `glab` CLI
  existed in the audit environment, so a real GitLab-API scan, `plumber analyze --mr-comment`,
  and `plumber analyze --badge` were never executed against a live GitLab project.
  Compensating verification: `plumber analyze --provider gitlab` was run and produced exactly
  the documented error (`GITLAB_TOKEN environment variable is required for GitLab analysis`,
  exit 2), confirming the token requirement and the Troubleshooting row; `--gitlab-url`,
  `--project`, `--mr-comment`, `--badge`, `--ci-config-path`, `--controls`, `--skip-controls`
  all exist in `analyze --help` with matching descriptions; the MR-comment and badge code
  paths are real (`gitlab/mrcomment.go`, `gitlab/badge.go`).
- **Self-host journey: ~25 env vars on `/docs/installation/reference` are unverifiable.**
  The reference documents ~45 `JOBS_*` env vars, but the application code that parses them is
  not present in any accessible repo: `platform` contains deployment manifests only, and
  `monorepo`'s backend implements a different, `PLUMBER_*`-prefixed config surface (an
  in-progress rewrite; `grep -rn "JOBS_" --include='*.go'` → 0 hits). Only the vars that also
  appear in `compose.yml`/`compose.local.yml`/configmap examples could be cross-checked
  (findings above). The remaining ~25 (Analysis Configuration, Asset Sync, Security Scanning,
  Advanced/Timeouts, GitLab GraphQL/Sliding-Window rate limiting, Merged CI Cache) can be
  neither confirmed nor denied, names, defaults, and behavior are documented nowhere in
  available source.
- **Self-host journey: browser fallback.** The Chrome automation extension was unreachable
  for this journey (3 failed connection attempts), so the pages were audited via `curl -sL`
  (all HTTP 200) + HTML-to-text. The docs are server-rendered (Astro), so this reproduces
  what a visitor sees; anything dependent on client-side JS toggling could in principle have
  been missed on those pages only.
- Journeys 1 (GitHub) and the consistency/sweep tasks: nothing blocked, all checks ran
  against live systems (Homebrew, mise, Docker Hub, GitHub releases + attestation, GitLab
  component API, full-site linkinator crawl).

## Proposed target IA (CLI-first)

Product direction honored: a developer reaches their first Plumber Score in under 2 minutes
with **zero decisions**; the Platform is "go further"; complexity is opt-in. The redesign is
deliberately achieved by **re-mapping sections to tabs and rewriting two pages, not by mass
URL moves**, so nearly every existing URL (and all inbound links, and the CLI's hardcoded
`DocURL` base `/docs/cli/issues/`) keeps working. Only one URL moves.

### Sidebar/tab structure

`/docs` keeps redirecting to `/docs/getting-started`, but that page becomes the CLI
quickstart, and the **Open Source CLI tab becomes the default tab**.

```
Tab 1 - Open Source CLI                                        [DEFAULT tab (was: Platform)]
│
├─ Getting Started                       [MOVED section: Platform tab → this tab; URL unchanged]
│   └─ Get your first Plumber Score      /docs/getting-started          [REWRITTEN: flow below]
│
├─ CLI
│   ├─ Overview                          /docs/cli                      [kept]
│   ├─ CLI Installation                  /docs/cli/installation         [kept; retitled from
│   │                                    "Installation": disambiguates search results]
│   ├─ GitHub                            /docs/cli/github               [kept]
│   ├─ GitLab                            /docs/cli/gitlab               [kept]
│   ├─ Configuration                     /docs/cli/configuration        [NEW: the three config
│   │                                    modes + `plumber config` subcommands, extracted from
│   │                                    Reference so the quickstart can link "go further"
│   │                                    without sending beginners into the full reference]
│   └─ Reference                         /docs/cli/reference            [kept; gains the
│                                        PLUMBER_ANALYZE_* env table, completion/version,
│                                        corrected exit-code 3 row]
│
└─ Controls & Issues
    ├─ Controls catalog                  /docs/cli/controls             [MOVED from
    │                                    /docs/use-plumber/controls: the catalog documents the
    │                                    CLI's rule set and the CLI's own DocURLs already live
    │                                    under /docs/cli/issues/; redirect below]
    └─ ISSUE-XXX detail pages            /docs/cli/issues/*             [kept: already the
                                         CLI's DocURL target]

Tab 2 - Plumber Score                                          [kept as-is]
└─ Plumber Score                         /docs/plumber-score            [kept]

Tab 3 - Platform  ("Go further: continuous monitoring, dashboards, team workflows")
│
├─ Installation
│   ├─ Introduction                      /docs/installation             [kept; absorbs the
│   │                                    platform-value pitch + Quick Installation cards
│   │                                    currently on /docs/getting-started, with ONE
│   │                                    consistent card order and the "(recommended)" label]
│   ├─ Docker Compose                    /docs/installation/docker-compose        [kept]
│   ├─ Docker Compose Local              /docs/installation/docker-compose-local  [kept]
│   ├─ Kubernetes                        /docs/installation/kubernetes            [kept]
│   ├─ Podman                            /docs/installation/podman                [kept]
│   ├─ Configuration Reference           /docs/installation/reference   [kept; split by
│   │                                    deployment method per the Misleading finding]
│   └─ Troubleshooting                   /docs/installation/troubleshooting       [kept]
│
└─ Use Plumber
    ├─ Issues lifecycle                  /docs/use-plumber/issues            [kept: platform
    │                                    workflow (Detected → In progress → Fixed), not CLI]
    ├─ Roles & Permissions               /docs/use-plumber/roles-permissions [kept; Maintainer
    │                                    rows marked "planned"]
    └─ Import CI/CD templates            /docs/use-plumber/register-templates [REWRITTEN:
                                         current import flow; .r2.yml/R2/template_release
                                         sections deleted]

Deleted source files (both 404 today, never routed, so no redirects needed):
    src/docs/data/docs/en/ambassador-program.mdx                 [DELETED: orphan, stale]
    src/docs/data/docs/en/authentication/overview.mdx            [DELETED: demo scaffold]
```

In `sidebarNavData.json.ts` terms: move the `getting-started` section object from the `main`
(Platform) tab into the `api` (Open Source CLI) tab as its first section, make that tab the
default, replace the CLI tab's `navLinks` (`/docs/use-plumber/controls|issues`) with the real
`cli/controls` page and a link to `/docs/use-plumber/issues`, and leave `installation` +
`use-plumber` under Platform.

### New getting-started flow

`/docs/getting-started`, rewritten. Three copy-paste blocks, zero decisions: install method is
pre-picked per OS via tabs (both tabs carry the same verified Homebrew command; Homebrew is
the docs' current first-listed method and supports both OSes), and the analyze command is
pre-filled (provider auto-detection means the user chooses nothing). **Every command below was
executed successfully during the audit journeys** (provenance in parentheses; nothing here is
aspirational).

---

**1. Install**: tabs: `macOS` (default on macOS) | `Linux`; both render:

```bash
brew tap getplumber/plumber
brew install plumber
```

*(Executed in Journey 1: tapped cleanly, installed `plumber 0.4.36` to
`/opt/homebrew/bin/plumber`.)* Small link under the block: "No Homebrew? All install
methods →" `/docs/cli/installation`.

**2. Verify:**

```bash
plumber version
```

Expected output (shown in the docs as a static sample):

```text
plumber version 0.4.36
```

*(Executed in Task 1 and Journey 1: exit 0, exactly this output. Deliberately `plumber
version`, not `plumber --version`, which fails; see Friction findings.)*

**3. Get your first score**: run from any repo that has GitHub Actions workflows or a
`.gitlab-ci.yml`:

```bash
cd path/to/your/repo
plumber analyze
```

*(Executed in Journeys 1 and 2: provider auto-detected from the git remote, controls
evaluated, score banner printed (e.g. `Score: E — 30/100 pts`), with exit 0 = passed,
1 = score gate failed, 2 = runtime error.)*

One informational callout, not a decision: *"GitHub repo? If you're logged in with the `gh`
CLI, authentication is automatic (verified: `plumber analyze` discovered the `gh` login with
no setup). Otherwise set `GH_TOKEN`. GitLab repo? Set `GITLAB_TOKEN`."*, with a link to the
provider pages for details.

---

Below the flow, a **"Go further"** card row (links only, no commands: this is where
complexity becomes opt-in):

- **Gate your CI**: add Plumber to GitHub Actions → `/docs/cli/github` · or the GitLab CI
  component → `/docs/cli/gitlab`
- **Understand your score** → `/docs/plumber-score`
- **Tune the controls** → `/docs/cli/configuration` (config modes, `.plumber.yaml`)
- **See every control** → `/docs/cli/controls`
- **Monitor continuously with the Platform** (self-hosted dashboards, issue lifecycle,
  team roles) → `/docs/installation`

Commands deliberately **excluded** from the flow because the audit proved them broken or
never executed them: `plumber --version` (fails, exit 2), `--print false` (silent no-op),
`brew install .../plumber@v0.4.36` (formula doesn't exist), `gh auth login` (not executed
this audit, mentioned in prose only, never as a copy-paste block), Docker/mise/binary
install variants (verified available in Task 6, but they belong on `/docs/cli/installation`,
not in the zero-decision path).

### Redirects

Only one URL moves (`/docs/use-plumber/controls` → `/docs/cli/controls`); everything else is
re-tabbed or rewritten in place, and the two deleted pages already 404 (no routes were ever
generated for them), so they need no redirects. Rows are formatted for the existing
`redirects` array in `vercel.json` (same shape as the current `/docs/cli/gitlab-component`
entries, which also list the trailing-slash variant explicitly to avoid a redirect chain
through the global `/:path+/` rule):

| Old URL | New URL |
| --- | --- |
| `/docs/use-plumber/controls` | `/docs/cli/controls` |
| `/docs/use-plumber/controls/` | `/docs/cli/controls` |

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

The existing `/docs` → `/docs/getting-started` redirects in `vercel.json` are kept unchanged:
the URL now lands on the CLI quickstart, which is the point.
