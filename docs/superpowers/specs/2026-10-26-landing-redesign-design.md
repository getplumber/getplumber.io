# Landing page redesign (Figma "HOME_Last") design spec

Date: 2026-10-26
Branch: `feat/landing-redesign-2026` (cut from `main`)
Figma: file `OEp1QcJ16wgu5JP7ZbfRJh`, page "Website" (node `2513:742`)

## 1. Goal

Rebuild the getplumber.io home page to match the Figma frame `HOME_Last`
(node `2513:1345`, 1440 x 9509) and roll the new visual language (tokens,
Navbar, Footer) out to every page that uses `BaseLayout`. Docs keep their own
layout and nav for now.

Decisions taken with Thibaud on 2026-10-26:

- The home page matches the Figma exactly. Pricing, the Radar section, Quick
  start and Platform guides leave the home page. The customer logo marquee
  (`LogoCloud2`) is unmounted from the home page; its file is left untouched
  because separate logo work is pending in the working tree and on
  `feat/oss-adopter-logos`.
- Tokens, Navbar and Footer are site-wide (home, blog, contact, legal pages).
  The theme toggle and light mode stay. Figma has no light reference, so the
  light palette is derived here (section 4.4).
- The pixel font HaxrCorp 4089 is self-hosted from the files Thibaud supplied
  (`haxrcorp-4089.otf`, `license.txt`, `readme.txt`). License: CC BY-SA 3.0.
- The two forms (book a demo, newsletter) submit to serverless API routes that
  email the submission through Resend.

Non-goals: redesigning docs, blog article layout, contact page content,
template leftovers (`Feature1..8`, `Pricing1..4`, `Faq1/2`, `Testimonials1`,
`LogoCloud1`), the `/radar` external app.

## 2. Approach

Rebuild in place on one branch:

- New section components under `src/components/Home/`.
- `src/components/Nav/Nav.astro`, `MobileNav`, and `src/components/Footer/Footer.astro`
  rewritten to the Figma Navbar and Footer.
- Theme tokens replaced in `src/styles/tailwind-theme.css` and `src/styles/global.css`;
  button variants replaced in `src/styles/buttons.css`.
- `src/pages/index.astro` recomposed from the new sections.
- Replaced components deleted in a final cleanup commit.

Rejected: a parallel `/v2` page behind a flag (site-wide shell cannot be
previewed without touching live pages; flag plumbing is throwaway), and
restyling the existing components (only 3 of 10 sections map 1:1).

## 3. Repo facts the implementation relies on

- Astro 7.3 with `@astrojs/vercel`; no `output` set, so API routes opt in with
  `export const prerender = false`.
- Tailwind v4 via `@tailwindcss/vite`; theme lives in CSS `@theme` blocks
  (`src/styles/tailwind-theme.css`), no `tailwind.config`.
- Component `<style>` blocks import the theme with `theme(reference)` so
  `@apply` works; keep `build.cssMinify: "esbuild"`.
- Fonts: Inter self-hosted via `@fontsource` in `src/styles/fonts.css`.
  The theme's `--font-sans` says "Inter Variable" while the face is declared
  as "InterVariable"; fix as part of the token work.
- Home data lives in `src/config/en/*.json.ts` (`faqData`, `testimonialData`,
  `navData`, `siteData`).
- Dev server: `.claude/launch.json` entry `astro-dev`, port 4400.
- CI runs `npm run lint` and `npm run build`. No test framework.
- Commits: conventional commits, no AI co-author trailers. The working tree
  holds staged logo files and a modified `LogoCloud2.astro` that are not part
  of this work: commit with explicit pathspecs only (`git commit --only -- <paths>`).

## 4. Tokens

### 4.1 Colors (from Figma Design System, node `2513:4734`)

| Token | Value | Figma role |
|---|---|---|
| `black` | `#0c0c0c` | page background |
| `white` | `#f2f3f3` | headings, body, figures, button text |
| `grey-light` | `#c6c6c6` | de-emphasised text |
| `grey` | `#8d9596` | de-emphasised text |
| `grey-dark` | `#5c6262` | secondary labels |
| `grey-dark/5` | `rgba(92,98,98,0.05)` | card background (testimonial, incident log, code block) |
| `grey-dark/10` | `rgba(92,98,98,0.10)` | card hover |
| `grey-dark/25` | `rgba(92,98,98,0.25)` | strokes, dividers, navbar bottom border |
| `blue-light` | `#9cf3f3` | logo |
| `blue` (accent) | `#09c3c3` | accents, primary button fill, eyebrows |
| `blue-hover` | `#079d9d` | button hover |
| `blue-dark` | `#005d5d` | logo |
| `blue/20` | `rgba(9,195,195,0.20)` | stroke |
| `red` (accent) | `#fb3033` | alerts, text |
| `red-light` | `#e89496` | code line |
| `red-edge` | `#ff6b5e` | code line |
| `red/5`, `red/10`, `red/25` | `rgba(251,48,51,x)` | badge background, code line, stroke |

