/**
 * * Copy, lists and links for the redesigned home page and the site footer.
 * Everything a marketer may want to edit lives here, so wording changes never touch markup.
 * Source: Figma file OEp1QcJ16wgu5JP7ZbfRJh, frame HOME_Last (2026-10-26).
 *
 * Headline convention: "headline" renders muted, "headlineStrong" renders in the foreground
 * colour on its own line (the Figma pattern), unless the section says otherwise.
 */

import { PLUMBER_GITHUB_ACTION_URL, PLUMBER_GITHUB_REPO_URL } from "@js/plumberGithubRepo";

import {
  type Callout,
  type Cta,
  type FooterColumn,
  type Incident,
  type ProductColumn,
  type SocialLink,
  type Stat,
  type Step,
  type YamlLine,
} from "../types/configDataTypes";

// --------------------------------------------------------
// 1. hero (Figma 2513:1347)

export const hero = {
  eyebrow: "CI/CD security posture management",
  headline: "Leaking CI/CD pipelines kill your company.",
  headlineMuted: "Plumber prevents it.",
  ctas: [
    { text: "See on GitHub", link: PLUMBER_GITHUB_REPO_URL, variant: "secondary", newTab: true },
    { text: "Book a demo", link: "/#book-a-demo", variant: "primary" },
  ] as Cta[],
};

// --------------------------------------------------------
// 2. value proposition (Figma 2513:1417)

export const valueProp = {
  headline: "AI now writes your pipelines, and nobody reviews them.",
  headlineMuted:
    "Plumber checks every pipeline before it runs, grades it from A to E, and opens the pull request that fixes what it finds.",
  cta: {
    text: "Get your Plumber Score",
    link: "/docs/getting-started",
    variant: "secondary-trailing",
  } as Cta,
  altLabel: "Or run it yourself:",
  altLink: { text: "Plumber Scan", link: "/docs/cli/installation" },
  overviewTitle: "Coverage and grading overview",
  stats: [
    { value: "A–E", label: "One grade for every pipeline" },
    { value: "GitHub + GitLab", label: "Same checks, same score" },
    { value: "Open source", label: "Verify any grade yourself" },
  ] as Stat[],
};

// --------------------------------------------------------
// 3. attackers walk right in (Figma 2513:1438)

export const attackers = {
  eyebrow: "Why it's happening",
  headline: "AI writes your pipelines.",
  headlineStrong: "Attackers walk right in.",
  text: "Developers now prompt their pipelines instead of writing them. The AI copies the insecure defaults it learned from millions of public repositories. The pipeline still turns green, because green means the build worked, not that it is safe.",
  stats: [
    {
      value: "2x",
      label: "AI-assisted commits leak secrets twice as often",
      source: "GitGuardian, State of Secrets Sprawl 2026",
    },
    {
      value: "48.8%",
      label: "of organizations use AI for at least one CI/CD task",
      source: "GitGuardian, State of Secrets Sprawl 2026",
    },
  ] as Stat[],
  banner: { text: "Your pipeline is green.", strong: "It's also leaking." },
  file: ".github/workflows/deploy.yml",
  issuesBadge: "3 issues found",
  yaml: [
    { n: 1, key: "name: ", value: "Deploy" },
    { n: 2, key: "on: ", value: "[push]" },
    { n: 3, key: "jobs:" },
    { n: 4, key: "  deploy:" },
    { n: 5, key: "    runs-on: ", value: "ubuntu-latest" },
    { n: 6, key: "    permissions: ", value: "write-all", flag: 1 },
    { n: 7, key: "    env:" },
    {
      n: 8,
      key: "      AWS_SECRET_ACCESS_KEY: ",
      value: "${{ secrets.AWS_SECRET_ACCESS_KEY }}",
      flag: 2,
    },
    { n: 9, key: "    steps:" },
    { n: 10, key: "      - uses: ", value: "actions/checkout@v4" },
    { n: 11, key: "      - name: ", value: "Get changed files" },
    { n: 12, key: "        uses: ", value: "tj-actions/changed-files@v45", flag: 3 },
    { n: 13, key: "      - run: ", value: "./deploy.sh" },
  ] as YamlLine[],
  callouts: [
    {
      title: "Token with write access to everything",
      text: "Your pipeline has more access than any engineer.",
    },
    { title: "Static cloud key", text: "One leak hands over your cloud." },
    {
      title: "Unpinned third-party action",
      text: "Whoever controls that tag controls your pipeline.",
    },
  ] as Callout[],
};

