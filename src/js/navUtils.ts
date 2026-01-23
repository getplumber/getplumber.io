import type { navDropdownItem } from "@config/types/configDataTypes";

/**
 * Generate docs menu items for the main navbar
 * Returns a dropdown menu with static menu items
 */
export async function generateDocsMenuItems(): Promise<navDropdownItem> {
  // Return static dropdown menu with two items
  return {
    text: "Docs",
    dropdown: [
      {
        text: "OpenSource CLI",
        link: "/docs/cli",
      },
      {
        text: "Platform",
        link: "/docs/getting-started",
      },
    ],
  };
}


