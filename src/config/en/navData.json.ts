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
  // TEMPORARY HIDE - EASY TO REVERT - Platform page access removed temporarily
  // {
  //   text: "Platform",
  //   link: "/platform/",
  // },
  {
    text: "Resources",
    megaMenuColumns: [
      {
        title: "Documentation",
        items: [
          // TEMPORARY HIDE - EASY TO REVERT - Platform docs removed temporarily
          // { text: "Platform", link: "/docs/getting-started", icon: "tabler/file-text" },
          { text: "OpenSource CLI", link: "/docs", icon: "tabler/terminal-2" }, // Changed from /docs/cli to /docs
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
    link: "/discord",
  },
];

export default navConfig;