// --------------------------------------------------------
// 4. incident log (Figma 2513:1630)

export const incidents = {
  eyebrow: "The numbers behind the blind spot",
  headline: "Attackers moved",
  headlineStrong: "to the pipeline.",
  text: "A pipeline holds the keys to your code, your cloud and your customer data. It has more access than most engineers and gets reviewed less than any other part of the codebase. Attackers know it.",
  logTitle: "Incident log",
  columns: { date: "Date", figure: "Figure", text: "What happened", source: "Source" },
  rows: [
    {
      date: "Oct 2026",
      figure: "52%",
      text: "of 104,500 public projects had at least one CI/CD attack pattern.",
      source: "Plumber Radar Scan",
      sourceLink: "/radar",
    },
    {
      date: "Nov 2026",
      figure: "25,000+",
      text: "public GitHub repos filled with stolen credentials within hours, as the Shai-Hulud 2.0 worm hit Zapier, PostHog and Postman.",
      source: "Wiz Research",
      sourceLink: "https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack",
    },
    {
      date: "Nov 2026",
      figure: "59%",
      text: "of the machines it compromised were CI/CD runners, not laptops.",
      source: "GitGuardian, State of Secrets Sprawl 2026",
      sourceLink: "https://www.gitguardian.com/state-of-secrets-sprawl-report-2026",
    },
    {
      date: "Mar 2025",
      figure: "23,000+",
      text: "repositories ran a hijacked GitHub Action that dumped their CI secrets into public build logs. One unpinned line of YAML was enough.",
      source: "tj-actions/changed-files, GHSA-mrrh-fwg8-r2c3",
      sourceLink: "https://github.com/advisories/GHSA-mrrh-fwg8-r2c3",
    },
    {
      date: "Dec 2024",
      figure: "260,000",
      text: "daily downloads of Ultralytics, a top AI library, when attackers slipped a crypto miner into its release through a branch name its GitHub Actions workflow never checked.",
      source: "BleepingComputer and Wiz",
      sourceLink:
        "https://www.bleepingcomputer.com/news/security/ultralytics-ai-model-hijacked-to-infect-thousands-with-cryptominer/",
    },
  ] as Incident[],
};

// --------------------------------------------------------
// 5. how it works (Figma 2513:1707)

export const howItWorks = {
  eyebrow: "How it works",
  headline: "Plumber finds the leak",
  headlineStrong: "and brings the fix.",
  text: "One loop, run on every pipeline, every time it changes.",
  steps: [
    {
      number: "01",
      title: "Map",
      text: "Discover every pipeline across all your repos, on GitHub and GitLab.",
    },
    {
      number: "02",
      title: "Find",
      text: "Surface unpinned third-party actions, tokens with too much access, and missing branch protection.",
    },
    {
      number: "03",
      title: "Fix",
      text: "AI writes the fix. Plumber's rule-based engine checks every change before your team sees it, then opens the pull request.",
    },
    {
      number: "04",
      title: "Grade",
      text: "Every pipeline gets a Plumber Score from A to E. Set a threshold and block any merge below it.",
    },
  ] as Step[],
  note: "Nothing merges without your review. Every fix arrives as a pull request your team can read, test and reject.",
};

// --------------------------------------------------------
// 6. one product, two ways to use it (Figma 2513:1766)

