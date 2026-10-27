# Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the getplumber.io home page from the Figma frame `HOME_Last` and roll the new tokens, Navbar and Footer out site-wide, per `docs/superpowers/specs/2026-10-26-landing-redesign-design.md`.

**Architecture:** Astro components, one per Figma section, under `src/components/Home/`, fed by one typed data file. Theme tokens live in Tailwind v4 `@theme` CSS; semantic light/dark variables in `global.css`. Two on-demand API routes email form submissions through Resend.

**Tech Stack:** Astro 7.3, Tailwind v4 (`@tailwindcss/vite`, CSS `@theme`), Starwind accordion, `@fontsource-variable/geist-mono`, Resend HTTP API, Vercel adapter.

## Global Constraints

- Branch `feat/landing-redesign-2026`. The working tree holds unrelated staged files (`src/assets/customers/outscale-logo.png`, `src/assets/customers/telstra-logo.svg`, modified `src/components/LogoCloud/LogoCloud2.astro`). Never run `git add -A`, `git add .` or `git commit -a`. Commit with `git add <paths> && git commit --only -m "..." -- <paths>`.
- Conventional commits; no AI co-author trailers (repo `CLAUDE.md`).
- No em dashes in any user-facing copy (`.cursor/rules/no-em-dashes.mdc`).
- Local npm is 11; CI is npm 10. Never commit a lockfile written by npm 11. Regenerate with `npx -y npm@10 install --package-lock-only` in a directory holding only `package.json` (repo `CLAUDE.md`).
- Figma file `OEp1QcJ16wgu5JP7ZbfRJh`, remote connector session `9bfee17b-0d64-49ef-b69d-8dde36bf1247`. Budget: about 11 `get_design_context` calls for the whole plan. Always pass `skillNames: "resource:figma-design-to-code"`, `clientFrameworks: "astro"`, `clientLanguages: "html,css,typescript"`. Use Chrome (tab on the Figma file) for anything else.
- Dev server: `preview_start {name: "astro-dev"}` (port 4400); check pages in Chrome, never the Browser pane.
- Checks that must pass before every commit: `npx eslint <changed files>`; before the final commit: `npm run lint`, `npm run build`.
- Figma colors are the truth for dark mode. Light mode values come from spec section 4.4.

## File structure

Create:

- `src/assets/fonts/haxrcorp-4089/haxrcorp-4089.otf`, `license.txt`, `readme.txt`
- `src/config/en/homeData.json.ts` (all home copy, lists, links)
- `src/components/Home/Hero.astro`, `PixelAnimation.astro`, `ValueProp.astro`, `AttackersWalkIn.astro`, `IncidentLog.astro`, `HowItWorks.astro`, `OneProduct.astro`, `Proof.astro`, `Faq.astro`, `BookDemo.astro`, `SectionHeading.astro`
- `src/lib/formMail.ts` (validation, rate limit, Resend send)
- `src/pages/api/demo.ts`, `src/pages/api/newsletter.ts`
- `src/js/forms.ts` (client submit handler)
- `.env.example`

Modify:

- `package.json` (+ `@fontsource-variable/geist-mono`), `package-lock.json` (npm 10)
- `src/styles/fonts.css`, `src/styles/tailwind-theme.css`, `src/styles/global.css`, `src/styles/buttons.css`
- `src/components/Button/Button.astro`
- `src/config/types/configDataTypes.ts`, `src/config/en/navData.json.ts`, `src/config/en/faqData.json.ts`, `src/config/en/siteData.json.ts`
- `src/components/Nav/Nav.astro`, `NavLink.astro`, `MobileNav/MobileNav.astro`
- `src/components/Footer/Footer.astro`, `FooterLink.astro`
- `src/components/Testimonials/TestimonialCard.astro`
- `src/pages/index.astro`, `src/pages/llms.txt.ts`, `src/components/Seo/SoftwareAppJsonLd.astro`

Delete (Task 15): see spec section 10.

---

### Task 1: Fonts and the Geist Mono dependency

**Files:**
- Create: `src/assets/fonts/haxrcorp-4089/haxrcorp-4089.otf`, `license.txt`, `readme.txt` (copied from the extracted zip in the session scratchpad `font-haxrcorp/`)
- Modify: `package.json`, `package-lock.json`, `src/styles/fonts.css`

**Interfaces:**
- Produces: font families `"HaxrCorp 4089"` and `"Geist Mono Variable"` available to CSS.

- [ ] **Step 1: Copy the font files**

```bash
mkdir -p src/assets/fonts/haxrcorp-4089
cp "<scratchpad>/font-haxrcorp/haxrcorp-4089.otf" "<scratchpad>/font-haxrcorp/license.txt" "<scratchpad>/font-haxrcorp/readme.txt" src/assets/fonts/haxrcorp-4089/
```

- [ ] **Step 2: Add the dependency to package.json by hand**

In `dependencies`, after `"@fontsource/inter": "5.3.0",` add `"@fontsource-variable/geist-mono": "5.3.0",`. Keep alphabetical order (fontsource-variable entries sort before fontsource).

- [ ] **Step 3: Regenerate the lockfile with npm 10**

```bash
mkdir -p "<scratchpad>/lockgen" && cp package.json "<scratchpad>/lockgen/" && cd "<scratchpad>/lockgen" && npx -y npm@10 install --package-lock-only && cp package-lock.json <repo>/package-lock.json
```

Then in the repo: `npx -y npm@10 install --no-audit --no-fund` (npm 10 honours the lock) and `npx -y npm@10 ci --dry-run` must print no `Missing:` lines.

- [ ] **Step 4: Declare the faces in fonts.css**

Append to `src/styles/fonts.css`:

```css
/* geist-mono-latin-wght-normal (variable) */
@font-face {
  font-family: "Geist Mono Variable";
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url(@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2)
    format("woff2-variations");
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329,
    U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* HaxrCorp 4089 pixel font, CC BY-SA 3.0, see src/assets/fonts/haxrcorp-4089/license.txt */
@font-face {
  font-family: "HaxrCorp 4089";
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url(@/assets/fonts/haxrcorp-4089/haxrcorp-4089.otf) format("opentype");
}
```

- [ ] **Step 5: Verify the files resolve**

