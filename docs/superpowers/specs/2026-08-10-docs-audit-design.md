# Docs Audit: Developer POV + Product Consistency - Design

**Date:** 2026-08-10
**Status:** Approved
**Scope:** Phase 1: audit report only. Phase 2 (implementing fixes) is a separate project, scoped from the report.

## Context

getplumber.io/docs currently has three tabs (Plumber Score, Open Source CLI, Platform).
"Getting Started" lives under the Platform tab and immediately presents four self-hosted
installation options. The product direction for docs is: a developer must be able to get
value by dumbly copy-pasting, with complexity available but opt-in.

Decisions made during brainstorming:

- **Entry path:** CLI-first. The default getting-started path is the open-source CLI
  (install + `plumber analyze`); the Platform is the "go further" step.
- **Deliverable:** audit report first; the user reviews it and picks fixes for phase 2.
- **Verification depth:** execute every copy-paste CLI command against the latest released
  binary; cross-check Platform docs against local source without deploying.
- **Site review:** browse the deployed site in Chrome, not just the MDX source.
- **Restructure appetite:** full IA restructure is allowed (moved/renamed pages and tabs,
  with redirects).

## Goal and success criteria

Produce one audit report answering three questions:

- **Friction:** where does a first-time developer have to think, guess, or backtrack
  instead of copy-pasting?
- **Truth:** where do the docs disagree with the actual product (commands, flags, outputs,
  versions, features, screenshots)?
- **Structure:** what should the docs look like so the default path is CLI-first and
  ultra-simple, with complexity opt-in?

Benchmark the audit measures against: *a developer who lands on /docs can get their first
Plumber Score on their own repo in under 2 minutes, making zero decisions along the way
that are not pre-made for them.*

## Method

### 1. Journey pass (live site + real execution)

Three personas, each walked on https://getplumber.io/docs/ in Chrome, with every command
actually executed in a terminal:

1. **GitHub developer**: lands on /docs, wants to scan their repo's Actions workflows.
   Follows whatever the site points them to, installs the CLI for real (brew/curl, latest
   release), runs `plumber analyze`, tries the GitHub Action snippet.
2. **GitLab developer**: same for GitLab CI: CLI locally plus the CI component snippet.
3. **Self-hoster**: evaluates the Platform: reads Getting Started and the Docker Compose
   guides. Commands are read-verified against the platform/monorepo source, not deployed.

Recorded per journey: every click, every decision point, every copy-paste that is not
literally paste-and-run, every failure. Navigation UX (tab structure, search, cross-links,
broken links) is noted along the way.

### 2. Consistency pass (source diff)

Systematic cross-check of docs claims against the local repos:

- **CLI commands and flags** vs the `plumber` repo: `--help` output of the released
  binary, `cmd/` source, exit codes, config modes.
- **Controls catalog** in docs (`use-plumber/controls`, `src/data/issues.ts`) vs the
  `control/` and `policies/` directories in the CLI repo.
- **Versions** pinned in docs snippets vs the latest GitHub release.
- **Install methods** in docs vs what actually exists: homebrew-plumber tap, install
  script, Docker image, GitHub Action `action.yml`, GitLab CI component.
- **Platform pages** (installation guides, env-var reference, roles/permissions,
  register-templates, authentication) vs `platform`/`monorepo` source.

### 3. Completeness sweep

Every docs page not already covered by the two passes gets a page-level check (accuracy,
clarity, dead content, e.g. the commented-out YouTube embed, the ambassador-program page,
the plumber-score page) so nothing escapes.

## Report format

One markdown file: `docs/superpowers/audits/2026-08-10-docs-audit.md`, optionally
published as a private artifact page for comfortable reading.

Structure:

- **TL;DR**: top 10 issues.
- **Findings** ranked by severity:
  1. **Broken**: copy-paste fails, wrong info, dead link.
  2. **Misleading**: works, but the docs say otherwise.
  3. **Friction**: works, but requires thinking or guessing.
  4. **Cosmetic**: style, tone, polish.

  Each finding: page URL, what is wrong, evidence (command output or source reference),
  proposed fix.
- **Proposed target IA**: concrete sidebar/tab structure for the CLI-first restructure,
  the new getting-started flow sketched with exact copy-paste blocks, and the redirect
  list for moved URLs.

## Out of scope

- Implementing any docs change (phase 2, scoped from the approved report).
- Deploying the Platform end-to-end to verify installation guides.
- Non-English locales (only `en` exists today).