The Figma swatch label for "accent blue" says `#9CF3F3` but the swatch fill is
`#09c3c3`; the fill is the truth.

Implementation: in `tailwind-theme.css` the `--color-primary-*` scale is
rebuilt around teal (50 `#e6fafa`, 100 `#c9f5f5`, 200 `#9cf3f3`, 300 `#5fe3e3`,
400 `#09c3c3`, 500 `#09c3c3`, 600 `#079d9d`, 700 `#067c7c`, 800 `#005d5d`,
900 `#004242`, 950 `#002a2a`); `--color-base-*` is rebuilt from the Figma
neutrals (50 `#f2f3f3`, 100 `#e6e8e8`, 200 `#c6c6c6`, 300 `#a3a9a9`,
400 `#8d9596`, 500 `#6f7676`, 600 `#5c6262`, 700 `#3a3e3e`, 800 `#1f2222`,
900 `#141616`, 950 `#0c0c0c`); a `--color-danger-*` trio is added
(`#fb3033`, `#e89496`, `#ff6b5e`). The Starwind semantic variables in
`global.css` (`--background`, `--foreground`, `--primary`, `--border`,
`--card`, `--muted`) are re-pointed at these.

### 4.2 Typography (node `2513:4986`)

Families:

- `--font-sans`: Inter (self-hosted, existing).
- `--font-mono`: Geist Mono, added via `@fontsource-variable/geist-mono` (SIL OFL).
- `--font-pixel`: "HaxrCorp 4089", self-hosted from
  `src/assets/fonts/haxrcorp-4089/` (`.otf` plus a `.woff2` conversion if the
  toolchain allows, with `license.txt` and `readme.txt` alongside, as the
  readme requires).

Scale (utility classes in `global.css`, replacing `.h1/.h2/.h3/.section-eyebrow`):

| Class | Font | Size / line-height | Notes |
|---|---|---|---|
| `.h1` | Inter 400 | 54px / 1.2 | uppercase |
| `.h2` | Inter 400 | 38px / 1.1 | |
| `.h3` | Inter 400 | 32px / 1.1 | |
| `.body-xl` | Inter 400 | 24px / 1.2 | |
| `.body-lg` | Inter 400 | 18px / 1.5 | |
| `.body` | Inter 400 | 16px / 1.5 | default |
| `.body-sm` | Inter 400 | 14px / 1.4 | |
| `.body-xs` | Inter 400 | 12px / 1.4 | |
| `.subtitle` | Inter 500 | 16px / 1 | |
| `.eyebrow` | HaxrCorp 400 | 22px / 0.8 | uppercase, tracking 0.02em, accent blue |
| `.subtitle-pixel` | HaxrCorp 400 | 18px / 0.6 | uppercase, tracking 0.02em |
| `.code` | Geist Mono 400 | 13px / 1.8 | |

Headline sizes scale down on phones with `clamp()` (h1 down to 34px, h2 to
28px, h3 to 24px). The hero and footer wordmarks are live text in Inter with
wide tracking, sized with `clamp()` to span the container.

### 4.3 Spacing and radius (nodes `2513:5085`, `2513:5160`)

Spacing tokens `--space-8/14/16/20/24/32/40/48/60/64/88/208`.
Radius tokens `--radius-0/4/8/15`; the global `--radius` becomes `4px`.
Buttons are square-cornered unless a section pull says otherwise.

Container: content width 1320px (60px gutters at 1440). New `.home-container`
= `max-width: 1320px; padding-inline: clamp(16px, 4vw, 60px)`. `.site-container`
is left as is for blog and other pages. Navbar and Footer use the 1320 container.

### 4.4 Light mode (derived, no Figma reference)