Run: `npx astro build 2>&1 | tail -5` is too slow here; instead start `astro-dev` and open `http://localhost:4400/` in Chrome, then in the console run `document.fonts.load('22px "HaxrCorp 4089"').then(f => f.length)` and expect `1`. Same for `"Geist Mono Variable"`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/styles/fonts.css src/assets/fonts/haxrcorp-4089
git commit --only -m "feat(theme): self-host HaxrCorp 4089 and add Geist Mono" -- package.json package-lock.json src/styles/fonts.css src/assets/fonts/haxrcorp-4089
```

---

### Task 2: Theme tokens, semantic variables, type scale

**Files:**
- Modify: `src/styles/tailwind-theme.css:6-51`, `src/styles/global.css:26-218`

**Interfaces:**
- Produces: Tailwind color utilities `primary-*`, `base-*`, `danger-*`, `ink-*`; CSS vars `--font-pixel`, `--space-*`, `--radius-0/4/8/15`; classes `.h1 .h2 .h3 .body-xl .body-lg .body .body-sm .body-xs .subtitle .eyebrow .subtitle-pixel .code .home-container .card-tint .card-tint-hover .stroke-tint`.

- [ ] **Step 1: Replace the color scales in tailwind-theme.css**

Replace lines 7-32 with:

```css
  /* primary: Figma accent blue #09c3c3 */
  --color-primary-50: #e6fafa;
  --color-primary-100: #c9f5f5;
  --color-primary-200: #9cf3f3;
  --color-primary-300: #5fe3e3;
  --color-primary-400: #09c3c3;
  --color-primary-500: #09c3c3;
  --color-primary-600: #079d9d;
  --color-primary-700: #067c7c;
  --color-primary-800: #005d5d;
  --color-primary-900: #004242;
  --color-primary-950: #002a2a;

  /* base: Figma neutrals */
  --color-base-50: #f2f3f3;
  --color-base-100: #e6e8e8;
  --color-base-200: #c6c6c6;
  --color-base-300: #a3a9a9;
  --color-base-400: #8d9596;
  --color-base-500: #6f7676;
  --color-base-600: #5c6262;
  --color-base-700: #3a3e3e;
  --color-base-800: #1f2222;
  --color-base-900: #141616;
  --color-base-950: #0c0c0c;

  /* danger: Figma reds */
  --color-danger-500: #fb3033;
  --color-danger-300: #e89496;
  --color-danger-400: #ff6b5e;

  /* Figma tints (alpha over any background) */
  --color-tint-5: rgba(92, 98, 98, 0.05);
  --color-tint-10: rgba(92, 98, 98, 0.1);
  --color-tint-25: rgba(92, 98, 98, 0.25);
  --color-accent-20: rgba(9, 195, 195, 0.2);
  --color-danger-5: rgba(251, 48, 51, 0.05);
  --color-danger-10: rgba(251, 48, 51, 0.1);
  --color-danger-25: rgba(251, 48, 51, 0.25);

  /* spacing scale from Figma */
  --spacing-s8: 8px;
  --spacing-s14: 14px;
  --spacing-s16: 16px;
  --spacing-s20: 20px;
  --spacing-s24: 24px;
  --spacing-s32: 32px;
  --spacing-s40: 40px;
  --spacing-s48: 48px;
  --spacing-s60: 60px;
  --spacing-s64: 64px;
  --spacing-s88: 88px;
  --spacing-s208: 208px;

  /* radius scale from Figma */
  --radius-r0: 0px;
  --radius-r4: 4px;
  --radius-r8: 8px;
  --radius-r15: 15px;
```

Replace the font block (lines 42-51) with:

```css
  --font-fallback:
    "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif",
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  --font-heading: "InterVariable", "Inter", var(--font-fallback);
  --font-sans: "InterVariable", "Inter", var(--font-fallback);
  --font-mono: "Geist Mono Variable", "SFMono-Regular", "Menlo", "Consolas", "monospace";
  --font-pixel: "HaxrCorp 4089", "Geist Mono Variable", "monospace";
```

- [ ] **Step 2: Re-point the semantic variables in global.css**

Replace the `:root` block values (lines 29-55) with:

```css
    --background: var(--color-base-50);
    --foreground: var(--color-base-950);
    --card: var(--color-tint-5);
    --card-foreground: var(--color-base-950);
    --popover: var(--color-base-50);
    --popover-foreground: var(--color-base-950);
    --primary: var(--color-primary-800);
    --primary-foreground: var(--color-base-50);
    --secondary: var(--color-base-600);
    --secondary-foreground: var(--color-base-50);
    --muted: var(--color-tint-5);
    --muted-foreground: var(--color-base-600);
    --accent: var(--color-tint-10);
    --accent-foreground: var(--color-base-950);
    --info: var(--color-sky-300);
    --info-foreground: var(--color-sky-950);
    --success: var(--color-primary-200);
    --success-foreground: var(--color-primary-950);
    --warning: var(--color-amber-300);
    --warning-foreground: var(--color-amber-950);
    --error: var(--color-danger-500);
    --error-foreground: var(--color-base-50);
    --border: var(--color-tint-25);
    --input: var(--color-base-50);
    --outline: var(--color-base-950);
    --accent-text: var(--color-primary-800);

    --radius: 0.25rem;
```

Replace the `.dark` block values (lines 91-115) with:

```css
    --background: var(--color-base-950);
    --foreground: var(--color-base-50);
    --card: var(--color-tint-5);
    --card-foreground: var(--color-base-50);
    --popover: var(--color-base-900);
    --popover-foreground: var(--color-base-50);
    --primary: var(--color-primary-500);
    --primary-foreground: var(--color-base-950);
    --secondary: var(--color-base-200);
    --secondary-foreground: var(--color-base-950);
    --muted: var(--color-tint-5);
    --muted-foreground: var(--color-base-400);
    --accent: var(--color-tint-10);
    --accent-foreground: var(--color-base-50);
    --info: var(--color-sky-300);
    --info-foreground: var(--color-sky-950);
    --success: var(--color-primary-200);
    --success-foreground: var(--color-primary-950);
    --warning: var(--color-amber-300);
    --warning-foreground: var(--color-amber-950);
    --error: var(--color-danger-500);
    --error-foreground: var(--color-base-50);
    --border: var(--color-tint-25);
    --input: var(--color-base-950);
    --outline: var(--color-base-50);
    --accent-text: var(--color-primary-500);
```

Keep the Shiki blocks as they are. Add `--color-accent-text: var(--accent-text);` to the `@theme inline` block in `tailwind-theme.css` so `text-accent-text` works.

- [ ] **Step 3: Replace the type scale and containers in the components layer**

Replace `.h1`, `.h2`, `.h3`, `.section-eyebrow` (global.css lines 154-178) with:

```css
  .h1 {
    font-family: var(--font-heading);
    font-weight: 400;
    font-size: clamp(2.125rem, 1.4rem + 2.6vw, 3.375rem); /* 34 to 54px */
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0;
  }
  .h2 {
    font-family: var(--font-heading);
    font-weight: 400;
    font-size: clamp(1.75rem, 1.4rem + 1.2vw, 2.375rem); /* 28 to 38px */
    line-height: 1.1;
  }
  .h3 {
    font-family: var(--font-heading);
    font-weight: 400;
    font-size: clamp(1.5rem, 1.3rem + 0.7vw, 2rem); /* 24 to 32px */
    line-height: 1.1;
  }
  .body-xl { font-size: 1.5rem; line-height: 1.2; }
  .body-lg { font-size: 1.125rem; line-height: 1.5; }
  .body { font-size: 1rem; line-height: 1.5; }
  .body-sm { font-size: 0.875rem; line-height: 1.4; }
  .body-xs { font-size: 0.75rem; line-height: 1.4; }
  .subtitle { font-size: 1rem; line-height: 1; font-weight: 500; }
  .eyebrow {
    font-family: var(--font-pixel);
    font-size: 1.375rem;
    line-height: 0.8;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--accent-text);
  }
  .subtitle-pixel {
    font-family: var(--font-pixel);
    font-size: 1.125rem;
    line-height: 0.6;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .code {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.8;
  }
  .section-eyebrow { /* kept for blog and docs callers until they migrate */
    font-family: var(--font-pixel);
    font-size: 1rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--accent-text);
  }
  .home-container {
    @apply mx-auto w-full max-w-[1320px];
    padding-inline: clamp(16px, 4vw, 60px);
  }
  .card-tint { background-color: var(--color-tint-5); border: 1px solid var(--color-tint-25); }
  .card-tint:hover, .card-tint-hover { background-color: var(--color-tint-10); }
  .stroke-tint { border-color: var(--color-tint-25); }
