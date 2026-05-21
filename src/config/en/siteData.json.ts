import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Plumber",
  // Your website's title and description (meta fields)
  title: "Plumber - CI/CD compliance without effort",
  description:
    "Audit, detect, and remediate drifts, continuously. Be ready for regulatory demands (ISO 27001, NIS2, DORA, SOC 2…).",

  // Homepage (`/`) — Open Source CLI positioning (GitLab CI/CD + GitHub Actions)
  homepageTitle:
    "Plumber - CI/CD compliance CLI for GitLab and GitHub",
  homepageDescription:
    "Analyze GitLab CI/CD pipelines and GitHub Actions workflows for security and compliance. One policy file, shared controls, and letter-grade reports for both platforms.",

  // Your information for blog post purposes
  author: {
    name: "Plumber",
    email: "hello@getplumber.io",
    twitter: "getplumber",
  },

  // default image for Open Graph / Twitter card (big link preview)
  defaultImage: {
    src: "/social-media-card.png",
    alt: "Plumber - CI/CD compliance CLI for GitLab and GitHub",
  },
};

export default siteData;