| Semantic | Dark (Figma) | Light (derived) |
|---|---|---|
| background | `#0c0c0c` | `#f2f3f3` |
| foreground | `#f2f3f3` | `#0c0c0c` |
| muted text | `#c6c6c6` / `#8d9596` | `#5c6262` / `#8d9596` |
| card | grey-dark/5 | grey-dark/5 |
| border | grey-dark/25 | grey-dark/25 |
| accent text, eyebrows | `#09c3c3` | `#005d5d` (contrast 6.8:1 on light) |
| primary button | fill `#09c3c3`, text `#0c0c0c` | same |
| primary hover | `#079d9d` | `#079d9d` |
| danger | `#fb3033` | `#fb3033` |

Light mode must pass WCAG AA for body text (4.5:1) and large text (3:1).
The existing `ThemeToggle` and `localStorage.colorTheme` logic stay.

### 4.5 Buttons (Components `2513:2104` to `2513:2146`)

`src/styles/buttons.css` and `Button.astro` are rewritten with variants:

- `primary`: fill accent blue, text black, square marker glyph after the
  label, hover `blue-hover`.
- `secondary`: transparent, 1px grey-dark/25 stroke, white text, marker before
  the label, hover stroke white.
- `secondary-trailing`: as secondary with the marker after the label (Figma
  `Button_P2_Transparent`).
- `navbar` size modifier (smaller padding) for the Navbar CTAs.

Exact paddings come from the hero pull (section 6).

## 5. Site shell

### 5.1 Navbar (symbol `2513:1910`, 1440 x 76, padding 60/16, bottom stroke grey-dark/25)

Left: logo (`SiteLogo`). Centre: About us, Product, Docs, Radar, Blog, Contact.
Right: GitHub icon, "Install GitHub agent" (secondary, navbar size),
"Book a demo" (primary, navbar size). Links come from `navData.json.ts`.
The Radar link keeps `RadarNavIcon`. The scrolled/frosted behaviour stays but
uses the new tokens. Mobile: the existing `MobileNav` dialog, restyled.

Link map (defaults; correct at review):

| Label | Target |
|---|---|
| About us | hidden until a page exists (kept in nav data, `hidden: true`) |
| Product | `/#product` |
| Docs | `/docs/getting-started` |
| Radar | `/radar` |
| Blog | `/blog` |
| Contact | `/contact` |
| GitHub icon | `https://github.com/getplumber/plumber` |
| Install GitHub agent | `/docs/cli/github` |
| Book a demo | `/#book-a-demo` |

### 5.2 Footer (symbol `2513:2041`, 1440 x 639)

Columns: Pages (Home `/`, Products `/#product`, Radar `/radar`, Docs
`/docs/getting-started`), Solutions (Plumber Radar `/radar`, App: left out
until the platform URL is known), Resources (Release notes
`https://github.com/getplumber/plumber/releases`, Insights `/blog`, Blog
`/blog`), Legal (Privacy policy `/privacy-policy`, Terms of use
`/terms-of-use`). Right: Newsletter label and email field (section 8).
Socials: GitHub, Discord `/discord`, LinkedIn, X. Bottom line: "©PLUMBER 2026 ·
All rights reserved · Cookies" plus a small credit "Pixel font HaxrCorp 4089 by
sahwar, CC BY-SA 3.0" linking to the FontStruct page. Then the oversized
"PLUMBER" wordmark. The inbound anchor `/#pricing` is removed from the footer.
The old `/#platform` anchor disappears together with the replaced FAQ content.

### 5.3 Removed from the shell

`SectionNav` (scroll-spy dots), the Google Fonts `<link>` in `PlumberHero`,
`Search` import in Nav.

## 6. Home page sections

`src/pages/index.astro` renders, in order, the components below inside
`<main>`. The `.sections-alternate` banding is dropped; sections set their own
backgrounds. Copy and lists live in `src/config/en/homeData.json.ts`
(typed in `src/config/types/configDataTypes.ts`) so wording edits never touch
markup. FAQ content replaces `faqData.json.ts`; testimonials reuse
`testimonialData.json.ts`.