```

Leave `.description`, `.nav__link--base`, `.site-container`, `.sections-alternate`, `.form__input` in place (they are deleted or restyled in later tasks).

- [ ] **Step 4: Check the site still renders**

Start `astro-dev`, open `/` and `/blog` in Chrome, dark and light (click the theme toggle). Expect: backgrounds `#0c0c0c` / `#f2f3f3`, teal links, no console errors from Tailwind (`read_console_messages`, filter `error`).

- [ ] **Step 5: Lint and commit**

```bash
npx eslint src/styles || true   # eslint ignores css; run prettier instead
npx prettier -c src/styles/tailwind-theme.css src/styles/global.css
git add src/styles/tailwind-theme.css src/styles/global.css
git commit --only -m "feat(theme): Figma teal palette, neutrals, type scale and spacing tokens" -- src/styles/tailwind-theme.css src/styles/global.css
```

---

### Task 3: Buttons

**Files:**
- Modify: `src/styles/buttons.css`, `src/components/Button/Button.astro`

**Interfaces:**
- Produces: `<Button variant="primary" | "secondary" | "secondary-trailing" | "ghost" size="default" | "navbar" href?>`. The square marker glyph is rendered by CSS, not by the slot.

- [ ] **Step 1: Pull the hero to read exact button metrics** (part of Task 7's call; until then use Figma values read in Chrome: Navbar buttons 50px tall in the hero, 40px in the navbar, padding 16px 20px, marker 8x8px, gap 12px).

- [ ] **Step 2: Rewrite buttons.css**

```css
/* buttons, Figma variants: primary (blue), secondary (transparent), secondary-trailing, ghost */
.button {
  @apply inline-flex items-center justify-center gap-3 rounded-r0 px-5 py-3 text-base font-normal whitespace-nowrap;
  @apply focus-visible:ring-primary-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background;
  @apply disabled:pointer-events-none disabled:opacity-60;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}
.button::before,
.button::after {
  content: "";
  display: none;
  width: 8px;
  height: 8px;
  background: currentColor;
  flex: none;
}
.button--primary {
  @apply bg-primary-500 text-base-950;
  @apply hover:bg-primary-600;
}
.button--primary::after { display: inline-block; }

.button--secondary {
  @apply border bg-transparent text-foreground;
  border-color: var(--color-tint-25);
}
.button--secondary:hover { border-color: var(--foreground); }
.button--secondary::before { display: inline-block; }

.button--secondary-trailing {
  @apply border bg-transparent text-foreground;
  border-color: var(--color-tint-25);
}
.button--secondary-trailing:hover { border-color: var(--foreground); }
.button--secondary-trailing::after { display: inline-block; }

.button--ghost {
  @apply bg-transparent px-0 text-foreground underline-offset-4 hover:underline;
}

.button--navbar {
  @apply px-4 py-2 text-sm;
}
.button--navbar::before,
.button--navbar::after { width: 6px; height: 6px; }
```

- [ ] **Step 3: Rewrite Button.astro props**

Replace the `Props` interface and the `class:list` so:

```ts
interface Props extends HTMLAttributes<"button">, Omit<HTMLAttributes<"a">, "type"> {
  variant?: "primary" | "secondary" | "secondary-trailing" | "ghost";
  size?: "default" | "navbar";
}
const { variant = "primary", size = "default", class: className, href, ...rest } = Astro.props;
```

and the element gets `class:list={[className, "button group", `button--${variant}`, size === "navbar" && "button--navbar"]}`. Remove the `arrow` prop and the two `<Icon>` blocks. Grep for `arrow=` across `src/` and remove the prop from callers that remain after Task 15 (contact page uses `Button`; check it).

- [ ] **Step 4: Verify in Chrome**

Open `/contact`: buttons render teal with the square marker, keyboard focus ring visible.

- [ ] **Step 5: Commit**

```bash
git add src/styles/buttons.css src/components/Button/Button.astro <any caller edited>
git commit --only -m "feat(theme): Figma button variants with square markers" -- src/styles/buttons.css src/components/Button/Button.astro <callers>
```

---

### Task 4: Navbar

**Files:**
- Modify: `src/config/types/configDataTypes.ts:23-28`, `src/config/en/navData.json.ts`, `src/components/Nav/Nav.astro`, `src/components/Nav/NavLink.astro:55-77`, `src/components/Nav/MobileNav/MobileNav.astro:125-141`

**Interfaces:**
- Consumes: `Button` from Task 3, `PLUMBER_GITHUB_REPO_URL` and `PLUMBER_GITHUB_ACTION_URL` from `src/js/plumberGithubRepo.ts`.
- Produces: `navLinkItem.hidden?: boolean`; nav CTAs exported as `navCtas` from `navData.json.ts`.

- [ ] **Step 1: Extend the nav types**

In `configDataTypes.ts` add `hidden?: boolean; // present in data but not rendered yet` to `navLinkItem`, and add:

```ts
export interface navCta {
  text: string;
  link: string;
  variant: "primary" | "secondary";
  newTab?: boolean;
}
```

- [ ] **Step 2: Rewrite navData.json.ts**

```ts
import { PLUMBER_GITHUB_ACTION_URL } from "@js/plumberGithubRepo";

import { type navCta, type navItem } from "../types/configDataTypes";

const navConfig: navItem[] = [
  { text: "About us", link: "/about", hidden: true },
  { text: "Product", link: "/#product" },
  { text: "Docs", link: "/docs/getting-started" },
  { text: "Radar", link: "/radar" },
  { text: "Blog", link: "/blog" },
  { text: "Contact", link: "/contact" },
];

export const navCtas: navCta[] = [
  { text: "Install GitHub agent", link: PLUMBER_GITHUB_ACTION_URL, variant: "secondary", newTab: true },
  { text: "Book a demo", link: "/#book-a-demo", variant: "primary" },
];

export default navConfig;
```

(Deviation from the spec link map: the GitHub agent CTA points at the Marketplace listing the codebase already defines, not `/docs/cli/github`.)

- [ ] **Step 3: Rewrite the Nav.astro markup**

Keep the frontmatter imports except `LanguageSelect`, `Search`, `NavDropdownToggle`, `MegaMenuDropdownToggle` (keep the dropdown toggles only if `navData` still has dropdown items; it does not, so remove them). Add `import { navCtas } from "@config/en/navData.json";`, `import { PLUMBER_GITHUB_REPO_URL } from "@js/plumberGithubRepo";`, `import { Icon } from "astro-icon/components";`. Filter hidden items: `const navItems = finalNavData.filter((i) => !("hidden" in i && i.hidden));`.

Markup:

```astro
<section id="nav" class:list={["fixed top-0 left-0 z-30 w-full border-b transition-all duration-300", Astro.url.pathname.startsWith("/docs") ? "bg-background/80 border-foreground/10 backdrop-blur" : "navbar--initial"]}>
  <div class:list={[Astro.url.pathname.startsWith("/docs") ? "docs-site-container border-foreground/10 border-r border-l" : "home-container"]}>
    <header class="flex h-[76px] items-center gap-6">
      <div class="flex flex-none items-center"><SiteLogo /></div>
      <nav class="hidden flex-1 lg:block" aria-label="Main">
        <ul class="flex items-center gap-2">{navItems.map((navItem) => <NavLink {navItem} />)}</ul>
      </nav>
      <div class="ml-auto hidden items-center gap-3 lg:flex">
        <ThemeToggle />
        {Astro.url.pathname.startsWith("/docs") && <DocsSearch />}
        <a href={PLUMBER_GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="Plumber on GitHub" class="primary-focus nav__link--base flex h-9 w-9 items-center justify-center"><Icon name="mdi/github" class="size-6" /></a>
        {navCtas.map((cta) => <Button variant={cta.variant} size="navbar" href={cta.link} target={cta.newTab ? "_blank" : undefined} rel={cta.newTab ? "noopener noreferrer" : undefined}>{cta.text}</Button>)}
      </div>
      <div class="ml-auto flex items-center lg:hidden"><MobileNav /></div>
    </header>
  </div>
</section>
```

Keep the `<style>` and `<script>` blocks; change `.navbar--scrolled` to `@apply bg-background/80 backdrop-blur;` with `border-color: var(--color-tint-25);` and `.navbar--initial` to `@apply bg-background;` with `border-color: var(--color-tint-25);` (the Figma navbar is opaque black with the 25 percent stroke at rest).

- [ ] **Step 4: NavLink styling**

In `NavLink.astro` change the anchor classes to `nav__link--base primary-focus relative flex shrink-0 items-center gap-1.5 px-3 py-2 text-base whitespace-nowrap` and the active class to `text-accent-text`. In `global.css` set `.nav__link--base { @apply text-foreground/90 hover:text-foreground leading-tight; }`.

- [ ] **Step 5: Mobile nav CTAs**

In `MobileNav.astro` replace the commented Sign in/Sign up block (lines 131-140) with the same `navCtas.map(...)` as the desktop nav, full width (`class="w-full"`), and import `navCtas`. Filter hidden items the same way before rendering `finalNavData`.

- [ ] **Step 6: Verify**

Chrome at 1440: navbar 76px tall, links centred, GitHub icon, two CTAs. At 375: hamburger opens the dialog with links and both CTAs. `/docs/getting-started` still shows its search. No console errors.

- [ ] **Step 7: Commit**

```bash
git add src/config/types/configDataTypes.ts src/config/en/navData.json.ts src/components/Nav/Nav.astro src/components/Nav/NavLink.astro src/components/Nav/MobileNav/MobileNav.astro src/styles/global.css
git commit --only -m "feat(shell): Figma navbar with GitHub agent and demo CTAs" -- <same paths>
```

---

### Task 5: Footer

**Files:**
- Modify: `src/components/Footer/Footer.astro`, `src/components/Footer/FooterLink.astro:21`

**Interfaces:**
- Produces: a `<form data-form="newsletter" action="/api/newsletter">` that Task 11's `forms.ts` enhances. Footer link groups come from a `footerColumns` array in `homeData.json.ts` (Task 6); until Task 6 lands, define the array inline and move it in Task 6.

- [ ] **Step 1: Rewrite Footer.astro**

```astro
---
import FooterLink from "@components/Footer/FooterLink.astro";
import { footerColumns, footerSocials } from "@config/en/homeData.json";
import { Icon } from "astro-icon/components";

const year = new Date().getFullYear();
const isDocs = Astro.url.pathname.startsWith("/docs");
---

<footer class="bg-background border-t" style="border-color: var(--color-tint-25)">
  <div class:list={[isDocs ? "docs-site-container" : "home-container", "pt-16 pb-10"]}>
    <div class="grid gap-10 md:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.6fr)]">
      {footerColumns.map((col) => (
        <div class="flex flex-col gap-3">
          <h3 class="subtitle text-foreground">{col.title}</h3>
          {col.links.map((l) => <FooterLink href={l.link} newTab={l.newTab}>{l.text}</FooterLink>)}
        </div>
      ))}
      <div class="flex flex-col gap-4">
        <h3 class="subtitle text-foreground">Newsletter</h3>
        <form data-form="newsletter" action="/api/newsletter" method="post" class="flex flex-col gap-3" novalidate>
          <label class="sr-only" for="newsletter-email">Your email</label>
          <input id="newsletter-email" name="email" type="email" autocomplete="email" required placeholder="Your email" class="form__input h-11" />
          <input type="text" name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
          <button type="submit" class="button button--secondary-trailing self-start">Subscribe</button>
          <p data-form-status class="body-sm text-muted-foreground" aria-live="polite"></p>
        </form>
        <ul class="flex items-center gap-5" aria-label="Social links">
          {footerSocials.map((s) => (
            <li><a href={s.link} target="_blank" rel="noopener noreferrer" aria-label={s.text} class="text-muted-foreground hover:text-foreground"><Icon name={s.icon} class="size-5" /></a></li>
          ))}
        </ul>
      </div>
    </div>
    <p class="body-sm text-muted-foreground mt-12 flex flex-wrap gap-x-3">
      <span>©PLUMBER {year}</span><span>·</span><span>All rights reserved</span><span>·</span>
      <a href="/privacy-policy" class="hover:text-foreground">Cookies</a><span>·</span>
      <span>Pixel font <a href="https://fontstruct.com/fontstructions/show/192981" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">HaxrCorp 4089</a> by sahwar, CC BY-SA 3.0</span>
    </p>
    <p class="text-foreground mt-10 font-heading leading-none tracking-[-0.02em] text-[clamp(4rem,19vw,17rem)]" aria-hidden="true">PLUMBER</p>
  </div>
</footer>
```

Icons needed in `src/icons/`: `tabler/brand-github`, `tabler/brand-discord`, `tabler/brand-linkedin`, `tabler/brand-x` (copy from `node_modules/@tabler/icons/icons/outline/*.svg` if missing; check what `src/icons/tabler/` already has).

- [ ] **Step 2: FooterLink colours**

Change the class string to `text-muted-foreground hover:text-foreground mr-auto body transition`.

- [ ] **Step 3: Temporary data**

Until Task 6, put `footerColumns` and `footerSocials` in `src/config/en/homeData.json.ts` right away (create the file with only these two exports; Task 6 adds the rest):

```ts
import { PLUMBER_GITHUB_REPO_URL } from "@js/plumberGithubRepo";

export const footerColumns = [
  { title: "Pages", links: [
    { text: "Home", link: "/" }, { text: "Products", link: "/#product" },
    { text: "Radar", link: "/radar" }, { text: "Docs", link: "/docs/getting-started" } ] },
  { title: "Solutions", links: [ { text: "Plumber Radar", link: "/radar" } ] },
  { title: "Resources", links: [
    { text: "Release notes", link: `${PLUMBER_GITHUB_REPO_URL}/releases`, newTab: true },
    { text: "Insights", link: "/blog" }, { text: "Blog", link: "/blog" } ] },
  { title: "Legal", links: [
    { text: "Privacy policy", link: "/privacy-policy" }, { text: "Terms of use", link: "/terms-of-use" } ] },
];

export const footerSocials = [
  { text: "GitHub", link: "https://github.com/getplumber", icon: "tabler/brand-github" },
  { text: "Discord", link: "/discord", icon: "tabler/brand-discord" },
  { text: "LinkedIn", link: "https://www.linkedin.com/company/getplumber", icon: "tabler/brand-linkedin" },
  { text: "X", link: "https://x.com/getplumber_io", icon: "tabler/brand-x" },
];
```

- [ ] **Step 4: Verify** in Chrome at 1440 and 375: four columns plus newsletter, socials, credit line, giant wordmark never overflows (no horizontal scrollbar: `document.documentElement.scrollWidth === window.innerWidth`).

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer/Footer.astro src/components/Footer/FooterLink.astro src/config/en/homeData.json.ts src/icons/tabler/brand-*.svg
git commit --only -m "feat(shell): Figma footer with newsletter and wordmark" -- <same paths>
```

---

### Task 6: Home data file and FAQ content

**Files:**
- Modify: `src/config/en/homeData.json.ts` (extend), `src/config/types/configDataTypes.ts`, `src/config/en/faqData.json.ts`

**Interfaces:**
- Produces: exports `hero`, `valueProp`, `attackers`, `incidents`, `howItWorks`, `oneProduct`, `proof`, `bookDemo` typed by the new interfaces below. Copy is transcribed from the Figma screenshots of 2026-10-26; sections adjust wording when their `get_design_context` pull shows a difference.

- [ ] **Step 1: Add types**

```ts
export interface Cta { text: string; link: string; variant: "primary" | "secondary" | "secondary-trailing" | "ghost"; newTab?: boolean }
export interface Stat { value: string; label: string; source?: string; sourceLink?: string }
export interface Step { number: string; title: string; text: string }
export interface Incident { date: string; figure: string; text: string; source: string; sourceLink?: string; highlight?: boolean }
export interface FooterColumn { title: string; links: { text: string; link: string; newTab?: boolean }[] }
export interface SocialLink { text: string; link: string; icon: string }
```

- [ ] **Step 2: Write the data**

```ts
export const hero = {
  eyebrow: "CI/CD security posture management",
  headline: "Leaking CI/CD pipelines kill your company.",
  headlineMuted: "Plumber prevents it.",
  ctas: [
    { text: "See on GitHub", link: PLUMBER_GITHUB_REPO_URL, variant: "secondary", newTab: true },
    { text: "Book a demo", link: "/#book-a-demo", variant: "primary" },
  ] as Cta[],
};

export const valueProp = {
  headline: "AI now writes your pipelines, and nobody reviews them.",
  headlineMuted: "Plumber checks every pipeline before it runs, grades it from A to E, and opens the pull request that fixes what it finds.",
  cta: { text: "Get your Plumber Score", link: "/docs/getting-started", variant: "secondary-trailing" } as Cta,
  altLabel: "Or run it yourself:",
  altLink: { text: "Plumber Scan", link: "/docs/cli/installation" },
  overviewTitle: "Coverage and grading overview",
  stats: [
    { value: "A-E", label: "One grade for every pipeline" },
    { value: "GitHub + GitLab", label: "Same checks, same score" },
    { value: "Open source", label: "Verify any grade yourself" },
  ] as Stat[],
};

export const attackers = {
  eyebrow: "Why it's happening",
  headline: "AI writes your pipelines.",
  headlineStrong: "Attackers walk right in.",
  text: "Developers now prompt their pipelines instead of writing them. The AI copies the insecure defaults it learned from millions of public repositories. The pipeline still turns green, because green means the build worked, not that it is safe.",
  stats: [
    { value: "2x", label: "AI-assisted commits leak secrets twice as often", source: "GitGuardian, State of Secrets Sprawl 2026" },
    { value: "48.8%", label: "of organizations use AI for at least one CI/CD task", source: "GitLab DevSecOps Report 2025" },
  ] as Stat[],
  banner: { text: "Your pipeline is green.", strong: "It's also leaking." },
  file: ".github/workflows/deploy.yml",
  issuesBadge: "3 issues found",
  yaml: [ /* { n, text, flagged? } one entry per line, transcribed from the hero pull */ ],
  callouts: [
    { title: "Token with write access to everything", text: "Your pipeline has more access than any engineer." },
    { title: "Static cloud key", text: "One leak hands over your cloud." },
    { title: "Unpinned third-party action", text: "Whoever controls that tag controls your pipeline." },
  ],
};

export const incidents = {
  eyebrow: "The numbers behind the blind spot",
  headline: "Attackers moved",
  headlineMuted: "to the pipeline.",
  text: "A pipeline holds the keys to your code, your cloud and your customer data. It has more access than most engineers and gets reviewed less than any other part of the codebase. Attackers know it.",
  logTitle: "Incident log",
  rows: [
    { date: "Oct 2026", figure: "52%", text: "of 104,500 public projects had at least one CI/CD attack pattern.", source: "Plumber Radar Scan", highlight: true },
    { date: "Nov 2026", figure: "25,000+", text: "public GitHub repos filled with stolen credentials within hours, as the Shai-Hulud 2.0 worm hit Zapier, PostHog and Postman.", source: "Wiz Research" },
    { date: "Nov 2026", figure: "59%", text: "of the machines it compromised were CI/CD runners, not laptops.", source: "GitGuardian, State of Secrets Sprawl 2026" },
    { date: "Mar 2025", figure: "23,000+", text: "repositories ran a hijacked GitHub Action that dumped their CI secrets into public build logs. One unpinned line of YAML was enough.", source: "tj-actions/changed-files, CVE-2025-30066" },
    { date: "Dec 2024", figure: "260,000", text: "daily downloads of Ultralytics, a top AI library, when attackers slipped a crypto miner into its release through a branch name its GitHub Actions workflow never checked.", source: "Bleepingcomputer and Wiz" },
  ] as Incident[],
};

export const howItWorks = {
  eyebrow: "How it works",
  headline: "Plumber finds the leak",
  headlineStrong: "and brings the fix.",
  text: "One loop, run on every pipeline, every time it changes.",
  steps: [
    { number: "01", title: "Map", text: "Discover every pipeline across all your repos, on GitHub and GitLab." },
    { number: "02", title: "Find", text: "Surface unpinned third-party actions, tokens with too much access, and missing branch protection." },
    { number: "03", title: "Fix", text: "AI writes the fix. Plumber's rule-based engine checks every change before your team sees it, then opens the pull request." },
    { number: "04", title: "Grade", text: "Every pipeline gets a Plumber Score from A to E. Set a threshold and block any merge below it." },
  ] as Step[],
  note: "Nothing merges without your review. Every fix arrives as a pull request your team can read, test and reject.",
};

export const oneProduct = {
  eyebrow: "Choose your path",
  headline: "One product.",
  headlineStrong: "Two ways to use it.",
  text: "Same engine, same score. Pick the entry point that fits how you work.",
  columns: [
    { number: "01", title: "For Developers", text: "Open source. Runs in your terminal, a GitHub Action or GitLab CI. Scan your pipeline and fix issues before they ship. No setup, no account.",
      ctas: [ { text: "Install the GitHub Agent", link: PLUMBER_GITHUB_ACTION_URL, variant: "secondary", newTab: true }, { text: "Install the CLI", link: "/docs/cli/installation", variant: "secondary-trailing" } ] as Cta[] },
    { number: "02", title: "For Organizations", text: "Continuous CI/CD security posture across every repo and every team. One dashboard, audit-ready reporting, and an AI agent that fixes what it finds.",
      quote: "Continuous CI/CD security posture across every repo and every team. One dashboard, audit-ready reporting, and an AI agent that fixes what it finds.",
      ctas: [ { text: "Book a demo", link: "/#book-a-demo", variant: "primary" } ] as Cta[] },
  ],
};

export const proof = {
  eyebrow: "Trusted by the community, built for scale",
  headline: "Don't take our word for it.",
  headlineStrong: "Check the grade.",
  text: "Every check Plumber runs is open source. Run it on your own pipeline and you'll get the same grade we do.",
  ctas: [ { text: "View on GitHub", link: PLUMBER_GITHUB_REPO_URL, variant: "primary", newTab: true }, { text: "Join the Discord", link: "/discord", variant: "secondary", newTab: true } ] as Cta[],
  stats: [
    { value: "100+", label: "open-source projects graded A or B" },
    { value: "25,000+", label: "open-source downloads" },
    { value: "16,644", label: "public projects graded" },
    { value: "[N]", label: "leaks found" },   // placeholder, spec open item 1
  ] as Stat[],
};

export const bookDemo = {
  eyebrow: "Let's look at your pipelines",
  headline: "Find the leak",
  headlineStrong: "before an attacker does.",
  text: "We'll scan your pipelines, show you their Plumber Score and walk your team through the fixes.",
  fields: { name: "Name", email: "Work email", company: "Company", pipelines: "Number of pipelines (optional)" },
  submit: "Book a demo",
  fallbackEmail: "hello@getplumber.io",
};
```

- [ ] **Step 3: Replace faqData.json.ts content**

Keep the file shape (`FaqItem[]`, default export). New questions, with answers adapted from the existing ones where the Figma keeps them collapsed (spec open item 2):

1. "What is Plumber?" (Figma answer): "Plumber is CI/CD security posture management that finds what it finds. It checks how every pipeline is built, grades it from A to E, and sends the fix as a pull request your team reviews and merges."
2. "How is it different from runtime security tools?" (adapted): runtime tools watch what runs; Plumber checks how the pipeline is built before anything runs, and grades it.
3. "Can I trust a fix written by AI?" (adapted from "How does Plumber fix the issues it finds?").
4. "Does it work on GitHub and GitLab?" (adapted): yes, same checks, same score, GitHub Actions and GitLab CI/CD.
5. "What does the grade mean?" (adapted from "What is the Plumber Score?").
6. "What access does Plumber need?" (adapted from "How do I get started?": read access to pipeline configuration and project settings; the CLI needs nothing beyond the repository).
7. "Is it free?" (adapted from the CLI vs Platform answer: CLI open source and free; platform free up to 10 projects).

Write the full answer text for each (two to four sentences, no em dashes, links kept to `/docs/...`).

- [ ] **Step 4: Type-check and commit**

`npx eslint src/config` then:

```bash
git add src/config/en/homeData.json.ts src/config/types/configDataTypes.ts src/config/en/faqData.json.ts
git commit --only -m "feat(home): typed copy and data for the redesigned home page" -- <same paths>
```

---

### Task 7: Hero with pixel animation, new index.astro

**Files:**
- Create: `src/components/Home/SectionHeading.astro`, `src/components/Home/Hero.astro`, `src/components/Home/PixelAnimation.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `hero` from `homeData`, `Button`.
- Produces: `<SectionHeading eyebrow headline headlineStrong? headlineMuted? text? />` used by every later section; `index.astro` becomes the list of new sections and keeps old sections below until each is replaced.

- [ ] **Step 1: Pull the hero** with `get_design_context` on `2513:1347` (screenshot included). Download every asset URL it returns with `curl -L` into `src/assets/images/home/` and reference them by import. Read from the response: wordmark font size and tracking, eyebrow offset, headline sizes, CTA paddings, the pixel-animation frame geometry.

- [ ] **Step 2: SectionHeading.astro**

```astro
---
interface Props { eyebrow?: string; headline: string; headlineStrong?: string; headlineMuted?: string; text?: string; as?: "h1" | "h2"; class?: string }
const { eyebrow, headline, headlineStrong, headlineMuted, text, as: Tag = "h2", class: className } = Astro.props;
---
<div class:list={["flex flex-col gap-6", className]}>
  {eyebrow && <p class="eyebrow">{eyebrow}</p>}
  <Tag class="h1">
    <span class={headlineStrong ? "text-muted-foreground" : "text-foreground"}>{headline}</span>
    {headlineStrong && <><br /><span class="text-foreground">{headlineStrong}</span></>}
    {headlineMuted && <> <span class="text-muted-foreground">{headlineMuted}</span></>}
  </Tag>
  {text && <p class="body-lg text-muted-foreground max-w-[62ch]">{text}</p>}
</div>
```

- [ ] **Step 3: PixelAnimation.astro**

Read the 10 variants of `Pixel_Anim_Principal` from the hero pull (the hero's `pixel-animation` frame `2513:1348` instances them). Implement as an inline SVG grid of squares driven by a tiny script: a `<svg viewBox>` of the frame's width/height, `<rect>` elements positioned from the first keyframe, and a `requestAnimationFrame` loop that steps through the keyframe list (array of `{x, y}` per moving square) every 120 ms. Honour `matchMedia("(prefers-reduced-motion: reduce)")` by rendering the first keyframe only. The component takes `keyframes` as a prop so Task 10's `OneProduct` background can reuse it with `static` set.

- [ ] **Step 4: Hero.astro**

```astro
---
import Button from "@components/Button/Button.astro";
import { hero } from "@config/en/homeData.json";
import PixelAnimation from "./PixelAnimation.astro";
---
<section id="hero" class="relative overflow-hidden pt-[76px]">
  <div class="home-container relative pt-20 pb-24">
    <p class="font-heading text-foreground leading-none tracking-[0.18em] text-[clamp(3rem,13.5vw,12.4rem)]" aria-hidden="true">PLUMBER</p>
    <h1 class="sr-only">Plumber: {hero.headline} {hero.headlineMuted}</h1>
    <div class="mt-16 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
      <div class="flex flex-col gap-5">
        <p class="eyebrow">{hero.eyebrow}</p>
        <p class="body-xl text-foreground"><span>{hero.headline}</span> <span class="text-muted-foreground">{hero.headlineMuted}</span></p>
        <Button variant="secondary" href={hero.ctas[0].link} target="_blank" rel="noopener noreferrer" class="self-start">{hero.ctas[0].text}</Button>
      </div>
      <Button variant="primary" href={hero.ctas[1].link} class="self-start lg:self-end">{hero.ctas[1].text}</Button>
    </div>
  </div>
  <PixelAnimation class="pointer-events-none absolute inset-x-0 bottom-0" keyframes={...} />
</section>
```

Adjust the exact positions to the pull (the Figma places the animation band between the wordmark and the copy).

- [ ] **Step 5: index.astro**

Replace the file with the new composition, leaving the old sections commented out so later tasks delete them:

```astro
---
import Hero from "@components/Home/Hero.astro";
import SoftwareAppJsonLd from "@components/Seo/SoftwareAppJsonLd.astro";
import { getLocaleFromUrl } from "@js/localeUtils";
import { getTranslatedData } from "@js/translationUtils";
import BaseLayout from "@layouts/BaseLayout.astro";

const currLocale = getLocaleFromUrl(Astro.url);
const siteData = getTranslatedData("siteData", currLocale);
const pageTitle = siteData.homepageTitle ?? siteData.title;
const pageDescription = siteData.homepageDescription ?? siteData.description;
---
<BaseLayout title={pageTitle} description={pageDescription}>
  <SoftwareAppJsonLd />
  <Hero />
</BaseLayout>
```

- [ ] **Step 6: Verify** in Chrome: compare with the hero screenshot at 1440; at 375 the wordmark fits and CTAs stack; reduced motion emulation (`matchMedia` override via DevTools is not available, so test by toggling the OS setting or by temporarily forcing the flag) shows the first frame only.

- [ ] **Step 7: Commit**

```bash
git add src/components/Home/SectionHeading.astro src/components/Home/Hero.astro src/components/Home/PixelAnimation.astro src/pages/index.astro src/assets/images/home
git commit --only -m "feat(home): hero with pixel animation" -- <same paths>
```

---

### Task 8: ValueProp and AttackersWalkIn

**Files:**
- Create: `src/components/Home/ValueProp.astro`, `src/components/Home/AttackersWalkIn.astro`
- Modify: `src/pages/index.astro`, `src/config/en/homeData.json.ts` (`attackers.yaml` filled)

- [ ] **Step 1: Pull** `2513:1417` and `2513:1438` in one parallel batch of two `get_design_context` calls.

- [ ] **Step 2: ValueProp.astro**: `home-container`, two-column grid (copy left, CTA block right), then a `<details open>` element styled as the "Coverage and grading overview" row (summary text left, a `+`/`-` glyph right via `details[open] summary::after`), containing a 3-column stats grid with 1px `stroke-tint` dividers. Stats render `value` in `.h3` and `label` in `.subtitle-pixel text-muted-foreground`.

- [ ] **Step 3: AttackersWalkIn.astro**: `SectionHeading` centred; two-stat row with sources in `.body-xs text-muted-foreground`; banner row (`card-tint` with accent-20 border, a check icon and the two-part sentence); code card: header bar with the file name in `.code` and the `issuesBadge` in a red pill (`bg-danger-5 text-danger-500 border-danger-25`), then an `<ol>` of lines in `.code` with line numbers in `text-muted-foreground`, flagged lines get `bg-danger-10` and a red left border; callouts column on the right (three `card-tint` blocks with a red marker, title in `.subtitle`, text in `.body-sm text-muted-foreground`). Transcribe the YAML lines from the pull into `attackers.yaml` as `{ n: number, text: string, flagged?: true }`.

- [ ] **Step 4: Add both to index.astro** after `<Hero />`.

- [ ] **Step 5: Verify** both against their screenshots at 1440 and at 375 (code block scrolls horizontally inside its card: `overflow-x-auto`).

- [ ] **Step 6: Commit**

```bash
git add src/components/Home/ValueProp.astro src/components/Home/AttackersWalkIn.astro src/pages/index.astro src/config/en/homeData.json.ts
git commit --only -m "feat(home): value proposition and attackers sections" -- <same paths>
```

---

### Task 9: IncidentLog and HowItWorks

**Files:**
- Create: `src/components/Home/IncidentLog.astro`, `src/components/Home/HowItWorks.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Pull** `2513:1630` and `2513:1707` in one parallel batch.

- [ ] **Step 2: IncidentLog.astro**: `SectionHeading` left-aligned; a `card-tint` container with a title row (`logTitle` in `.subtitle-pixel`) and a semantic `<table>`: `<thead>` with Date, Figure, What happened, Source in `.subtitle-pixel text-muted-foreground`; rows with `date` in `.body-xs text-muted-foreground`, `figure` in `.h2`, `text` in `.body`, `source` right-aligned `.body-xs`. `highlight` rows get `bg-tint-10`. Below `md`, switch to a stacked layout with `display:block` rows and `data-label` attributes shown through `::before` (classic responsive table), so the markup stays one table.

- [ ] **Step 3: HowItWorks.astro**: `SectionHeading`; four-column grid (1 column below `sm`, 2 below `lg`): each step has a 1px progress track (`stroke-tint`) with a 6px accent square at the start, number in `.subtitle-pixel text-muted-foreground`, title in `.h3`, text in `.body-sm text-muted-foreground`; then the note banner (same component pattern as the AttackersWalkIn banner: extract `Home/NoteBanner.astro` with props `icon`, `text`, `strong?` and use it in both).

- [ ] **Step 4: Add to index.astro**, verify, commit:

```bash
git add src/components/Home/IncidentLog.astro src/components/Home/HowItWorks.astro src/components/Home/NoteBanner.astro src/components/Home/AttackersWalkIn.astro src/pages/index.astro
git commit --only -m "feat(home): incident log and how it works" -- <same paths>
```

---

### Task 10: OneProduct, Proof, Faq

**Files:**
- Create: `src/components/Home/OneProduct.astro`, `src/components/Home/Proof.astro`, `src/components/Home/Faq.astro`
- Modify: `src/components/Testimonials/TestimonialCard.astro`, `src/pages/index.astro`

- [ ] **Step 1: Pull** `2513:1766`, `2513:1791`, `2513:1845` in one parallel batch of three.

- [ ] **Step 2: OneProduct.astro** (`id="product"`): bordered panel (`rounded-r4`, `stroke-tint`) with the static pixel background (`PixelAnimation` with `static` and the `pix-anim` keyframe from the pull) behind a centred `SectionHeading`; two columns separated by a vertical 1px line; each column: number in `.subtitle-pixel`, title in `.h2`, text, optional quote block (`border-l stroke-tint pl-4`), CTAs row.

- [ ] **Step 3: Proof.astro**: `SectionHeading` left with the two CTAs; stats row (4 columns, 2 below `md`, 1px dividers) with value `.h2` and label `.subtitle-pixel text-muted-foreground`; testimonial rail: `<ul class="flex gap-5 overflow-x-auto snap-x snap-mandatory">` of `TestimonialCard` (restyled: `card-tint rounded-r4 p-6`, quote prefixed with `>>` in `.code text-muted-foreground`, avatar 32px, name `.subtitle`, title `.body-xs text-muted-foreground`), `scroll-snap-align: start`, `min-w-[min(100%,424px)]`.

- [ ] **Step 4: Faq.astro**: `SectionHeading` with `eyebrow="FAQ"` and `headline="Questions"`; Starwind `Accordion type="single" defaultValue="faq-0"` with one `AccordionItem value={`faq-${i}`}` per `faqData` entry; `AccordionTrigger` text in `.body-lg`, the chevron replaced by a `+` / `-` glyph (`[&[data-state=open]_.faq-glyph]:content-['-']`); `AccordionContent details={answer}`. Items are separated by 1px `stroke-tint` lines, no rounded border (override `accordionItem` classes with `class="rounded-none border-0 border-b"`). Keep the FAQPage JSON-LD: move the script from `FaqSection.astro` into `Faq.astro` unchanged.

- [ ] **Step 5: Add all three to index.astro, verify** (accordion keyboard: Tab to a trigger, Enter toggles; carousel scrolls with the keyboard when focused).

- [ ] **Step 6: Commit**

```bash
git add src/components/Home/OneProduct.astro src/components/Home/Proof.astro src/components/Home/Faq.astro src/components/Testimonials/TestimonialCard.astro src/pages/index.astro
git commit --only -m "feat(home): one product, proof and faq sections" -- <same paths>
```

---

### Task 11: BookDemo section, API routes, client forms

**Files:**
- Create: `src/components/Home/BookDemo.astro`, `src/lib/formMail.ts`, `src/pages/api/demo.ts`, `src/pages/api/newsletter.ts`, `src/js/forms.ts`, `.env.example`
- Modify: `src/pages/index.astro`, `src/components/Footer/Footer.astro` (load `forms.ts`)

**Interfaces:**
- Produces: `POST /api/demo`, `POST /api/newsletter` as in spec section 8; `forms.ts` enhances every `form[data-form]`.

- [ ] **Step 1: Pull** `2513:1886`.

- [ ] **Step 2: formMail.ts**

```ts
type Fields = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

export function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > LIMIT;
}

export async function readJson(request: Request, maxBytes = 8192): Promise<Fields | null> {
  const len = Number(request.headers.get("content-length") ?? 0);
  if (len > maxBytes) return null;
  try {
    const data = (await request.json()) as unknown;
    if (!data || typeof data !== "object") return null;
    const out: Fields = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) out[k] = typeof v === "string" ? v.trim() : "";
    return out;
  } catch {
    return null;
  }
}

