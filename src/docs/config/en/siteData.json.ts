import type { DocsSiteData } from "../types/configDataTypes";

const docsSiteData: DocsSiteData = {
  title: "Plumber Documentation - OpenSource compliance CLI & Platform for GitLab CI/CD",
  description: "Complete guides to install and use Plumber CLI and Platform.",
  navSocials: [
    {
      social: "X formerly known as Twitter",
      link: "https://x.com/getplumber_io",
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
      link: "https://x.com/getplumber_io",
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
    src: "/social-media-card.png",
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
