import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Plumber",
  // Your website's title and description (meta fields)
  title: "Plumber - CI/CD security for GitHub and GitLab",
  description:
    "Continuously detect and fix the CI/CD security leaks attackers exploit across GitHub and GitLab. Grade your setup A-E, audit-ready for ISO 27001 and NIS2.",

  // Homepage (`/`) — open-source CI/CD security positioning (GitHub + GitLab)
  homepageTitle: "Plumber - CI/CD security posture management | GitHub & GitLab",
  homepageDescription:
    "Leaking CI/CD pipelines kill your company. Plumber checks every GitHub and GitLab pipeline before it runs, grades it from A to E, and opens the pull request that fixes what it finds.",

  // Your information for blog post purposes
  author: {
    name: "Plumber",
    email: "hello@getplumber.io",
    twitter: "getplumber",
  },

  // default image for Open Graph / Twitter card (big link preview)
  defaultImage: {
    src: "/social-media-card.png",
    alt: "Plumber - CI/CD security posture management for GitHub and GitLab",
  },
};

export default siteData;