export function validate(fields: Fields, rules: Record<string, { min?: number; max: number; email?: boolean; optional?: boolean }>): string[] {
  const bad: string[] = [];
  for (const [name, r] of Object.entries(rules)) {
    const v = fields[name] ?? "";
    if (!v) { if (!r.optional) bad.push(name); continue; }
    if (v.length > r.max || (r.min && v.length < r.min) || (r.email && !EMAIL_RE.test(v))) bad.push(name);
  }
  return bad;
}

export async function sendMail(subject: string, text: string, replyTo?: string): Promise<Response> {
  const key = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM;
  const to = import.meta.env.CONTACT_TO_EMAIL ?? "hello@getplumber.io";
  if (!key || !from) return json({ error: "unconfigured" }, 503);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text, reply_to: replyTo }),
  });
  return res.ok ? json({ ok: true }) : json({ error: "upstream" }, 502);
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anon";
}
```

- [ ] **Step 3: api/demo.ts**

```ts
import type { APIRoute } from "astro";

import { clientKey, json, rateLimited, readJson, sendMail, validate } from "@/lib/formMail";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const fields = await readJson(request);
  if (!fields) return json({ error: "bad_request" }, 400);
  if (fields.website) return json({ ok: true });
  if (rateLimited(`demo:${clientKey(request)}`)) return json({ error: "rate_limited" }, 429);
  const bad = validate(fields, {
    name: { min: 2, max: 100 },
    email: { max: 200, email: true },
    company: { min: 1, max: 100 },
    pipelines: { max: 50, optional: true },
  });
  if (bad.length) return json({ error: "invalid", fields: bad }, 400);
  const text = `Name: ${fields.name}\nEmail: ${fields.email}\nCompany: ${fields.company}\nPipelines: ${fields.pipelines || "-"}`;
  return sendMail(`Demo request: ${fields.company}`, text, fields.email);
};
```

`api/newsletter.ts` is the same with rules `{ email: { max: 200, email: true } }`, key `newsletter:`, subject `Newsletter signup` and text `Email: ${fields.email}`.

- [ ] **Step 4: forms.ts**

```ts
const MESSAGES: Record<string, string> = {
  ok: "Thanks, we'll be in touch shortly.",
  invalid: "Please check the highlighted fields.",
  rate_limited: "Too many requests. Please try again in a few minutes.",
  unconfigured: "This form is not active yet. Email us at hello@getplumber.io.",
  error: "Something went wrong. Email us at hello@getplumber.io.",
};

