import { type FaqItem } from "../types/configDataTypes";

/**
 * Homepage FAQ. Each item feeds the visible FAQ section and its FAQPage JSON-LD
 * (see src/components/Faq/FaqSection.astro), so keep answers factual and
 * self-contained — they are written to be quotable by search and answer engines.
 *
 * Positioning: open-source CI/CD security that maps, detects, fixes, and grades
 * (the Plumber Score) across GitLab and GitHub. CLI and Platform are covered in a
 * single merged question rather than split across two sets.
 */
export const faqData: FaqItem[] = [
  {
    question: "What is Plumber?",
    answer: `Plumber is an open-source tool that secures your CI/CD pipelines. It maps every
      pipeline, detects the security leaks attackers exploit, fixes them, and grades your setup
      with a letter score (A–E) — continuously, across GitLab CI/CD and GitHub Actions. It runs
      as one loop: map, detect, fix, prove. The code lives on
      <a href="https://github.com/getplumber/plumber" target="_blank" rel="noopener noreferrer">GitHub</a>.`,
  },
  {
    question: "What is the Plumber Score?",
    answer: `The Plumber Score is a single A-to-E grade for the security of your CI/CD setup — as
      easy to read as a credit rating. It turns dozens of technical checks into one number that
      everyone on the team understands, so you can track your CI/CD security posture over time and
      prove it at a glance.`,
  },
  {
    question: "What security issues does Plumber detect?",
    answer: `Plumber scans your pipeline configuration and project settings for the issues attackers
      look for: exposed secrets and unmasked variables, untrusted container registries and mutable
      image tags, unpinned or vulnerable third-party actions, dangerous triggers and over-broad
      permissions, and missing branch protection. Every finding ships with a documented
      <a href="/docs/cli/controls">remediation guide</a>.`,
  },
  {
    question: "How does Plumber fix the issues it finds?",
    answer: `The open-source CLI gives you advisory fixes — clear, step-by-step guidance for every
      issue. On the platform, a deterministic AI agent applies the fix for you and opens a merge
      request; because every action is rule-checked rather than free-form, the result is auditable
      and repeatable instead of a black box.`,
  },
  {
    question: "What is the difference between the open-source CLI and the Plumber Platform?",
    answer: `The <a href="/docs/cli">CLI</a> is free, open source, and scans one pipeline at a time
      from your terminal or CI — ideal for developers. The <a href="/#platform">Platform</a>
      monitors your whole organization continuously: dashboards, history, drift alerts when a
      pipeline's security silently regresses, and AI-agent fixes. It is free for up to 10 projects
      and works across both GitLab and GitHub.`,
  },
  {
    question: "Does Plumber help with security regulations like NIS2 and DORA?",
    answer: `Yes. Plumber checks your CI/CD security against the pipeline and software-supply-chain
      requirements behind ISO 27001, NIS2, DORA, SOC 2, and the EU Cyber Resilience Act (CRA), and
      keeps continuously updated reports of which pipelines meet your security policy and where the
      gaps are — so meeting those regulations becomes a by-product of strong CI/CD security.`,
  },
  {
    question: "How do I get started?",
    answer: `<a href="/docs/cli/installation">Install the Plumber CLI</a> (Homebrew, mise, Docker, or
      a prebuilt binary) and point it at your repository, or connect your GitLab or GitHub
      organization to the platform. The first scan runs in minutes — no agents to install and no
      pipeline changes required. See the <a href="/docs/getting-started">getting started guide</a>.`,
  },
];

export default faqData;
