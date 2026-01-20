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
      id: "main",
      title: "Documentation",
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
          id: "use-r2devops",
          title: "Use R2Devops",
        },
      ],
    },
    {
      id: "api",
      title: "CLI Reference",
      description: "CLI documentation",
      icon: "tabler/terminal-2",
      // Ordered list of sidebar sections for the 'api' tab
      sections: [
        {
          id: "cli",
          title: "CLI",
        },

      ],
    },
   
  ],
};

export default sidebarNavData;