| # | Figma node | Component | Content and behaviour |
|---|---|---|---|
| 1 | `2513:1347` HERO (1440 x 700) | `Home/Hero.astro`, `Home/PixelAnimation.astro` | Giant "PLUMBER" wordmark; eyebrow "CI/CD security posture management"; headline "Leaking CI/CD pipelines kill your company. Plumber prevents it."; CTAs "See on GitHub" (secondary, repo) and "Book a demo" (primary, `/#book-a-demo`). Pixel animation rebuilt in CSS/JS from the 10 keyframes of `Pixel_Anim_Principal` (`2513:1203`), paused under `prefers-reduced-motion`. |
| 2 | `2513:1417` (1440 x 603) | `Home/ValueProp.astro` | Headline "AI now writes your pipelines, and nobody reviews them. ..." with the second sentence in grey; CTA "Get your Plumber Score" (secondary-trailing, `/docs/getting-started`); "Or run it yourself: Plumber Scan" link (`/docs/cli/installation`); collapsible "Coverage and grading overview" (open by default) with three stats: A-E "One grade for every pipeline", GitHub + GitLab "Same checks, same score", Open source "Verify any grade yourself". |
| 3 | `2513:1438` (1440 x 1096) | `Home/AttackersWalkIn.astro` | Eyebrow "Why it's happening"; H1 "AI writes your pipelines. Attackers walk right in."; paragraph; two stats with sources (2x, 48.8%); banner "Your pipeline is green. It's also leaking."; annotated YAML block (`.github/workflows/deploy.yml`, "3 issues found" badge, red-highlighted lines) built as HTML/CSS, with three callouts (Token with write access, Static cloud key, Unpinned third-party action). |
| 4 | `2513:1630` (1440 x 952) | `Home/IncidentLog.astro` | Eyebrow "The numbers behind the blind spot"; H1 "Attackers moved to the pipeline."; paragraph; "Incident log" table (Date, Figure, What happened, Source) with 5 rows from data; first row highlighted. Stacks to cards below `md`. |
| 5 | `2513:1707` (1440 x 659) | `Home/HowItWorks.astro` | Eyebrow "How it works"; H1 "Plumber finds the leak and brings the fix."; subline; four steps 01 Map, 02 Find, 03 Fix, 04 Grade with progress bars; note banner "Nothing merges without your review...". |
| 6 | `2513:1766` (1440 x 677) | `Home/OneProduct.astro` (id `product`) | Eyebrow "Choose your path"; H1 "One product. Two ways to use it."; subline; columns 01 For Developers (CTAs "Install the GitHub Agent" `/docs/cli/github`, "Install the CLI" `/docs/cli/installation`) and 02 For Organizations (quote block, CTA "Book a demo" primary). Pixel background from `pix-anim` (`2513:1767`), static. |
| 7 | `2513:1791` (1440 x 925) | `Home/Proof.astro` | Eyebrow "Trusted by the community, built for scale"; H1 "Don't take our word for it. Check the grade."; subline; CTAs "View on GitHub" (primary, repo), "Join the Discord" (secondary, `/discord`); stats row 100+, 25,000+, 16,644, [N] (placeholder, see section 11); testimonial carousel (`Testimonial card` `2513:1986`), horizontal scroll with snap, reusing `testimonialData`. |
| 8 | `2513:1845` (1440 x 898) | `Home/Faq.astro` | Eyebrow "FAQ"; H1 "Questions"; accordion of 7 questions (What is Plumber?, How is it different from runtime security tools?, Can I trust a fix written by AI?, Does it work on GitHub and GitLab?, What does the grade mean?, What access does Plumber need?, Is it free?); first open by default; built on `starwind/accordion`; FAQPage JSON-LD kept. |
| 9 | `2513:1886` (1440 x 410) | `Home/BookDemo.astro` (id `book-a-demo`) | Eyebrow "Let's look at your pipelines"; H1 "Find the leak before an attacker does."; paragraph; form: Name, Work email, Company, Number of pipelines (optional), submit "Book a demo" (primary, full width). |
| 10 | `2513:1908` Footer | shared `Footer.astro` | Section 5.2. |

Each section is pulled once with `get_design_context` when it is built; the
Figma screenshots taken on 2026-10-26 are the visual targets.

## 7. Responsive rules (Figma is 1440 only)

- Breakpoints: Tailwind defaults plus the existing `xs: 400px`.
- Below `lg`: single column; nav collapses to the dialog; hero CTAs stack;
  stats rows wrap 2-up then 1-up; incident table becomes stacked cards;
  testimonial carousel scrolls horizontally with snap; the YAML block scrolls
  horizontally inside its card.
- Wordmarks use `clamp()` so they never overflow; no horizontal page scroll at
  375px.
- Touch targets at least 44px on nav and accordion triggers.

## 8. Forms and API routes