function enhance(form: HTMLFormElement) {
  const status = form.querySelector<HTMLElement>("[data-form-status]");
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    if (button) button.disabled = true;
    try {
      const res = await fetch(form.action, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = (await res.json().catch(() => ({}))) as { error?: string; fields?: string[] };
      if (res.ok) { form.reset(); if (status) status.textContent = MESSAGES.ok; return; }
      body.fields?.forEach((f) => form.querySelector(`[name="${f}"]`)?.setAttribute("aria-invalid", "true"));
      if (status) status.textContent = MESSAGES[body.error ?? "error"] ?? MESSAGES.error;
    } catch {
      if (status) status.textContent = MESSAGES.error;
    } finally {
      if (button) button.disabled = false;
    }
  });
}

function init() { document.querySelectorAll<HTMLFormElement>("form[data-form]").forEach(enhance); }
init();
document.addEventListener("astro:after-swap", init);
```

Load it once from `BaseLayout.astro` with `<script>import "@js/forms";</script>` (the footer form exists on every page).

- [ ] **Step 5: BookDemo.astro** (`id="book-a-demo"`): two columns, `SectionHeading` left, form right with four `form__input` fields (restyle `.form__input` in global.css: transparent background, 1px `stroke-tint` bottom border only, no radius, `focus:border-primary-500`), honeypot input, full-width primary submit, status `<p data-form-status aria-live="polite">`, and under it `<p class="body-xs text-muted-foreground">Prefer email? <a href="mailto:hello@getplumber.io">hello@getplumber.io</a></p>`.

- [ ] **Step 6: .env.example**

```
# Form submissions (Task 11). Leave unset locally: the API answers 503 and forms show the email fallback.
RESEND_API_KEY=
RESEND_FROM=Plumber <hello@getplumber.io>
CONTACT_TO_EMAIL=hello@getplumber.io
```

- [ ] **Step 7: Verify with curl against the dev server**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:4400/api/demo -H "Content-Type: application/json" -d '{"name":"A","email":"x","company":""}'   # 400
curl -s -w "%{http_code}\n" -X POST localhost:4400/api/demo -H "Content-Type: application/json" -d '{"name":"Ada","email":"ada@example.com","company":"Acme","website":"spam"}'   # 200 {"ok":true}
curl -s -w "%{http_code}\n" -X POST localhost:4400/api/demo -H "Content-Type: application/json" -d '{"name":"Ada","email":"ada@example.com","company":"Acme"}'   # 503 unconfigured
```

