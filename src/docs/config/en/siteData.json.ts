import type { DocsSiteData } from "../types/configDataTypes";

const docsSiteData: DocsSiteData = {
  title: "Plumber Documentation",
  description:
    "Documentation for Plumber - OpenSource compliance CLI & Platform for GitLab CI/CD.",
  navSocials: [
    {
      social: "X formerly known as Twitter",
      link: "https://x.com/getplumber",
      icon: "tabler/brand-x",
    },
    {
      social: "GitHub",
      link: "https://github.com/getplumber",
      icon: "mdi/github",
    },
  ],
  footerSocials: [
    {
      social: "X formerly known as Twitter",
      link: "https://x.com/getplumber",
      icon: "tabler/brand-x",
    },
    {
      social: "GitHub",
      link: "https://github.com/getplumber",
      icon: "tabler/brand-github",
    },
  ],
  // default image for Open Graph / Twitter card (big link preview)
  defaultImage: {
    src: "/social-media-card.svg",
    alt: "Plumber - CI/CD compliance without effort",
  },
  // Your information for SEO purposes
  author: {
    name: "Plumber",
    email: "hello@getplumber.io",
    twitter: "getplumber",
  },
};

export default docsSiteData;
