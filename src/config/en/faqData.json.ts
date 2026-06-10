import { type FaqItem } from "../types/configDataTypes";

/**
 * FAQ content. Each list feeds a visible FAQ section and its FAQPage JSON-LD
 * (see src/components/Faq/FaqSection.astro), so keep answers factual and
 * self-contained — they are written to be quotable by search and answer engines.
 */

// Homepage FAQ — Open Source CLI positioning
export const faqData: FaqItem[] = [
  {
    question: "What is Plumber?",
    answer: `Plumber is an open-source CLI and compliance platform that audits GitLab CI/CD
      pipelines and GitHub Actions workflows for security and compliance issues. It checks
      pipeline composition, container images, triggers, permissions, and branch protection
      against a policy file, and produces a letter-grade report (A–E) with documented
      remediation for every issue found.`,
  },
  {
    question: "Is Plumber free and open source?",
    answer: `Yes. The Plumber CLI is open source and free to use — the code lives on
      <a href="https://github.com/getplumber/plumber" target="_blank" rel="noopener noreferrer">GitHub</a>.
      For teams that need continuous monitoring, drift detection, and audit-ready reporting
      across many projects, there is also the <a href="/platform">Plumber Platform</a>.`,
  },
  {
    question: "How do I check my GitLab CI/CD pipelines for compliance?",
    answer: `<a href="/docs/cli/installation">Install the Plumber CLI</a> (Homebrew, mise, Docker,
      or prebuilt binary), point it at your repository, and it scans your <code>.gitlab-ci.yml</code>
      and project settings against a catalog of
      <a href="/docs/cli/controls">compliance controls</a>. You get a letter grade and a list of
      issues with step-by-step remediation guides.`,
  },
  {
    question: "Does Plumber support GitHub Actions?",
    answer: `Yes. The same CLI scans GitHub Actions workflows with the same policy file and shared
      controls: pinned action SHAs, least-privilege permissions, dangerous triggers, mutable
      image tags, and more. There is also a drop-in
      <a href="/docs/cli/github">GitHub Action</a> with SARIF upload for Code Scanning.`,
  },
  {
    question: "What is CI/CD compliance?",
    answer: `CI/CD compliance means your build and deployment pipelines follow the security
      controls your organization or regulators require — for example pinned dependencies,
      trusted container registries, least-privilege tokens, and protected branches. It is a
      growing requirement of frameworks like ISO 27001, NIS2, DORA, and SOC 2, because
      pipelines hold secrets and ship code to production.`,
  },
  {
    question: "How is Plumber different from a manual pipeline audit?",
    answer: `A manual audit is a snapshot that goes stale as soon as a pipeline changes. Plumber
      encodes the same checks as policy, so every scan is reproducible, runs in CI on every
      change, and catches drift continuously — instead of once a year before the audit.`,
  },
];

// Platform page FAQ — compliance automation positioning
export const platformFaqData: FaqItem[] = [
  {
    question: "What is the Plumber Platform?",
    answer: `The Plumber Platform continuously maps, audits, and remediates CI/CD compliance
      gaps across all your GitLab and GitHub projects. It builds on the open-source
      <a href="/">Plumber CLI</a> engine and adds organization-wide dashboards, drift
      detection, issue ownership, and audit-ready reporting.`,
  },
  {
    question: "Which compliance frameworks does Plumber help with?",
    answer: `Plumber's controls map to the CI/CD and software supply chain requirements of
      ISO 27001, NIS2, DORA, and SOC 2. Instead of preparing evidence manually before each
      audit, you get continuously updated reports showing which pipelines meet your policy
      and where the gaps are.`,
  },
  {
    question: "How do I check if my GitLab pipelines are ISO 27001 compliant?",
    answer: `Connect your GitLab group to Plumber and it audits every project's CI/CD
      configuration against controls aligned with ISO 27001's supply chain and access
      management requirements — trusted image sources, protected branches, least-privilege
      tokens, reviewed pipeline changes. Each violation becomes a tracked issue with a
      remediation guide.`,
  },
  {
    question: "What is compliance drift detection?",
    answer: `Drift is when a pipeline that used to be compliant silently stops being compliant —
      someone adds an unpinned dependency, disables a protection, or hardcodes a job. Plumber
      re-audits continuously, so drift is flagged within minutes of the change instead of
      being discovered months later during an audit.`,
  },
  {
    question: "What is the difference between the Plumber Platform and the open-source CLI?",
    answer: `The <a href="/">CLI</a> is free, open source, and scans one repository at a time —
      ideal for developers and CI jobs. The Platform manages compliance across your whole
      organization: continuous monitoring of every project, dashboards, drift alerts, issue
      assignment, and exportable audit evidence.`,
  },
  {
    question: "How long does it take to get started?",
    answer: `Minutes. Connect your GitLab or GitHub organization, and Plumber maps your projects
      and runs its first audit automatically — no agents to install and no pipeline changes
      required. See the <a href="/docs/getting-started">getting started guide</a>.`,
  },
];

export default faqData;
