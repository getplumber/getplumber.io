# CLAUDE.md

Guidance for AI assistants (Claude Code, Cursor, etc.) working in this repository.

## Git commits

- **Never mention Claude (or any AI assistant) as author or co-author of commits.** No
  `Co-Authored-By: Claude ...` trailers, no "Generated with Claude Code" lines. Commits are
  authored by the human committer only.
- Follow conventional commits (`feat:`, `fix:`, `chore:`, ...) — they drive semantic-release
  (see `.releaserc.json`).

## Updating packages and resolving CVEs

CI (GitHub Actions `setup-node` with Node 22, and Vercel) runs **npm 10**. npm 11 writes
lockfiles that omit transitive dependencies of platform-specific optional packages that are not
installed locally (e.g. `@img/sharp-wasm32` → `@emnapi/runtime`/`core`/`wasi-threads`). npm 10
rejects such a lockfile and `npm ci` fails with `EUSAGE ... Missing: <pkg> from lock file`.

Rules:

1. **Never commit a `package-lock.json` written by npm 11+.** Plain `npm install` with a newer
   local npm silently rewrites (and breaks) the lockfile.
2. **To update or regenerate the lockfile**, resolve from the registry with npm 10 and with no
   `node_modules` in sight — if `node_modules` (or the hidden `node_modules/.package-lock.json`)
   exists, npm reconstructs the lock from the local single-platform tree instead of the registry.
   Safest recipe:

   ```bash
   mkdir /tmp/lockgen && cp package.json /tmp/lockgen && cd /tmp/lockgen
   npx -y npm@10 install --package-lock-only
   cp package-lock.json <repo>/package-lock.json
   ```

3. **To resolve CVEs** (`npm audit`):
   - Prefer bumping the existing `overrides` entries in `package.json` to the patched versions;
     add a new override only when a transitive dependency cannot be fixed by updating a direct one.
   - Keep direct dependencies at their latest versions and adapt to breaking changes.
   - Dependencies **bundled** inside another package (notably the `npm` package) cannot be fixed
     by overrides. That is why `@semantic-release/npm` is stubbed with `@semantic-release/error`
     (this site never publishes to npm and the plugin is not in `.releaserc.json` — see the `//`
     note in `package.json`).
4. **Validate before committing** (all enforced by CI):

   ```bash
   npx -y npm@10 ci --dry-run          # lockfile in sync for CI's npm
   npm audit --audit-level=moderate    # full tree (security.yml)
   npm audit --omit=dev --audit-level=high
   npm run lint
   npm run build
   ```
