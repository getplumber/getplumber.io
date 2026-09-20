# Single-Sidebar Docs Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development (single task).

**Goal:** Collapse the three docs tabs (Open Source CLI / Plumber Score / Platform) into one sidebar with grouped sections, keeping every public URL stable.

**Architecture:** One tab (keeping id `api` so the controls/issues alias generation keeps working) holding all sections in order; the tab switcher hides itself when only one tab exists; the shared-content URL rewriting helpers narrow to controls/issues so pages that merely share the tab are not rewritten to nonexistent `/docs/cli/*` routes.

**Tech Stack:** Astro docs config (`sidebarNavData.json.ts`), `docsUtils.ts` helpers, sidebar components.

## Global Constraints

- Branch `docs/audit-fixes`. Conventional commit, no AI trailer. No em dashes in prose.
- No public URL may change; no new redirects.
- Build must pass (`nvm use 22`); output in `dist/client/`.

---

### Task 1: Merge tabs into one sidebar

**Files:**
- Modify: `src/docs/config/en/sidebarNavData.json.ts`
- Modify: `src/docs/js/docsUtils.ts` (`contentIdToTabSlug`, `resolveSharedDocsHref`)
- Modify: the component rendering the tab switcher (locate from `DocsLayout.astro`; hide when `tabs.length === 1`)
- Modify: `src/docs/data/docs/en/use-plumber/issues.mdx` (frontmatter: `sidebar.hidden: true`)

**Interfaces:**
- Produces: single-tab sidebar; `/docs/cli/controls` and `/docs/cli/issues*` alias routes still generated; platform pages keep `/docs/use-plumber/*` URLs in sidebar links.

- [ ] **Step 1: Single tab in `sidebarNavData.json.ts`**

Replace the three tabs with ONE tab: `id: "api"`, `title: "Documentation"`, sections in this order:
1. `getting-started` (title "Getting Started")
2. `cli` (title "CLI", keep the existing `navLinks` EXACTLY: Controls `/docs/use-plumber/controls`, Issues `/docs/use-plumber/issues` indented; they drive alias-route generation in `[...slug].astro:85-104`)
3. `plumber-score` (title "Plumber Score")
4. `installation` (title "Platform: Installation")
5. `use-plumber` (title "Platform: Usage")

- [ ] **Step 2: Narrow the shared-content rewriting in `docsUtils.ts`**

`contentIdToTabSlug` and `resolveSharedDocsHref` currently rewrite EVERY `use-plumber/*` id/href to `cli/*` on the `api` tab. With all sections on that tab this would generate sidebar links to nonexistent routes (`/docs/cli/roles-permissions`). Narrow both to the same set `getCanonicalDocsPathname` already uses: `controls`, `issues`, `issues/*`. Check `sitemapUtils.ts` and `getDocsBreadcrumbs` still behave (they call these helpers).

- [ ] **Step 3: Hide the tab switcher when only one tab exists**

Locate the toggle component from `DocsLayout.astro` (renders the tab list, `aria-label="Documentation Sections"` per earlier review). Render it only when `tabs.length > 1`.

- [ ] **Step 4: De-duplicate the Issues entry**

`use-plumber/issues.mdx` would appear twice (as a `cli` navLink and in the `use-plumber` folder listing). Add `hidden: true` under its `sidebar:` frontmatter so only the navLink renders. `roles-permissions` and `register-templates` remain the visible "Platform: Usage" entries (`controls.mdx` is already hidden).

- [ ] **Step 5: Build and verify**

```bash
nvm use 22 && npm run build
test -f dist/client/docs/cli/controls/index.html
test -f dist/client/docs/use-plumber/roles-permissions/index.html
grep -c "cli/roles-permissions" dist/client/docs/getting-started/index.html   # 0
grep -c "Platform: Installation" dist/client/docs/getting-started/index.html  # >=1
```

Also verify in the built getting-started HTML: no tab-switcher markup, exactly one "Issues" sidebar entry, sections in the specified order.

- [ ] **Step 6: Commit**

`feat(docs): merge docs tabs into a single grouped sidebar` (temporary commit; the controller folds it into the branch's restructure commit).
