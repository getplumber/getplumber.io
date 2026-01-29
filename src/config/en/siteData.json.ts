import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Plumber",
  // Your website's title and description (meta fields)
  title: "Plumber - CI/CD compliance without effort",
  description:
    "Audit, detect, and remediate drifts — continuously. Be ready for regulatory demands (ISO 27001, NIS2, DORA, SOC 2…).",

  // Your information for blog post purposes
  author: {
    name: "Plumber",
    email: "creator@plumber.com",
    twitter: "Plumber",
  },

  // default image for Open Graph / Twitter card (big link preview)
  defaultImage: {
    src: "/social-media-card.svg",
    alt: "Plumber - CI/CD compliance without effort",
  },
};

export default siteData;
