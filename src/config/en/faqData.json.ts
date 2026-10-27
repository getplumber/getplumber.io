import { type FaqItem } from "../types/configDataTypes";

/**
 * Homepage FAQ (Figma HOME_Last, "Questions" section). Each item feeds the visible
 * accordion and its FAQPage JSON-LD (see src/components/Home/Faq.astro), so keep
 * answers factual and self-contained; they are written to be quotable by search
 * and answer engines.
 *
 * Only the first answer is spelled out in the Figma file. The others are adapted
 * from the previous FAQ and can be replaced when final copy arrives.
 */
export const faqData: FaqItem[] = [
  {
    question: "What is Plumber?",
    answer: `Plumber is CI/CD security posture management that fixes what it finds. It checks how
      every pipeline is built, grades it from A to E, and sends the fix as a pull request your
      team reviews and merges. It runs on GitHub Actions and GitLab CI/CD, and the engine is
      open source on
      <a href="https://github.com/getplumber/plumber" target="_blank" rel="noopener noreferrer">GitHub</a>.`,
  },
  {
    question: "How is it different from runtime security tools?",
    answer: `Runtime tools watch what your application does once it is deployed. Plumber looks at
      the stage before that: how the pipeline itself is built. It checks the workflow and CI
      configuration, the tokens and permissions a job can use, the third-party actions it pulls
      in and the branch protection around it, so a leak is caught before anything ships.`,
  },
  {
    question: "Can I trust a fix written by AI?",
    answer: `Every fix is checked by a deterministic, rule-based engine before your team sees it,
      and it always arrives as a pull request. Nothing is applied to your repository on its own.
      You can read the diff, run your tests, and reject it. The same input produces the same fix,
      so what the agent changed and why stays auditable.`,
  },
  {
    question: "Does it work on GitHub and GitLab?",
    answer: `Yes. Plumber runs the same checks on GitHub Actions workflows and GitLab CI/CD
      pipelines and produces the same A to E grade, so teams that use both get one comparable
      score. The CLI runs locally or in CI, as a
      <a href="/docs/cli/github">GitHub Action</a> or a
      <a href="/docs/cli/gitlab">GitLab CI component</a>.`,
  },
  {
    question: "What does the grade mean?",
    answer: `The Plumber Score is a single A to E grade for the security posture of a pipeline.
      Read it like a credit rating: it turns dozens of technical checks into one letter that
      everyone on the team understands, so you can track CI/CD security over time, set a
      threshold, and block merges that fall below it.`,
  },
  {
    question: "What access does Plumber need?",
    answer: `The open-source CLI needs nothing beyond the repository it scans: it reads the
      pipeline configuration and reports. The platform needs read access to your organization
      to discover pipelines and project settings, and write access only when you want it to open
      the pull requests that carry the fixes.`,
  },
  {
    question: "Is it free?",
    answer: `The CLI is open source and free, with no account required. The platform is free for
      up to 10 projects and includes continuous monitoring, history and the AI agent fixes.
      Larger organizations can
      <a href="/#book-a-demo">book a demo</a> to discuss unlimited projects and dedicated support.`,
  },
];

export default faqData;
