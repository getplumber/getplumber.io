import { getCollection } from "astro:content";
import type { navMegaDropdownColumn } from "@config/types/configDataTypes";
import { defaultLocale } from "@/docs/config/siteSettings.json";
import { docsRoute } from "@/docs/js/docsUtils";
import { filterCollectionByLanguage } from "@/docs/js/localeUtils";
import { getTranslatedData } from "@/docs/js/translationUtils";

/**
 * Generate docs menu items for the main navbar
 * Returns mega menu columns based on the main tab's sections
 */
export async function generateDocsMenuItems(): Promise<navMegaDropdownColumn[]> {
  // Get all non-draft docs
  const allDocs = await getCollection("docs", ({ data }) => {
    return data.draft !== true;
  });

  // Filter by default locale
  const filteredDocs = filterCollectionByLanguage(allDocs, defaultLocale);

  // Get the main tab's sections from sidebar config
  const sidebarData = getTranslatedData("sidebarNavData", defaultLocale);
  const mainTab = sidebarData.tabs.find((tab) => tab.id === "main");
  const mainTabSections = mainTab?.sections || [];

  // Group docs by section (first segment of doc.id)
  const docsBySection = new Map<string, typeof filteredDocs>();

  filteredDocs.forEach((doc) => {
    const firstSegment = doc.id.split("/")[0];
    if (!docsBySection.has(firstSegment)) {
      docsBySection.set(firstSegment, []);
    }
    docsBySection.get(firstSegment)!.push(doc);
  });

  // Create mega menu columns for each section in the main tab
  const columns: navMegaDropdownColumn[] = mainTabSections
    .map((section) => {
      const sectionDocs = docsBySection.get(section.id) || [];
      
      if (sectionDocs.length === 0) {
        return null;
      }

      // Sort docs by sidebar order, then by title
      const sortedDocs = [...sectionDocs].sort((a, b) => {
        const aOrder = a.data.sidebar?.order;
        const bOrder = b.data.sidebar?.order;

        if (aOrder !== undefined && bOrder !== undefined) {
          return aOrder - bOrder;
        }
        if (aOrder !== undefined) return -1;
        if (bOrder !== undefined) return 1;

        return a.data.title.localeCompare(b.data.title);
      });

      // Create menu items for each doc
      const items = sortedDocs.map((doc) => {
        // Handle index files - use the folder name as the link
        let link = `/${docsRoute}/${doc.id}`;
        if (doc.id.endsWith("/index")) {
          const slugWithoutIndex = doc.id.replace(/\/index$/, "");
          link = `/${docsRoute}/${slugWithoutIndex}`;
        }

        return {
          text: doc.data.sidebar?.label || doc.data.title,
          link: link,
          icon: "tabler/file-text", // Default icon, can be customized
        };
      });

      return {
        title: section.title,
        items: items,
      };
    })
    .filter((col): col is navMegaDropdownColumn => col !== null);

  return columns;
}

