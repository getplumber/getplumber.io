import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Plumber",
  // Your website's title and description (meta fields)
  title: "Plumber - CI/CD security for GitHub and GitLab",
  description:
    "Continuously detect and fix the CI/CD security leaks attackers exploit across GitHub and GitLab. Grade your setup A-E, audit-ready for ISO 27001 and NIS2.",

  // Homepage (`/`) — open-source CI/CD security positioning (GitHub + GitLab)
  homepageTitle: "Plumber - Spot & fix CI/CD security leaks | GitHub & GitLab",
  homepageDescription:
    "The open-source tool that maps your pipelines, detects the CI/CD security leaks attackers exploit, and continuously grades your GitHub and GitLab security A-E.",

  // Your information for blog post purposes
  author: {
    name: "Plumber",
    email: "hello@getplumber.io",
    twitter: "getplumber",
  },

  // default image for Open Graph / Twitter card (big link preview)
  defaultImage: {
    src: "/social-media-card.png",
    alt: "Plumber - Spot & fix CI/CD security leaks for GitHub and GitLab",
  },
};

export default siteData;