Then in Chrome submit the form and the newsletter: status text shows the unconfigured message.

- [ ] **Step 8: Commit**

```bash
git add src/components/Home/BookDemo.astro src/lib/formMail.ts src/pages/api/demo.ts src/pages/api/newsletter.ts src/js/forms.ts .env.example src/pages/index.astro src/layouts/BaseLayout.astro src/styles/global.css
git commit --only -m "feat(home): book a demo form and mail API routes" -- <same paths>
```

---

### Task 12: Content sync

**Files:**
- Modify: `src/config/en/siteData.json.ts:12-14`, `src/components/Seo/SoftwareAppJsonLd.astro:17`, `src/pages/llms.txt.ts:28`

- [ ] **Step 1:** `homepageTitle: "Plumber - CI/CD security posture management | GitHub & GitLab"`, `homepageDescription: "Leaking CI/CD pipelines kill your company. Plumber checks every pipeline before it runs, grades it from A to E, and opens the pull request that fixes what it finds."`
- [ ] **Step 2:** JSON-LD description: same sentence plus the detection list already there.
- [ ] **Step 3:** llms.txt line 28: replace the leading sentence with the new positioning, keep the detection list.
- [ ] **Step 4:** Commit `chore(seo): sync homepage copy in metadata and llms.txt`.

