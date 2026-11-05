# Plumber - Website

![Plumber](src/assets/images/readme-banner.png)

**The website for Plumber, CI/CD security posture management for GitHub Actions and GitLab CI/CD. Plumber checks every pipeline before it runs, grades it from A to E, and opens the pull request that fixes what it finds. The site is built with Astro, Tailwind CSS, and React and deployed on Vercel.**

[![Plumber Score](https://score.getplumber.io/github.com/getplumber/getplumber.io.svg)](https://score.getplumber.io/github.com/getplumber/getplumber.io)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/getplumber/getplumber.io/badge)](https://scorecard.dev/viewer/?uri=github.com/getplumber/getplumber.io)
[![Deploy Production](https://github.com/getplumber/getplumber.io/actions/workflows/production.yaml/badge.svg)](https://github.com/getplumber/getplumber.io/actions/workflows/production.yaml)
[![Release](https://github.com/getplumber/getplumber.io/actions/workflows/release.yml/badge.svg)](https://github.com/getplumber/getplumber.io/actions/workflows/release.yml)
[![Build](https://github.com/getplumber/getplumber.io/actions/workflows/build.yml/badge.svg)](https://github.com/getplumber/getplumber.io/actions/workflows/build.yml)
[![Lint](https://github.com/getplumber/getplumber.io/actions/workflows/lint.yml/badge.svg)](https://github.com/getplumber/getplumber.io/actions/workflows/lint.yml)
[![Lockfile](https://github.com/getplumber/getplumber.io/actions/workflows/verify-lockfile.yml/badge.svg)](https://github.com/getplumber/getplumber.io/actions/workflows/verify-lockfile.yml)
[![Security Scan](https://github.com/getplumber/getplumber.io/actions/workflows/security.yml/badge.svg)](https://github.com/getplumber/getplumber.io/actions/workflows/security.yml)
[![CodeQL](https://github.com/getplumber/getplumber.io/actions/workflows/codeql.yml/badge.svg)](https://github.com/getplumber/getplumber.io/actions/workflows/codeql.yml)
[![Plumber](https://github.com/getplumber/getplumber.io/actions/workflows/plumber.yml/badge.svg)](https://github.com/getplumber/getplumber.io/actions/workflows/plumber.yml)
[![SEO Audit](https://github.com/getplumber/getplumber.io/actions/workflows/seo-audit.yml/badge.svg)](https://github.com/getplumber/getplumber.io/actions/workflows/seo-audit.yml)
[![Site release](https://img.shields.io/github/v/release/getplumber/getplumber.io?label=site%20release)](https://github.com/getplumber/getplumber.io/releases/latest)
[![Last commit](https://img.shields.io/github/last-commit/getplumber/getplumber.io)](https://github.com/getplumber/getplumber.io/commits)

**Plumber CLI** (the product this site documents):

[![CLI release](https://img.shields.io/github/v/release/getplumber/plumber?label=Plumber%20CLI)](https://github.com/getplumber/plumber/releases/latest)
[![GitHub stars](https://img.shields.io/github/stars/getplumber/plumber?style=flat)](https://github.com/getplumber/plumber)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/getplumber/plumber/badge)](https://scorecard.dev/viewer/?uri=github.com/getplumber/plumber)

> Badge notes: **Plumber Score** and **OpenSSF Scorecard** grade this repository itself: the first is Plumber dogfooding its own GitHub Action against these workflows (threshold 90, on every PR, push to main, weekly and on demand; see the **Plumber** badge for the run), the second is the [OpenSSF](https://scorecard.dev) supply-chain posture score published weekly by `scorecard.yml`. **Security Scan** runs `npm audit` daily; it turns red as soon as a published CVE affects one of this site's dependencies (advisories with no patched release are allowlisted in `.github/npm-audit-allowlist.json`, each with an expiry date). **CodeQL** is GitHub's static analysis on every PR, push to main, and weekly. **Lockfile** checks that every GitHub Action the workflows use is pinned in `.github/workflows/actions.lock`. **Release** is semantic-release tagging a new site version on every push to main (see [Release process](#-release-process)). PRs additionally run **Dependency Review**, which blocks introducing dependencies with known vulnerabilities (no badge: it never runs on `main`).

### Summary of this README

| Section                                                                  |
| ------------------------------------------------------------------------ |
| [Summary](#-summary)                                                     |
| [Quick Start](#-quick-start)                                             |
| [Architecture & Technology Stack](#️-architecture--technology-stack)      |
| [Project Structure](#-project-structure)                                 |
| [Creating Content](#️-creating-content)                                   |
| [Adding a new release blog post](#6-adding-a-new-release-blog-post)      |
| [Creating Documentation Articles](#-creating-documentation-articles)     |
| [Creating Custom Pages](#-creating-custom-pages)                         |
| [Component Patterns](#-component-patterns)                               |
| [Styling & Theming](#-styling--theming)                                  |
| [Search Configuration](#-search-configuration)                           |
| [SEO & AEO Conventions](#-seo--aeo-conventions)                          |
| [Forms & API routes](#-forms--api-routes)                                |
| [Internationalization (i18n)](#-internationalization-i18n)               |
| [Content Management (Keystatic CMS)](#-content-management-keystatic-cms) |
| [Deployment](#-deployment)                                               |
| [Release process](#-release-process)                                     |
| [Development Tips](#️-development-tips)                                   |
| [Content Collections API](#-content-collections-api)                     |
| [Configuration Files](#-configuration-files)                             |
| [Testing Locally](#-testing-locally)                                     |
| [Additional Resources](#-additional-resources)                           |
| [Contributing](#-contributing)                                           |
| [License](#-license)                                                     |
| [Support](#-support)                                                     |

---

## 📋 Summary

This is the marketing and documentation website for **Plumber**, CI/CD security posture management for GitHub Actions and GitLab CI/CD. The product story the site tells, in the words of the home page:

- **Leaking CI/CD pipelines kill your company. Plumber prevents it.** AI now writes your pipelines, and nobody reviews them. A pipeline holds the keys to your code, your cloud and your customer data, and gets reviewed less than any other part of the codebase.
- **One loop, run on every pipeline, every time it changes:** **Map** every pipeline across all your repos, **Find** unpinned third-party actions, tokens with too much access and missing branch protection, **Fix** them with a pull request your team can read, test and reject, and **Grade** every pipeline with a Plumber Score from A to E that can block any merge below a threshold you set.
- **One product, two ways to use it:** the open-source CLI, GitHub Action and GitLab CI component for developers (no setup, no account), and the Platform for organizations (continuous posture across every repo and team, one dashboard, audit-ready reporting, and an AI agent that fixes what it finds).
- **Same checks, same score, on GitHub and GitLab.** Every check Plumber runs is open source: run it on your own pipeline and you get the same grade we do.

Keep that wording in mind when writing new pages: positioning is **CI/CD security**, GitHub and GitLab are always treated equally, and the copy avoids em-dashes.

The website features:

- 📝 **Blog** - release notes, customer stories, research (State of CI/CD Security) and articles about CI/CD security, with an archive for the legacy R2Devops release notes
- 📚 **Documentation** - one tab with Getting Started, Plumber Score, the CLI (GitHub, GitLab, configuration, issues, how the analysis works), the Platform (installation, usage, API reference) and the legacy v1 install guides
- 🎨 **Home page** - the 2026 landing page (hero, value proposition, incident log, how it works, proof, FAQ, book-a-demo form), driven by `src/config/en/homeData.json.ts`
- 📡 **Radar** - `/radar` is rewritten to the separate Plumber Radar app (`vercel.json`), the public scan of GitHub and GitLab projects
- 🔍 **Search** - full-text search powered by Pagefind
- 🤖 **AEO endpoints** - `/llms.txt` and `/llms-full.txt` for AI crawlers, structured data on every page
- ✉️ **Forms** - book a demo and newsletter, delivered through Resend by two API routes
- ✨ **CMS** - Keystatic CMS for content management

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22.23.4+ (matches `engines` in `package.json`; CI and Vercel run the latest Node 22)
- npm 10 (the version CI uses; see [Dependencies & lockfile](#dependencies--lockfile) before touching `package-lock.json`)

### Installation & Setup

1. **Install dependencies:**

   ```bash
   npm ci
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:4321`. Search and the form API routes are the only features that do not work out of the box in dev (see below).

3. **Optional: search in dev.** Pagefind indexes the production build, so run it once and copy the index into `public/`:

   ```bash
   npm run build
   npm run winsearch   # Windows
   npm run osxsearch   # macOS / Linux
   ```

4. **Optional: forms in dev.** Copy `.env.example` to `.env` and fill the Resend values. Without them the API routes answer 503 and the forms show the email fallback, which is the intended local behaviour.

### Available Commands

| Command                        | Action                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `npm run dev`                  | Start local dev server at `localhost:4321`                                       |
| `npm run build`                | Build the production site (Vercel output) and the Pagefind index                 |
| `npm run preview`              | Not supported with the Vercel adapter (see [Testing Locally](#-testing-locally)) |
| `npm run format`               | Fix lint issues and format everything with ESLint and Prettier                   |
| `npm run lint`                 | Run ESLint (the **Lint** check in CI)                                            |
| `npm run seo-audit`            | Run the SEO audit script against a site URL                                      |
| `npm run config-i18n`          | Add a locale (interactive wizard)                                                |
| `npm run remove-keystatic`     | Remove Keystatic CMS if not needed                                               |
| `npm run generate-favicon-ico` | Generate `favicon.ico` from `favicon.svg`                                        |
| `npx astro check`              | Type-check Astro components and TypeScript                                       |

---

## 🏗️ Architecture & Technology Stack

### Core Technologies

- **[Astro 7](https://astro.build)** - static site generator with content collections, on Vite 8 (rolldown)
- **[Tailwind CSS 4](https://tailwindcss.com)** - utility-first CSS, configured in CSS (`@theme`)
- **[React 19](https://react.dev)** - a few interactive islands (via the Astro integration)
- **[TypeScript](https://www.typescriptlang.org)** - type safety, strict schemas for every content collection
- **[MDX](https://mdxjs.com)** - Markdown with components for the blog and the docs

### Key Features & Tools

- **[Expressive Code](https://expressive-code.com)** - code blocks and frames (`ec.config.mjs`), one high-contrast theme per site mode
- **[Keystatic CMS](https://keystatic.com)** - Git-based CMS for the blog, authors and other pages (`/keystatic`)
- **[Pagefind](https://pagefind.app)** - fast static search
- **[Scalar](https://scalar.com)** - the Platform API reference at `/docs/api-reference`, rendered from `public/openapi.yaml`
- **[Astro SEO](https://github.com/jonasmerlin/astro-seo)** and **[astro-icon](https://www.astroicon.dev)** (Tabler icons plus the pixel icons in `src/icons/`)
- **[Resend](https://resend.com)** - email delivery for the book-a-demo and newsletter forms
- **Plausible** - privacy-friendly analytics, proxied through the `/js/script.js` and `/api/event` rewrites in `vercel.json`
- **Motion on Scroll** and the home page reveal script - scroll-triggered animations

### Build & Deployment

- **Deployment**: Vercel (`@astrojs/vercel` adapter), deployed from GitHub Actions with a hash-locked Vercel CLI
- **Image Optimization**: Sharp image service (Vercel's image service is off)
- **Compression**: HTML/JS compression via Playform Compress
- **RSS Feed** and **sitemap** with truthful blog `lastmod` dates
- **IndexNow**: every production deploy pings IndexNow with the sitemap

---

## 📁 Project Structure

```
.
├── .github/
│   ├── workflows/          # CI/CD (see Release process); actions.lock pins every action
│   ├── vercel/             # Isolated, hash-locked Vercel CLI used by the deploy workflows
│   ├── npm-audit-allowlist.json  # Advisories with no fix yet, each with an expiry date
│   └── dependabot.yml      # Weekly npm, GitHub Actions and .github/vercel bumps
├── docs/superpowers/       # Design specs and plans (landing redesign, home numbers sources)
├── public/                 # Static assets
│   ├── favicons/
│   ├── docs/               # Images referenced by the docs
│   ├── openapi.yaml        # Platform API spec rendered at /docs/api-reference
│   ├── robots.txt
│   └── social-media-card.png
├── scripts/                # Utility scripts
│   ├── config-i18n.js      # i18n configuration wizard
│   ├── generate-favicon-ico.js
│   ├── i18n/               # i18n management utilities
│   ├── indexnow-submit.js  # Pings IndexNow after a production deploy
│   ├── npm-audit.mjs       # npm audit with the allowlist (Security Scan workflow)
│   ├── remove-keystatic.js
│   └── seo-audit.js
├── src/
│   ├── assets/             # Images, videos, customer logos (optimized by Astro)
│   ├── components/         # Reusable Astro/React components
│   │   ├── Home/           # The home page sections (Hero, ValueProp, IncidentLog, ...)
│   │   ├── Animation/      # Pipeline animation
│   │   ├── Faq/, Feature/, Pricing/, Testimonials/, LogoCloud/, PostCard/
│   │   ├── Forms/          # Contact, login, signup, password reset forms
│   │   ├── Nav/, Footer/, PageHeader/, SiteLogo/, ThemeToggle/
│   │   ├── ReleaseVersions/  # Version footer for CLI release notes
│   │   ├── Seo/            # Seo, HrefLang, SoftwareAppJsonLd
│   │   └── starwind/       # UI primitives (accordion, dialog, tabs, table, ...)
│   ├── config/             # Site configuration
│   │   ├── en/             # Locale-specific (siteData, homeData, navData, faqData, testimonialData)
│   │   ├── siteSettings.json.ts
│   │   └── translationData.json.ts
│   ├── data/               # Content collections data
│   │   ├── blog/           # Blog posts (by language)
│   │   │   └── en/
│   │   ├── authors/        # Author profiles
│   │   ├── otherPages/     # Additional pages (privacy policy, terms of use)
│   │   ├── issues.ts       # The ISSUE-nnn catalog rendered by the issue pages
│   │   ├── controlIds.ts   # CTRL-nnn ids
│   │   └── issueCodeRedirects.ts
│   ├── docs/               # Documentation system
│   │   ├── components/     # Docs-specific components
│   │   │   └── mdx-components/  # MDX components (Aside, Steps, Tabs, ScoreReport, ...)
│   │   ├── config/en/      # sidebarNavData (tabs and sections), docs siteData, navData
│   │   ├── data/docs/en/   # Documentation content (by language)
│   │   ├── js/             # docsUtils (canonical URLs), sitemapUtils
│   │   ├── layouts/        # Docs layouts
│   │   └── styles/         # Docs-specific styles
│   ├── icons/              # SVG icons (logos, social pixel icons, tabler)
│   ├── js/                 # Utility functions (jsonLD, llmsTxtUtils, blogUtils, forms, ...)
│   ├── layouts/            # BaseLayout, BaseHead, blog layouts, DiscordLayout
│   ├── lib/
│   │   └── formMail.ts     # Shared helpers for the form API routes
│   ├── pages/              # Route-based pages
│   │   ├── index.astro     # Home page (/platform 301s here)
│   │   ├── api/
│   │   │   ├── demo.ts     # POST /api/demo (book a demo)
│   │   │   └── newsletter.ts  # POST /api/newsletter
│   │   ├── blog/
│   │   │   ├── index.astro       # Blog list
│   │   │   ├── archive.astro     # Archived (R2Devops) release notes
│   │   │   └── [...slug].astro   # Blog post
│   │   ├── docs/
│   │   │   ├── [...slug].astro   # Docs pages (/docs itself 301s to /docs/getting-started)
│   │   │   ├── api-reference.astro  # Scalar API reference
│   │   │   └── [section]/issues/[code].astro  # Issue pages (ISSUE-nnn)
│   │   ├── contact.astro
│   │   ├── discord.astro
│   │   ├── animation-preview.astro  # Dev preview of the pipeline animation (not in the sitemap)
│   │   ├── [...page].astro # Other pages (privacy-policy, terms-of-use)
│   │   ├── 404.astro
│   │   ├── llms.txt.ts     # llms.txt index for AI crawlers
│   │   ├── llms-full.txt.ts # Full docs content for AI crawlers
│   │   └── rss.xml.ts      # RSS feed
│   ├── styles/             # Global styles
│   │   ├── global.css
│   │   ├── tailwind-theme.css
│   │   ├── buttons.css
│   │   ├── code-frames.css
│   │   ├── markdown-content.css
│   │   ├── fonts.css
│   │   ├── mos.css
│   │   └── keystatic.css
│   └── content.config.ts   # Content collections schema
├── .env.example            # Resend settings for the form API routes
├── .releaserc.json         # semantic-release configuration
├── astro.config.mjs        # Astro configuration
├── ec.config.mjs           # Expressive Code configuration
├── keystatic.config.tsx    # Keystatic CMS configuration
├── package.json
├── tsconfig.json
└── vercel.json             # Rewrites (Plausible, Radar), headers and 301 redirects
```

---

## ✍️ Creating Content

### Creating Blog Articles

Blog articles use MDX format and are stored in `src/data/blog/[locale]/`.

#### 1. File Structure

Create a folder with your article slug:

```
src/data/blog/en/my-article-name/
├── index.mdx          # Article content
├── heroImage.png      # Hero image (required)
└── other-images.png   # Additional images (optional)
```

#### 2. Article Frontmatter

Every blog article must have frontmatter at the top:

```mdx
---
title: Your Article Title
description: A compelling description for SEO and previews
draft: false
authors:
  - main-author
  - second-author
pubDate: 2026-01-15
updatedDate: 2026-01-20 # Optional
heroImage: ./heroImage.png
categories:
  - ci-cd
  - security
mappingKey: my-article # Optional: for i18n matching
---

Your article content starts here...

## Headings

Write in Markdown/MDX format.

![Alt text](./other-image.png)
```

> ⚠️ **Do not start the body with a `# Title` heading.** The blog layout renders the frontmatter `title` as the page's single `<h1>` automatically; a markdown H1 would create a duplicate. Start your headings at `##`.

#### 3. Frontmatter Fields

| Field             | Type    | Required | Description                                                |
| ----------------- | ------- | -------- | ---------------------------------------------------------- |
| `title`           | string  | ✅       | Article title                                              |
| `description`     | string  | ✅       | SEO description & preview text                             |
| `draft`           | boolean | ❌       | Set to `true` to exclude from build                        |
| `authors`         | array   | ✅       | Array of author IDs (references `src/data/authors/`)       |
| `pubDate`         | date    | ✅       | Publication date (YYYY-MM-DD)                              |
| `updatedDate`     | date    | ❌       | Last update date (also the sitemap `lastmod`)              |
| `heroImage`       | image   | ✅       | Path to hero image                                         |
| `categories`      | array   | ❌       | Array of category strings                                  |
| `mappingKey`      | string  | ❌       | For linking translations                                   |
| `tocHeadingIcons` | object  | ❌       | Map of heading slug to astro-icon name for the sidebar TOC |

#### 4. Adding Images

- **Hero images**: Place in the article folder, reference as `./heroImage.png`
- **Inline images**: Place in the article folder, reference with relative paths
- **Optimized**: All images are automatically optimized by Astro

#### 5. Using Components in Blog Posts

Auto-imported components (no import needed, the list is in `astro.config.mjs`):

- `<Admonition>` - info boxes
- `<ReleaseVersions />` - version footer for CLI release notes (resolves the latest CLI release in the browser)
- `<OriginalAuthor>` - credit for republished articles
- The docs MDX components (`<Aside>`, `<Steps>`, `<Tabs>`, `<Card>`, ...)

For other components, import them:

```mdx
---
title: My Article
---

import CustomComponent from "@components/CustomComponent.astro";

<CustomComponent prop="value" />
```

#### 6. Adding a new release blog post

To announce a new product release, add a top-level post folder named **`release-[version]/`** (Platform) or **`release-cli-[version]/`** (CLI). These posts appear on the main blog page and in the RSS feed.

**Where to add it:** `src/data/blog/[locale]/release-[version]/`

Example for the Platform release "1.5.0":

```
src/data/blog/en/release-1.5.0/
├── index.mdx          # Release notes content
├── heroImage.png      # Hero image (required)
└── screenshot.png     # Optional screenshots
```

Use the same frontmatter as any blog article. Use the **`releases-platform`** category for Platform releases or **`releases-cli`** for CLI releases (the blog page filter buttons match on those exact ids):

```mdx
---
title: "Plumber 1.5 Release - What's New"
description: Short description for SEO and previews
draft: false
authors:
  - plumber
pubDate: 2026-06-10
heroImage: ./heroImage.png
categories:
  - "releases-platform"
---
```

CLI release posts end with `<ReleaseVersions />`, which links the latest CLI release, the GitHub Action and the GitLab component without hard-coding a version. Never write the CLI version number by hand in a post unless the line carries the `pinned plumber version` marker (see [Plumber CLI releases](#plumber-cli-releases-and-the-pin-bump-prs)).

**Note:** Posts in **`archive/`** are _archived_: they only appear on [/blog/archive](/blog/archive), not on the main blog list. Keep **`archive/`** for old/historical release notes (e.g. legacy R2Devops releases).

#### 7. Examples

See existing blog posts in `src/data/blog/en/` for reference:

- `release-1.5.0/index.mdx` - Platform release notes
- `release-cli-0.4/index.mdx` - CLI release notes
- `archive/2.17/index.mdx` - Archived release notes (R2Devops)
- `shai-hulud/index.mdx` - Incident article
- `state-of-cicd-security-2026/index.mdx` - Long-form research article
- `NUMSPOT-use-case/index.mdx` - Customer story

### Creating Authors

Authors are defined in `src/data/authors/[author-id]/`.

**Structure:**

```
src/data/authors/john-doe/
├── index.mdx
└── avatar.jpg
```

**Content (index.mdx):**

```mdx
---
name: John Doe
avatar: ./avatar.jpg
about: DevOps engineer passionate about CI/CD security
email: john@example.com
authorLink: https://johndoe.com
---
```

---

## 📚 Creating Documentation Articles

Documentation articles use MDX and are stored in `src/docs/data/docs/[locale]/`.

#### 1. File Structure

**Option A: Single file**

```
src/docs/data/docs/en/cli/configuration.mdx
```

**Option B: Folder with index (recommended for images)**

```
src/docs/data/docs/en/cli/github/
├── index.mdx
└── img/
    └── screenshot.png
```

**Option C: Nested sections**

```
src/docs/data/docs/en/installation/
├── index.mdx
├── docker-compose.mdx
├── kubernetes.mdx
└── troubleshooting.mdx
```

#### 2. Documentation Frontmatter

```mdx
---
title: Get your first Plumber Score
seoTitle: Get Started with Plumber - Scan your CI/CD in 2 minutes # Optional meta title
description: Install the open-source Plumber CLI and get a security score in under two minutes.
lead: Plumber scans your CI/CD pipelines for security problems and grades them from A to E. # Optional, under the H1
lastUpdated: 2026-10-27 # Optional, shown in the page footer
sidebar:
  label: Getting Started # Label in sidebar (defaults to title)
  order: 1 # Order in sidebar
  badge:
    text: New
    variant: tip # note, tip, caution, danger, info
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 3
pagefind: true # Include in search (default: true)
draft: false # Exclude from build if true
mappingKey: getting-started # For i18n
---

## Your documentation content

Write your docs here in Markdown/MDX.
```

#### 3. Frontmatter Fields

| Field             | Type    | Required | Description                                                                           |
| ----------------- | ------- | -------- | ------------------------------------------------------------------------------------- |
| `title`           | string  | ✅       | Page title (also the visible H1)                                                      |
| `seoTitle`        | string  | ❌       | Meta `<title>` override - use for keyword-rich titles without changing the visible H1 |
| `description`     | string  | ❌       | SEO description                                                                       |
| `lead`            | string  | ❌       | Lead paragraph rendered under the H1                                                  |
| `lastUpdated`     | date    | ❌       | Shown as "Last updated" in the page footer                                            |
| `sidebar.label`   | string  | ❌       | Sidebar text (defaults to title)                                                      |
| `sidebar.order`   | number  | ❌       | Sidebar position                                                                      |
| `sidebar.badge`   | object  | ❌       | Badge with text & variant                                                             |
| `sidebar.hidden`  | boolean | ❌       | Hide from the sidebar; the page still builds                                          |
| `sidebar.grouped` | boolean | ❌       | `false` lifts a page out of its section's sub-list to the parent group level          |
| `sidebar.indent`  | boolean | ❌       | Indent the entry                                                                      |
| `sidebar.icon`    | string  | ❌       | astro-icon name shown next to the entry                                               |
| `tableOfContents` | object  | ❌       | TOC configuration                                                                     |
| `pagefind`        | boolean | ❌       | Include in search (default: true)                                                     |
| `draft`           | boolean | ❌       | Exclude from build                                                                    |
| `mappingKey`      | string  | ❌       | For i18n matching                                                                     |

#### 4. Using MDX Components in Docs

The following components are auto-imported in all documentation files (and in blog posts):

##### Aside / Admonition

```mdx
<Aside variant="note">This is a note callout.</Aside>

<Aside variant="tip">This is a helpful tip!</Aside>

<Aside variant="caution">Be careful with this.</Aside>

<Aside variant="danger">This is dangerous!</Aside>
```

**Variants**: `note`, `tip`, `caution`, `danger`, `info`

##### Badge

```mdx
<Badge variant="tip">New</Badge>
<Badge variant="caution">Deprecated</Badge>
```

##### Button

```mdx
<Button href="/docs/installation">Get Started</Button>
<Button variant="secondary">Learn More</Button>
```

##### Steps

````mdx
<Steps>
1. First, install the dependencies
   ```bash
   npm install
````

2. Then configure your settings
3. Finally, run the build
   </Steps>

````

##### Tabs

```mdx
<Tabs defaultValue="github">
  <TabsList>
    <TabsTrigger value="github">GitHub</TabsTrigger>
    <TabsTrigger value="gitlab">GitLab</TabsTrigger>
  </TabsList>

  <TabsContent value="github">
    ```bash
    GH_TOKEN=... plumber analyze
    ```
  </TabsContent>

  <TabsContent value="gitlab">
    ```bash
    GITLAB_TOKEN=... plumber analyze
    ```
  </TabsContent>
</Tabs>
````

##### Product components

- `<ProviderTabs>` - GitHub / GitLab tabs that remember the visitor's choice across pages
- `<Stats items={[{ value, label }]} />` - the stat row used at the top of Getting Started
- `<ScoreReport score grade status gate />` - a rendered Plumber report
- `<IssuesList />` and `<NewControlsTable />` - generated from `src/data/issues.ts` and `src/data/controlIds.ts`
- `<Card>` / `<CardGrid>` - link cards (icon, badge, links)
- `<DocsFaq>` - FAQ block that also emits FAQPage JSON-LD

#### 5. Documentation Navigation

The sidebar is auto-generated from:

1. The sections listed in `src/docs/config/en/sidebarNavData.json.ts` (one `Documentation` tab: Getting Started, Plumber Score, CLI, then Installation and Usage under the `Platform` group, then the collapsed `Legacy (v1)` section)
2. The folder structure under `src/docs/data/docs/[locale]/`
3. The `sidebar.order` and `sidebar.label` values in frontmatter (label falls back to `title`)

**Tips:**

- Only sections listed in `sidebarNavData.json.ts` are built; add the section there when you add a folder
- Folders become collapsible sections; `index.mdx` files become the section's main page
- A section's `navLinks` adds hand-written entries (Issues, How the analysis works, API Reference)

#### 6. Examples

See existing docs for reference:

- `src/docs/data/docs/en/getting-started/index.mdx` - Getting Started (stats row, cards, score report)
- `src/docs/data/docs/en/plumber-score/` - Plumber Score and the signed score push
- `src/docs/data/docs/en/cli/` - CLI (installation, github, gitlab, configuration, controls-configuration, how-the-analysis-works, reference)
- `src/docs/data/docs/en/installation/` - Platform installation (docker-compose, docker-compose-local, kubernetes, component-update, troubleshooting, reference)
- `src/docs/data/docs/en/use-plumber/` - Platform usage (issues, register-templates, roles-permissions, connect-ai-agent-mcp)
- `src/docs/data/docs/en/legacy/v1/` - v1 install guides kept for existing installations

**Routing note:** the issues content under `use-plumber/` is served at both `/docs/use-plumber/issues*` and `/docs/cli/issues*`; the CLI URL is canonical (see [SEO & AEO Conventions](#-seo--aeo-conventions)). The Controls page was retired on 2026-10-08: controls are met as CTRL-nnn ids on the issue pages and configured on the CLI controls configuration page, and both old `/controls` routes redirect to the issues list.

---

## 🎨 Creating Custom Pages

### Creating a Static Page

Create a new `.astro` file in `src/pages/`:

```astro
---
// src/pages/about.astro
import PageHeader from "@components/PageHeader/PageHeader.astro";
import BaseLayout from "@layouts/BaseLayout.astro";
---

<BaseLayout title="About Us" description="Learn about our mission">
  <section class="site-container py-16">
    <PageHeader eyebrow="About" title="Our story" lead="Why we built Plumber." />
    <p>Content here...</p>
  </section>
</BaseLayout>
```

This creates a route at `/about`. Give the page a `title` and `description`: `BaseLayout` turns them into the meta tags, Open Graph card and canonical URL.

### Creating Dynamic Pages

Use `[param].astro` for dynamic routes:

```astro
---
// src/pages/product/[id].astro
export async function getStaticPaths() {
  return [{ params: { id: "cli" } }, { params: { id: "platform" } }];
}

const { id } = Astro.params;
---

<BaseLayout title={`Product: ${id}`}><!-- Content --></BaseLayout>
```

Pages are prerendered by default. Set `export const prerender = false` only for request-time endpoints such as the form API routes.

---

## 🧩 Component Patterns

### Using Existing Components

The home page is assembled from the sections in `src/components/Home/`, each reading its copy from `src/config/en/homeData.json.ts` so that wording changes never touch markup:

```astro
---
import Hero from "@components/Home/Hero.astro";
import HowItWorks from "@components/Home/HowItWorks.astro";
import Proof from "@components/Home/Proof.astro";
import BookDemo from "@components/Home/BookDemo.astro";
---

<Hero />
<HowItWorks />
<Proof />
<BookDemo />
```

### Component Categories

- **Home** - the landing page sections (Hero, ValueProp, AttackersWalkIn, IncidentLog, HowItWorks, OneProduct, Proof, Faq, BookDemo) and their shared SectionHeading and NoteBanner
- **Animation** - the pipeline animation used on the home page (preview it at `/animation-preview`)
- **Feature / Pricing / Testimonials / LogoCloud / Faq** - section components from the theme, some still used on inner pages
- **Forms** - contact, login, signup and password reset forms
- **PostCard** - blog post cards
- **PageHeader** - eyebrow, uppercase H1 and lead paragraph shared by the blog, archive and error pages
- **Seo** - meta tags, hreflang and the SoftwareApplication JSON-LD
- **SiteLogo / Nav / Footer / ThemeToggle** - chrome
- **starwind** - UI primitives (accordion, dialog, tabs, table, tooltip, ...)

### Creating Custom Components

```astro
---
// src/components/MyComponent/MyComponent.astro
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<div class="my-component">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
  <slot />
</div>

<style>
  .my-component {
    /* Component-scoped styles */
  }
</style>
```

**Usage:**

```astro
---
import MyComponent from "@components/MyComponent/MyComponent.astro";
---

<MyComponent title="Hello" description="World">
  <p>Slotted content</p>
</MyComponent>
```

---

## 🎨 Styling & Theming

### Tailwind Configuration

Tailwind 4 is configured via CSS variables in `src/styles/tailwind-theme.css`:

```css
@theme {
  --color-primary-*: ...;
  --color-secondary-*: ...;
}
```

The 2026 identity (teal accent, pixel icons, Inter and Geist Mono) lives there; the design source is the Figma file referenced at the top of `src/config/en/homeData.json.ts`.

### Global Styles

Located in `src/styles/`:

- `global.css` - base styles, CSS variables
- `buttons.css` - button variants
- `code-frames.css` - Expressive Code frames
- `markdown-content.css` - Markdown rendering styles
- `fonts.css` - font imports
- `mos.css` - Motion on Scroll
- `keystatic.css` - CMS overrides

### Dark Mode

Dark mode is implemented via the `.dark` class on `<html>`. Toggle component: `ThemeToggle.astro`. Expressive Code switches its theme on the same class (`ec.config.mjs`).

---

## 🔍 Search Configuration

Search is powered by Pagefind, built during the production build.

**Configuration:**

- Automatically indexes all pages
- Control indexing with `data-pagefind-ignore` attribute
- Control in docs with `pagefind: false` in frontmatter

**Building search index:**

```bash
npm run build  # astro build, then pagefind indexes .vercel/output/static
```

---

## 🔎 SEO & AEO Conventions

The site carries structured data and answer-engine endpoints. Keep these invariants when adding content:

### Titles & headings

- **Blog**: the layout renders the frontmatter `title` as the only `<h1>`; never start a post body with `# Title`. Titles get a `| Plumber` suffix automatically unless they already contain "Plumber".
- **Docs**: `title` is both the meta title and the visible H1. Use the optional `seoTitle` frontmatter field when the search-engine title should be longer/keyword-richer than the page heading.

### Canonical URLs & redirects

- Shared Platform/CLI docs content (`use-plumber/issues*`) is served at **both** `/docs/use-plumber/*` and `/docs/cli/*`. The **CLI URL is canonical**: `getCanonicalDocsPathname()` in `src/docs/js/docsUtils.ts` sets the canonical tag and must stay in sync with the sitemap filter in `src/docs/js/sitemapUtils.ts`.
- **Never delete a public URL without adding a 301** in `vercel.json` (`redirects` array). That is where public redirects live (`/platform` to `/`, `/admin` to `/keystatic`, old docs paths, trailing slashes). `astro.config.mjs` only holds the two retired Controls routes, which land on the issues lists.
- Rewrites (not redirects) in `vercel.json` serve Plausible under `/js/script.js` and `/api/event`, and the Radar app under `/radar`.

### Structured data (JSON-LD)

- `src/js/jsonLD.ts` - Organization (+ `sameAs` social profiles) & WebSite on every page; BlogPosting on posts.
- `src/components/Seo/SoftwareAppJsonLd.astro` - SoftwareApplication markup on the homepage; keep in sync with product positioning (the description there mirrors the hero and value proposition).
- `src/components/Home/Faq.astro` (home page) and `src/docs/components/mdx-components/DocsFaq.astro` (docs MDX) render FAQ content **and** emit FAQPage JSON-LD. FAQ copy lives in `src/config/en/faqData.json.ts`.
- When emitting JSON-LD that contains HTML, escape `<` (`.replace(/</g, "\\u003c")`), otherwise the HTML compressor fails on the page.

### AI crawler endpoints (AEO)

- `/llms.txt` - curated markdown index (key pages, docs, blog) generated from content collections.
- `/llms-full.txt` - full docs content in one file.
- Both are driven by `src/js/llmsTxtUtils.ts`; its `ROUTED_DOCS_SECTIONS` list must match the sections in `sidebarNavData.json.ts` when docs sections are added or removed.
- `robots.txt` allows all crawlers via `User-agent: *`; do not add per-bot groups (a bot matching a specific group ignores the `*` rules).

### Sitemap and indexing

- The sitemap skips `/animation-preview` and the duplicate Platform docs URLs, and carries a truthful `lastmod` for blog posts (from `pubDate` / `updatedDate`).
- Every production deploy runs `scripts/indexnow-submit.js`, which submits the sitemap URLs to IndexNow (Bing and the AI assistants fed by it). The key file in `public/` is public by design.

### Auditing

- `npm run seo-audit` runs the local audit; the **SEO Audit** workflow runs it weekly against production and on demand against any URL.

---

## 📨 Forms & API routes

The book-a-demo form (home page) and the newsletter form post JSON to two request-time endpoints in `src/pages/api/`:

- `POST /api/demo` - name, work email, company, optional number of pipelines
- `POST /api/newsletter` - email

`src/lib/formMail.ts` holds the shared pieces: a size-capped JSON reader, field validation, a honeypot field (`website`), a best-effort per-IP rate limit, and delivery through the Resend HTTP API to `CONTACT_TO_EMAIL`. The three settings (`RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO_EMAIL`) are read from the function environment at request time and documented in `.env.example`. Without `RESEND_API_KEY` and `RESEND_FROM` the routes answer 503 and the forms fall back to a `mailto:` link to hello@getplumber.io, which is what preview deployments and local development do.

---

## 🌐 Internationalization (i18n)

### Current Setup

- Default language: English (`en`)
- Locale prefix: Disabled for default locale

### Adding a New Language

1. Run the i18n configuration wizard:

   ```bash
   npm run config-i18n
   ```

2. Follow the prompts to add a new locale

3. The script will:
   - Update `astro.config.mjs`
   - Update `keystatic.config.tsx`
   - Update site settings
   - Create content folders for the new locale

### Manual Translation

After adding a locale, translate content by:

1. Copying content from `src/data/blog/en/` to `src/data/blog/[locale]/`
2. Copying docs from `src/docs/data/docs/en/` to `src/docs/data/docs/[locale]/`
3. Updating `src/config/translationData.json.ts`

---

## 📝 Content Management (Keystatic CMS)

### Accessing Keystatic

- **Local development**: `http://localhost:4321/keystatic`
- **Production**: `https://getplumber.io/keystatic` (`/admin` redirects there)

### Configuration

Keystatic is configured in `keystatic.config.tsx`. Current collections:

- `blogEN` - Blog posts (English)
- `authors` - Author profiles
- `otherPagesEN` - Additional pages

Keystatic and `content.config.ts` describe the same frontmatter: when you add a field to one, add it to the other.

### Authentication

- **Local**: No authentication required
- **Production**: Uses Keystatic Cloud (project `plumber/plumber`)

### Removing Keystatic

If you don't need a CMS:

```bash
npm run remove-keystatic
```

---

## 🚀 Deployment

The site is hosted on Vercel and deployed by the two deploy workflows in `.github/workflows/`, which build and deploy from GitHub Actions with the Vercel CLI so that every deploy runs on a pinned, reviewed toolchain.

### Preview deployments

`preview.yaml` runs on every push to a branch other than `main` (Dependabot branches excluded, since bot-triggered runs get no secrets). It pulls the preview environment, runs `vercel build`, deploys with `vercel deploy --prebuilt`, and posts the preview URL as a single comment on the branch's open pull request (updated on every push). A newer push cancels the in-flight preview deploy of the same branch.

### Production deployments

`production.yaml` runs on every push to `main`: `vercel pull --environment=production`, `vercel build --prod`, `vercel deploy --prebuilt --prod`, then the IndexNow ping. Production deploys are serialized and never cancelled mid-flight, so two rapid merges cannot land out of order. Production is only ever deployed from trusted history on this repository (never from a `workflow_run` of a fork).

### The Vercel CLI

The deploy jobs run with `VERCEL_TOKEN` in scope, so the CLI they run is hash-locked in the isolated `.github/vercel/package.json` manifest (`npm ci --prefix .github/vercel`), kept out of the site's own dependency tree and bumped weekly by Dependabot.

### Environment variables

Set in the Vercel project (production and preview environments):

- `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO_EMAIL` for the forms (see [Forms & API routes](#-forms--api-routes))
- Keystatic Cloud needs no variable here; the project is named in `keystatic.config.tsx`

### Other Platforms

To deploy elsewhere, swap the adapter in `astro.config.mjs` and follow Astro's [deployment guides](https://docs.astro.build/en/guides/deploy/). The `vercel.json` rewrites, headers and redirects would need an equivalent.

---

## 🚢 Release process

There is no release branch, release PR or manual version bump. Merging to `main` is the release: the push deploys production and tags a new site version. The sequence, from a change to a published site:

### 1. Branch from `origin/main`

```bash
git fetch origin
git switch -c feat/my-change origin/main
```

Branch from the remote `main`, not a local one: a stale local `main` has already shipped branches that missed recent design changes.

### 2. Write conventional commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org) (`type(scope): subject`). They matter twice: semantic-release reads them to pick the next version, and the generated release notes are made of them. `main` only accepts **rebase merges**, so every commit on a PR lands on `main` as is. Keep each commit conventional; there is no squash step to fix a message later.

| Commit type                                      | Release | Release notes section  |
| ------------------------------------------------ | ------- | ---------------------- |
| `feat`                                           | minor   | Feature                |
| `refactor`                                       | minor   | Code refactoring       |
| `fix`                                            | patch   | Bug fix                |
| `perf`                                           | patch   | Performance            |
| `docs`                                           | patch   | Documentation          |
| `style`                                          | patch   | Design                 |
| `chore`                                          | patch   | Chore tasks            |
| `ci`                                             | patch   | Continuous Integration |
| `i18n`                                           | patch   | Internationalization   |
| `test`                                           | patch   | Test                   |
| `build`, `revert`                                | patch   | (not listed)           |
| any type with `!` or a `BREAKING CHANGE:` footer | major   |                        |
| non-conventional message                         | none    |                        |

Every conventional type releases, because every merge changes the published site. A commit that does not parse as conventional is simply left out, so a PR made only of such commits merges without a release: keep the format.

### 3. Open a pull request

Push the branch and open a PR against `main`. On every push, the checks below run; the **Deploy Preview** workflow also posts the preview URL on the PR, so reviewers see the change on a real Vercel deployment.

| Check             | Workflow                | What it verifies                                                                                  |
| ----------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| ESLint            | `lint.yml`              | `npm run lint`                                                                                    |
| Astro Build       | `build.yml`             | `npm run build` without secrets (also covers Dependabot PRs, which get no preview)                |
| Lockfile          | `verify-lockfile.yml`   | `gh actions-lock --verify`: every `uses:` is pinned in `actions.lock`                             |
| NPM Audit         | `security.yml`          | `node scripts/npm-audit.mjs --audit-level=moderate` and `npm audit --omit=dev --audit-level=high` |
| Dependency Review | `dependency-review.yml` | The PR introduces no dependency with a known vulnerability (moderate and above)                   |
| CodeQL            | `codeql.yml`            | Static analysis of the JavaScript/TypeScript                                                      |
| Plumber           | `plumber.yml`           | Plumber grades this repository's own workflows; fails under 90 points                             |
| Deploy Preview    | `preview.yaml`          | Builds and deploys the branch to a Vercel preview (not for Dependabot branches)                   |

Run the same validation locally before pushing (see [Contributing](#-contributing)): `npm run lint`, `npm run build`, and the two audit commands.

### 4. Merge

The `main` ruleset requires a pull request, allows only the **rebase** merge method, and forbids force pushes and deletion. Rebase-merge once the checks are green. Merged PRs close; the branch can be deleted.

### 5. What happens on `main`

Every push to `main` triggers, in parallel:

- **Deploy Production** (`production.yaml`): builds and deploys to Vercel, then pings IndexNow. The site is live a few minutes after the merge.
- **Release** (`release.yml`): `npx semantic-release` reads the commits since the last tag, computes the next version, creates the Git tag `vX.Y.Z` and the [GitHub Release](https://github.com/getplumber/getplumber.io/releases) with notes grouped by the sections above. Nothing is committed back to `main` (no changelog file, no `package.json` bump, no npm publish: `@semantic-release/npm` is stubbed out), so branch protection stays intact and `package.json`'s `version` field is meaningless. The site version is the latest tag.
- The Lint, Build, Lockfile, Security Scan, CodeQL and Plumber workflows run again on `main`, which keeps the badges above truthful.

Release and production deploy each have their own concurrency group with `cancel-in-progress: false`, so two merges a minute apart produce two tags and two deploys, in order.

### Plumber CLI releases and the pin-bump PRs

The site pins the CLI version in a handful of places (install snippets, the GitHub Action and GitLab component examples, the pipeline animation). Every such line carries a `pinned plumber version` marker comment. When a new CLI version is published, the `Propagate Release` workflow in [getplumber/plumber](https://github.com/getplumber/plumber) checks this repository out, rewrites every marked line, pushes a `release/auto-bump-vX.Y.Z` branch and opens a PR titled `chore(release): bump Plumber pins to vX.Y.Z` as the `plumber-release` GitHub App. Older open auto-bump PRs are closed as superseded.

To ship a CLI release on the site:

1. Review and rebase-merge the auto-bump PR. Its `chore` commit releases a patch version of the site and redeploys production with the new pins.
2. Keep the marker on any new line that hard-codes a CLI version, or the next bump will miss it. Prefer `<ReleaseVersions />` and the `data-plumber-cli-version` attribute (resolved in the browser from the latest GitHub release, see `src/js/plumberCliVersion.ts`) wherever the latest version is what you mean.
3. The Plumber Action this repository runs on itself (`uses: getplumber/plumber@vX.Y.Z` in `plumber.yml`) is bumped by hand in a `ci(plumber):` commit, followed by `gh actions-lock` so the Lockfile check passes.
4. Announce it with a `release-cli-X.Y/` blog post when the release deserves one (see [Adding a new release blog post](#6-adding-a-new-release-blog-post)).

### Dependency updates

Dependabot opens weekly PRs: one grouped PR for npm minor and patch bumps, one PR per major, one for GitHub Actions and one for the Vercel CLI manifest. They go through the same checks (Build stands in for the preview deploy, which they skip). A GitHub Actions bump also changes `actions.lock`; if the Lockfile check fails on such a PR, run `gh actions-lock` on its branch. `conventional-changelog-conventionalcommits` is pinned (see the note in `package.json`) until semantic-release ships a compatible notes generator.

### Rolling back

Revert the offending commit on a branch (`git revert`, a `revert:` commit) and merge it like any change: it deploys and tags a patch release. For an immediate rollback while the revert is in review, promote the previous production deployment from the Vercel dashboard; the next merge to `main` deploys over it.

---

## 🛠️ Development Tips

### Hot Module Replacement (HMR)

Astro provides fast HMR for:

- Astro components
- MDX files
- Styles
- React components

### TypeScript

TypeScript is fully configured. Run type checking:

```bash
npx astro check
```

### Linting & Formatting

```bash
npm run lint      # Check for issues
npm run format    # Auto-fix issues and format with Prettier
```

Prettier (`.prettierrc.mjs`) uses a 100-column width and the Astro and Tailwind plugins; the ESLint config lives in `eslint.config.mjs`.

### Copy conventions

- No em-dashes anywhere in site copy, docs or blog posts: use a hyphen, a colon or a new sentence.
- Positioning is CI/CD security, with GitHub and GitLab treated equally; there are no per-provider landing pages.
- Marketing copy lives in `src/config/en/` (`homeData`, `siteData`, `faqData`, `testimonialData`), not in components.

### Astro 7 notes

- `astro.config.mjs` uses the unified markdown processor so that remark plugins (`astro-auto-import`) and GFM tables keep working.
- Vite 8 does not resolve the `@/` alias in CSS imports on its own, hence the explicit `vite.resolve.alias`.
- CSS minification is pinned to esbuild (`esbuild` is a direct devDependency) because lightningcss cannot parse Tailwind's `theme(reference)` imports in scoped styles.

---

## 📦 Content Collections API

### Querying Blog Posts

```astro
---
import { getCollection } from "astro:content";

// Get all blog posts
const allPosts = await getCollection("blog");

// Filter published posts
const publishedPosts = await getCollection("blog", ({ data }) => {
  return !data.draft;
});

// Get by category
const securityPosts = allPosts.filter((post) => post.data.categories?.includes("security"));
---
```

### Querying Docs

```astro
---
import { getCollection } from "astro:content";

const docs = await getCollection("docs");
---
```

### Rendering Content

```astro
---
import { getEntry, render } from "astro:content";

const post = await getEntry("blog", "my-article-name");
const { Content } = await render(post);
---

<article>
  <h1>{post.data.title}</h1>
  <Content />
</article>
```

---

## 🔧 Configuration Files

### `astro.config.mjs`

Main Astro configuration:

- Site URL, image service, Vercel adapter
- Integrations (auto-import, Expressive Code, MDX, React, icon, Keystatic, sitemap, Compress)
- Markdown settings (unified processor, Shiki with CSS variables)
- i18n configuration
- The two retired Controls redirects (every other redirect is in `vercel.json`)

### `content.config.ts`

Content collections schema:

- Defines validation for frontmatter (blog, authors, docs, otherPages)
- Configures content loaders
- Sets up relationships (e.g. blog posts → authors)

### `ec.config.mjs`

Expressive Code: the two high-contrast themes, the `.dark` selector, frame colours and contrast settings. Kept out of `astro.config.mjs` because the `<Code>` component on the issue pages loads it directly.

### `vercel.json`

Rewrites (Plausible proxy, Radar app), security headers, and every public 301 redirect.

### `.releaserc.json`

semantic-release: the `main` branch, the commit-type to release-type rules and the release notes sections (see [Release process](#-release-process)).

### `package.json`

Dependencies and scripts. Key packages:

- Astro 7.x on Vite 8
- Tailwind CSS 4.x
- React 19.x
- Keystatic CMS, Pagefind (search), Expressive Code, Scalar (API reference)
- Node 22.23.4+ (`engines`); CI and Vercel run the latest Node 22 with npm 10
- `overrides` pin vulnerable transitive dependencies to patched versions; read the `//` notes before changing them

### `tsconfig.json`

TypeScript configuration with path aliases:

- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@js/*` → `src/js/*`
- `@config/*` → `src/config/*`
- `@assets/*`, `@images/*`, `@videos/*` → `src/assets/...`
- `@/*` → `src/*`

---

## 🧪 Testing Locally

### Full Production Build

```bash
npm run build
```

**Note:** With the Vercel adapter, `npm run preview` is not supported. To test the built site locally, serve the static output (e.g. `npx serve .vercel/output/static -p 4321`; the API routes are not served that way) or push the branch and use the Vercel preview URL posted on the PR.

### Test Search

Search only works after running a production build:

```bash
npm run build
npm run winsearch  # or osxsearch
npm run dev
```

---

## 📚 Additional Resources

### Plumber

- **Plumber CLI**: [github.com/getplumber/plumber](https://github.com/getplumber/plumber), the open-source CI/CD security scanner, GitHub Action and GitLab CI component
- **Plumber Platform**: continuous CI/CD security posture for organizations, [book a demo](https://getplumber.io/#book-a-demo)
- **Plumber Radar**: [getplumber.io/radar](https://getplumber.io/radar), the public scan of open-source projects
- **Discord Community**: [getplumber.io/discord](https://getplumber.io/discord)
- **Support Email**: hello@getplumber.io

### Framework Documentation

- [Astro Documentation](https://docs.astro.build)
- [Astro Discord](https://astro.build/chat)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MDX Documentation](https://mdxjs.com)
- [Keystatic Documentation](https://keystatic.com/docs)
- [Expressive Code](https://expressive-code.com)

### Related Tools

- [Pagefind](https://pagefind.app) - Static search
- [Vercel](https://vercel.com/docs) - Deployment platform
- [semantic-release](https://semantic-release.gitbook.io) - Site releases

---

## 🤝 Contributing

When contributing content:

1. Follow the established patterns in existing content and the copy conventions above
2. Use the frontmatter schemas defined in `content.config.ts`
3. Test locally before committing
4. Ensure all images are optimized
5. Run linting: `npm run format`
6. Write conventional commit messages (see [Release process](#-release-process))

### Dependencies & lockfile

CI and Vercel install with **npm 10**. A `package-lock.json` written by npm 11+ omits transitive dependencies of platform-specific optional packages that are not installed locally, and `npm ci` then fails in CI with `Missing: <pkg> from lock file`. Rules:

- Never commit a lockfile written by npm 11+. A plain `npm install` with a newer local npm silently rewrites it.
- To update or regenerate the lockfile, resolve from the registry with npm 10 and without a `node_modules` nearby (npm otherwise rebuilds the lock from the local single-platform tree):

  ```bash
  mkdir /tmp/lockgen && cp package.json /tmp/lockgen && cd /tmp/lockgen
  npx -y npm@10 install --package-lock-only
  cp package-lock.json <repo>/package-lock.json
  ```

- To resolve a CVE, prefer bumping the existing `overrides` entry; add a new override only when a direct dependency update cannot fix it. Dependencies bundled inside another package cannot be fixed by overrides.
- Validate before committing, which is what CI enforces:

  ```bash
  npx -y npm@10 ci --dry-run
  node scripts/npm-audit.mjs --audit-level=moderate
  npm audit --omit=dev --audit-level=high
  npm run lint
  npm run build
  ```

### Changing GitHub workflows

Every action our workflows use is locked in `.github/workflows/actions.lock`: its commit, its owner and repository ids, and the actions it calls in turn. The `Lockfile` check fails a PR whose workflows the lockfile doesn't fully cover.

- After adding a workflow or changing any `uses:`, run `gh actions-lock` from the repository root (install it with `gh extension install github/gh-actions-lock`) and commit the updated lockfile with the workflow change.
- Never edit `actions.lock` by hand.
- Dependabot doesn't onboard a new workflow: that one needs `gh actions-lock` by hand. If a Dependabot bump PR fails the `Lockfile` check, run `gh actions-lock` on its branch.
- Optional, before committing: `gh actions-lock --verify-local --no-fix` checks coverage offline. CI runs the full `gh actions-lock --verify`.
- Review a lockfile change as a dependency change: a changed `commit` is new code that will run, and a changed `owner_id` or `repo_id` means the repository behind the name is not the one we locked.
- Workflows that publish (Release, the deploys) restore no npm cache and keep write permissions at the job level; keep it that way, OpenSSF Scorecard and Plumber both check for it.

---

## 📄 License

See license details at the main Plumber project repository.

---

## 🆘 Support

- **Technical Issues**: Open an issue in the repository
- **Content Questions**: Contact via Discord or support email
- **Theme/Styling**: See `src/styles/` for the theme configuration

---

**Built with ❤️ by the Plumber team**

_Leaking CI/CD pipelines kill your company. Plumber prevents it._