export const oneProduct = {
  eyebrow: "Choose your path",
  headline: "One product.",
  headlineStrong: "Two ways to use it.",
  text: "Same engine, same score. Pick the entry point that fits how you work.",
  columns: [
    {
      number: "01",
      title: "For Developers",
      text: "Open source. Runs in your terminal, a GitHub Action or GitLab CI. Scan your pipeline and fix issues before they ship. No setup, no account.",
      ctas: [
        {
          text: "Install the GitHub Agent",
          link: PLUMBER_GITHUB_ACTION_URL,
          variant: "secondary",
          newTab: true,
        },
        { text: "Install the CLI", link: "/docs/cli/installation", variant: "secondary-trailing" },
      ],
    },
    {
      number: "02",
      title: "For Organizations",
      text: "Continuous CI/CD security posture across every repo and every team. One dashboard, audit-ready reporting, and an AI agent that fixes what it finds.",
      quote:
        "Securing one pipeline by hand takes about an hour a month. For 500 pipelines, that's $600k per year.",
      ctas: [{ text: "Book a demo", link: "/#book-a-demo", variant: "primary" }],
    },
  ] as ProductColumn[],
};

// --------------------------------------------------------
// 7. proof (Figma 2513:1791)

export const proof = {
  eyebrow: "Trusted by the community, built for scale",
  headline: "Don't take our word for it.",
  headlineStrong: "Check the grade.",
  text: "Every check Plumber runs is open source. Run it on your own pipeline and you'll get the same grade we do.",
  ctas: [
    { text: "View on GitHub", link: PLUMBER_GITHUB_REPO_URL, variant: "primary", newTab: true },
    { text: "Join the Discord", link: "/discord", variant: "secondary", newTab: true },
  ] as Cta[],
  // figures are static for now; docs/superpowers/plans/2026-10-27-home-numbers-sources.md
  // lists the source each one will be queried from
  stats: [
    { value: "100+", label: "open-source projects graded A or B" },
    { value: "25,000+", label: "open-source downloads" },
    { value: "16,644", label: "public projects graded" },
    { value: "250k+", label: "leaks found" },
  ] as Stat[],
};

// --------------------------------------------------------
// 8. FAQ: see faqData.json.ts

export const faqSection = {
  eyebrow: "FAQ",
  headline: "Questions",
};

// --------------------------------------------------------
// 9. book a demo (Figma 2513:1886)

export const bookDemo = {
  eyebrow: "Let's look at your pipelines",
  headline: "Find the leak",
  headlineStrong: "before an attacker does.",
  text: "We'll scan your pipelines, show you their Plumber Score and walk your team through the fixes.",
  fields: {
    name: "Name",
    email: "Work email",
    company: "Company",
    pipelines: "Number of pipelines (optional)",
  },
  submit: "Book a demo",
  fallbackEmail: "hello@getplumber.io",
};

// --------------------------------------------------------
// footer (Figma 2513:2041)

export const footerColumns: FooterColumn[] = [
  {
    title: "Pages",
    links: [
      { text: "Home", link: "/" },
      { text: "Products", link: "/#product" },
      { text: "Radar", link: "/radar" },
      { text: "Docs", link: "/docs/getting-started" },
    ],
  },
  {
    title: "Solutions",
    links: [{ text: "Plumber Radar", link: "/radar" }],
  },
  {
    title: "Resources",
    links: [
      { text: "Release notes", link: `${PLUMBER_GITHUB_REPO_URL}/releases`, newTab: true },
      { text: "Blog", link: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { text: "Privacy policy", link: "/privacy-policy" },
      { text: "Terms of use", link: "/terms-of-use" },
    ],
  },
];

export const footerSocials: SocialLink[] = [
  { text: "GitHub", link: "https://github.com/getplumber", icon: "tabler/brand-github" },
  { text: "Discord", link: "/discord", icon: "tabler/brand-discord" },
  {
    text: "LinkedIn",
    link: "https://www.linkedin.com/company/getplumber",
    icon: "tabler/brand-linkedin",
  },
  { text: "X", link: "https://x.com/getplumber_io", icon: "tabler/brand-x" },
];
