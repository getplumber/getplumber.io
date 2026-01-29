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
    text: "OpenSource CLI",
    link: "/",
  },
  {
    text: "Platform",
    link: "/platform/",
  },
  {
    text: "Resources",
    megaMenuColumns: [
      {
        title: "Documentation",
        items: [
          { text: "Platform", link: "/docs/getting-started", icon: "tabler/file-text" },
          { text: "OpenSource CLI", link: "/docs/cli", icon: "tabler/terminal-2" },
        ],
      },
      {
        title: "Blog",
        items: [{ text: "Blog", link: "/blog/", icon: "tabler/news" }],
      },
    ],
  },
  {
    text: "Discord",
    link: "https://discord.getplumber.io",
    newTab: true,
  },
];

export default navConfig;