---

### Task 13: Cleanup

**Files:**
- Delete: the list in spec section 10.
- Modify: `src/pages/index.astro` (remove leftovers), `src/styles/global.css` (remove `.sections-alternate` rules), `src/components/Hero/*` Google Fonts link goes with the file.

- [ ] **Step 1:** `grep -rn "PlumberHero\|WhyCicdSecurity\|TheLoop\|CliVsPlatform\|PlumberRadar\|PricingHome\|PlumberQuickStart\|Testimonials2\|FaqSection\|FaqCard\|SectionNav\|BeforeAfterPipeline\|PlumberVideo\|GitHubHeroStatsBadge\|githubHeroStats" src/` and confirm the only importers are the files being deleted (keep `PipelineAnimation` and `LogoCloud2`).
- [ ] **Step 2:** `git rm` the files, drop the `.sections-alternate` block, run `npm run lint` and `npm run build` (both must pass; build also runs pagefind).
- [ ] **Step 3:** Commit `chore(home): remove replaced landing components`.

---

### Task 14: Final verification pass

- [ ] `npm run lint` and `npm run build` green.
- [ ] Chrome at 1440 and 375, dark and light, every section against its Figma screenshot; no horizontal scroll at 375; theme toggle persists.
- [ ] Keyboard pass: nav, mobile dialog, accordion, carousel, both forms.
- [ ] `/blog`, `/contact`, `/privacy-policy`, `/docs/getting-started` render with the new shell and no console errors.
- [ ] Lighthouse accessibility (Chrome DevTools) on `/` at or above the pre-redesign score (record the baseline before Task 2).
- [ ] Record remaining open items (spec section 11) in the final report.
