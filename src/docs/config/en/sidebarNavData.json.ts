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
          id: "components",
          title: "Components",
        },
        {
          id: "reference",
          title: "Reference",
        },
      ],
    },
    {
      id: "api",
      title: "API Reference",
      description: "API documentation",
      icon: "tabler/api-app",
      // Ordered list of sidebar sections for the 'api' tab
      sections: [
        {
          id: "endpoints",
          title: "Endpoints",
        },
        {
          id: "authentication",
          title: "Authentication",
        },
      ],
    },
    {
      id: "tutorials",
      title: "Tutorials",
      description: "Step-by-step tutorials",
      icon: "tabler/school",
      // Ordered list of sidebar sections for the 'tutorials' tab
      sections: [
        {
          id: "tips-and-tricks",
          title: "Tips and Tricks",
        },
      ],
    },
  ],
};

export default sidebarNavData;