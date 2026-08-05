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
      id: "score",
      title: "Plumber Score",
      description: "Plumber Score documentation",
      icon: "tabler/award",
      sections: [
        {
          id: "plumber-score",
          title: "Plumber Score",
        },
      ],
    },
    {
      id: "api",
      title: "Open Source CLI",
      description: "CLI documentation",
      icon: "tabler/terminal-2",
      // Ordered list of sidebar sections for the 'api' tab
      sections: [
        {
          id: "cli",
          title: "CLI",
          navLinks: [
            { text: "Controls", href: "/docs/use-plumber/controls" },
            { text: "Issues", href: "/docs/use-plumber/issues", indent: true },
          ],
        },
      ],
    },
    {
      id: "main",
      title: "Platform",
      description: "Main documentation",
      icon: "tabler/file-text",
      // Ordered list of sidebar sections for the 'main' tab
      // The "id" of each section should match a folder in the docs content collection
      sections: [
        {
          id: "getting-started",
          title: "Getting Started",
        },
        {
          id: "installation",
          title: "Installation",
        },
        {
          id: "use-plumber",
          title: "Use Plumber",
          navLinks: [{ text: "API Reference", href: "/docs/api-reference" }],
        },
      ],
    },
  ],
};

export default sidebarNavData;