Two on-demand routes (`export const prerender = false`), Node runtime on Vercel:

- `POST /api/demo` body `{ name, email, company, pipelines?, website }`
  (`website` is the honeypot).
- `POST /api/newsletter` body `{ email, website }`.

Behaviour, shared in `src/lib/formMail.ts`:

1. Reject non-JSON or bodies over 8 KB with 400.
2. If the honeypot is filled, return 200 without sending.
3. Validate: name 2-100 chars, company 1-100, email by a conservative regex,
   pipelines optional up to 50 chars. 400 on failure with a field list.
4. Rate limit: in-memory map keyed by `x-forwarded-for`, 5 requests per 10
   minutes per route (best effort on serverless). 429 on excess.
5. If `RESEND_API_KEY` is unset: 503 `{ error: "unconfigured" }`.
6. Send via `POST https://api.resend.com/emails` with `from: RESEND_FROM`,
   `to: CONTACT_TO_EMAIL` (default `hello@getplumber.io`), `reply_to` set to
   the visitor's email, plain-text body listing the fields. 200 `{ ok: true }`
   on success, 502 on upstream failure.

Client (`src/js/forms.ts`, loaded by the two forms): intercept submit, disable
the button, POST JSON, show inline status text (success, validation errors,
rate limit, "something went wrong"). On 503 show "Email us at
hello@getplumber.io" with a mailto link. Without JavaScript the form posts
nothing; the mailto fallback link is always rendered under the form.

Environment: `.env.example` documents `RESEND_API_KEY`, `RESEND_FROM`,
`CONTACT_TO_EMAIL`. Thibaud sets them in Vercel.

## 9. Content sync

- `siteData.homepageTitle` / `homepageDescription` reflect the new hero.
- `SoftwareAppJsonLd.astro` description updated.
- `src/pages/llms.txt.ts` hero copy updated.
- FAQPage JSON-LD built from the new FAQ data.

## 10. Cleanup (last commit)

Delete: `Hero/PlumberHero.astro`, `Hero/PlumberVideo.jsx`,
`Hero/GitHubHeroStatsBadge.astro` and `src/js/githubHeroStats.ts` (if nothing
else imports them), `Feature/WhyCicdSecurity.astro`, `Feature/TheLoop.astro`,
`Feature/CliVsPlatform.astro`, `Feature/PlumberRadar.astro`,
`Feature/PlumberQuickStart.astro`, `Pricing/PricingHome.astro`,
`Testimonials/Testimonials2.astro`, `Faq/FaqSection.astro`, `Faq/FaqCard.astro`,
`Nav/SectionNav.astro`, `BeforeAfter/BeforeAfterPipeline.astro`,
`SectionDivider` import in index. Keep `Animation/PipelineAnimation.astro`
(used by `/animation-preview`) and `LogoCloud2.astro` (pending work).
Keep the `react` integration (Keystatic admin still needs it).

## 11. Open items (answers can land during spec review or later)

1. "[N] leaks found" in the Proof stats row: real number needed, or the stat is
   dropped.
2. Answers for the six collapsed FAQ questions are not in the Figma. Default:
   adapt from the current `faqData` answers; replace when copy arrives.
3. Links: About us page, App (platform URL), Release notes, Insights.
4. Whether the newsletter should go to a list provider instead of email.

## 12. Verification

- `npm run lint` and `npm run build` pass.
- Each section compared with its Figma screenshot in Chrome through the
  `astro-dev` server at 1440 and 375 wide, dark and light.
- Keyboard: nav, accordion, carousel and forms operable; focus visible.
- `curl` against `/api/demo` and `/api/newsletter` in the dev server covers:
  valid body, validation failure, honeypot, missing key (503).
- Lighthouse accessibility on the home page not below the current score.

Connector budget: 3 of about 20 monthly calls used before implementation;
about 11 more planned (one per section, navbar, footer).

## 13. Commit plan

1. `docs: add landing redesign design spec`
2. `feat(theme): teal tokens, Figma type scale, Geist Mono and HaxrCorp fonts`
3. `feat(shell): new navbar and footer`
4. `feat(home): hero with pixel animation`
5. `feat(home): value proposition and attackers sections`
6. `feat(home): incident log and how it works`
7. `feat(home): one product, proof and faq`
8. `feat(home): book a demo form and mail API routes`
9. `chore(seo): sync homepage copy in metadata and llms.txt`
10. `chore(home): remove replaced landing components`
