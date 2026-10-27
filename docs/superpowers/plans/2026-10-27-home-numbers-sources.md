# Home page numbers: where each figure will come from

Status: plan only (review of 2026-10-27). Today every figure on the home page is a string in
`src/config/en/homeData.json.ts`. The "leaks found" placeholder `[N]` became `250k+` in the
same review. This note lists, per figure, the source to query and how it reaches the page.

## Figures and sources

| Section | Figure | Source to query | Refresh |
|---|---|---|---|
| Proof strip | open-source projects graded A or B | Plumber Radar database: `SELECT count(*) FROM projects WHERE grade IN ('A','B') AND visibility = 'public'` | each Radar scan |
| Proof strip | open-source downloads | GitHub Releases API for `getplumber/plumber` (`assets[].download_count` summed over releases) plus the Homebrew tap analytics (`https://formulae.brew.sh/api/analytics/install/30d.json` is for core only, so the tap total comes from `brew` download counts on GitHub Releases) | daily |
| Proof strip | public projects graded | Radar database: `SELECT count(*) FROM projects WHERE visibility = 'public'` | each Radar scan |
| Proof strip | leaks found | Radar database: count of findings with a secret category (`issue_code LIKE 'ISSUE-1%'` family, see `src/data/issues.ts` for the exact codes) | each Radar scan |
| Coverage row | GitHub + GitLab | static (product fact) | none |
| Attackers stats | 2x, 48.8% | GitGuardian State of Secrets Sprawl 2026 (static citation, update yearly) | yearly |
| Incident log | 52% of 104,500 projects | Radar database, same scan that feeds the Proof strip | each Radar scan |
| Incident log | other rows | static citations with their source links | when a new incident is added |

## How the numbers reach the page

1. A small script, `scripts/fetch-home-numbers.mjs`, runs in CI before `astro build`
   (and on a daily schedule via GitHub Actions). It queries the sources above and writes
   `src/config/en/homeNumbers.json` with one key per figure plus a `fetchedAt` date.
2. `homeData.json.ts` reads that file and falls back to the current hard-coded strings when
   a key is missing, so a failed fetch never breaks the build or shows an empty figure.
3. Formatting lives in one helper (`formatFigure`): `16644` becomes `16,644`, `250412`
   becomes `250k+`, downloads round down to the nearest thousand with a `+`.
4. The Radar queries need a read-only database role and a `RADAR_DATABASE_URL` secret in
   the GitHub repository; the GitHub API calls use the default `GITHUB_TOKEN`.
5. Vercel deploys already rebuild on push; the scheduled workflow commits the refreshed
   `homeNumbers.json` so a deploy follows automatically.

## Open questions

- Whether "leaks found" counts findings or distinct secrets (the Radar schema has both).
- Whether the Homebrew numbers should count at all, since brew installs come from GitHub
  Releases downloads and would be counted twice.
