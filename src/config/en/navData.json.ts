/**
 * * Navigation links and call-to-action buttons for the site header.
 * Notes:
 * 1 level of dropdown is supported
 * Items with "hidden: true" stay in the data but are not rendered (their page does not exist yet).
 */

import { PLUMBER_GITHUB_APP_URL } from "@js/plumberGithubRepo";

// types
import { type navCta, type navItem } from "../types/configDataTypes";

const navConfig: navItem[] = [
  {
    text: "About us",
    link: "/about",
    hidden: true,
  },
  {
    text: "Product",
    link: "/#product",
  },
  {
    text: "Docs",
    link: "/docs/getting-started",
  },
  {
    text: "Radar",
    link: "/radar",
  },
  {
    text: "Blog",
    link: "/blog",
  },
  {
    text: "Contact",
    link: "/contact",
  },
];

export const navCtas: navCta[] = [
  {
    text: "Install GitHub agent",
    link: PLUMBER_GITHUB_APP_URL,
    variant: "secondary",
    newTab: true,
  },
  {
    text: "Book a demo",
    link: "/#book-a-demo",
    variant: "primary",
  },
];

export default navConfig;
