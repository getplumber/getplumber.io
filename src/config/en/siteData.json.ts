import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Plumber",
  // Your website's title and description (meta fields)
  title: "Plumber - CI/CD security for GitLab and GitHub",
  description:
    "Detect and fix the CI/CD security leaks attackers exploit across GitLab and GitHub, and grade your setup A–E — continuously. Audit-ready for ISO 27001, NIS2, DORA, and SOC 2.",

  // Homepage (`/`) — open-source CI/CD security positioning (GitLab + GitHub)
  homepageTitle: "Plumber - Spot & fix CI/CD security leaks for GitLab & GitHub",
  homepageDescription:
    "The open-source tool that maps your pipelines, detects the CI/CD security leaks attackers exploit, and grades your GitLab and GitHub security A–E — continuously.",

  // Your information for blog post purposes
  author: {
    name: "Plumber",
    email: "hello@getplumber.io",
    twitter: "getplumber",
  },

  // default image for Open Graph / Twitter card (big link preview)
  defaultImage: {
    src: "/social-media-card.png",
    alt: "Plumber - Spot & fix CI/CD security leaks for GitLab and GitHub",
  },
};

export default siteData;
