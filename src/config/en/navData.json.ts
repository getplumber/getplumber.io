/**
 * * This file is used to define the navigation links for the site.
 * Notes:
 * 1 level of dropdown is supported
 * Mega menus look best with 3-5 columns, but supports anything > 2 columns
 * If using icons, the icon should be saved in the src/icons folder. If filename is "tabler/icon.svg" then input "tabler/icon"
 * Recommend getting icons from https://tabler.io/icons
 */

// types
import { type navItem } from "../types/configDataTypes";

const navConfig: navItem[] = [
  {
    text: "Open Source CLI",
    link: "/",
  },
  {
    text: "Platform",
    link: "/platform",
  },
  {
    text: "Docs",
    megaMenuColumns: [
      {
        title: "Documentation",
        items: [
          { text: "Platform", link: "/docs/getting-started", icon: "tabler/file-text" },
          { text: "Open Source CLI", link: "/docs/cli", icon: "tabler/terminal-2" },
        ],
      },
    ],
  },
  {
    text: "Blog",
    link: "/blog",
  },
  {
    text: "Discord",
    link: "/discord",
    newTab: true,
  },
];

export default navConfig;
