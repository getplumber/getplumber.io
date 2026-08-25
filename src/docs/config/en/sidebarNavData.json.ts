import type { DocsSidebarNavData } from "../types/configDataTypes";

/**
 * Combined sidebar navigation data for the English locale
 */
const sidebarNavData: DocsSidebarNavData = {
  /**
   * Documentation tabs configuration
   * These define the different top-level documentation section tabs
   */
  tabs: [
    {
      id: "api",
      title: "Documentation",
      description: "Plumber documentation",
      icon: "tabler/file-text",
      // Ordered list of sidebar sections for the single 'api' tab
      // The "id" of each section should match a folder in the docs content collection,
      // except 'cli' whose navLinks below drive the /docs/cli/* alias routes
      // generated in src/pages/docs/[...slug].astro:85-104.
      sections: [
        {
          id: "getting-started",
          title: "Getting Started",
        },
        {
          id: "cli",
          title: "CLI",
          navLinks: [
            { text: "Controls", href: "/docs/use-plumber/controls" },
            { text: "Issues", href: "/docs/use-plumber/issues", indent: true },
          ],
        },
        {
          id: "plumber-score",
          title: "Plumber Score",
        },
        {
          id: "installation",
          title: "Installation",
          group: "Platform",
        },
        {
          id: "use-plumber",
          title: "Usage",
          group: "Platform",
        },
      ],
    },
  ],
};

export default sidebarNavData;
