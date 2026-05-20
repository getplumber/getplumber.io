import { getCollection } from "astro:content";

import { defaultLocale, locales, siteSettings } from "@/docs/config/siteSettings.json";
import type { DocsSection, DocsSidebarNavData, DocsTab } from "@/docs/config/types/configDataTypes";

import { filterCollectionByLanguage } from "./localeUtils";
import { getTranslatedData } from "./translationUtils";

type LocaleType = (typeof locales)[number];

export const docsRoute = (siteSettings.docsRoute || "docs").replace(/^\/|\/$/g, "");

/** Canonical content folder for controls/issues shared across Platform and CLI tabs */
export const PLATFORM_DOCS_PREFIX = "use-plumber";

/** URL prefix for Open Source CLI tab aliases of shared content */
export const CLI_DOCS_PREFIX = "cli";

export const CLI_DOCS_TAB_ID = "api";

/** Convert a docs href (e.g. /docs/use-plumber/controls) to a content collection id */
export function hrefToContentId(href: string): string | null {
  const prefix = `/${docsRoute}/`;
  if (!href.startsWith(prefix)) return null;
  return href.slice(prefix.length).replace(/\/$/, "");
}

/** Content ids linked via navLinks for a tab (shared pages outside that tab's folders) */
export function getNavLinkContentIds(tabId: string, locale: LocaleType): string[] {
  const tab = getTabById(tabId, locale);
  if (!tab) return [];

  const ids: string[] = [];
  for (const section of tab.sections) {
    for (const link of section.navLinks ?? []) {
      const contentId = hrefToContentId(link.href);
      if (contentId) ids.push(contentId);
    }
  }
  return ids;
}

/** Whether the current docs tab uses CLI-prefixed URLs for shared content */
export function isCliDocsTab(tabId: string): boolean {
  return tabId === CLI_DOCS_TAB_ID;
}

/** Whether a pathname is under the CLI docs section (e.g. /docs/cli/controls) */
export function isCliDocsPath(pathname: string): boolean {
  const cliSegment = `/${docsRoute}/${CLI_DOCS_PREFIX}/`;
  const cliRoot = `/${docsRoute}/${CLI_DOCS_PREFIX}`;
  return pathname.includes(cliSegment) || pathname.endsWith(cliRoot);
}

/**
 * Rewrite Platform shared-content hrefs to CLI aliases when viewing the Open Source CLI tab.
 * /docs/use-plumber/controls -> /docs/cli/controls
 */
export function resolveSharedDocsHref(href: string, tabId: string): string {
  const platformPrefix = `/${docsRoute}/${PLATFORM_DOCS_PREFIX}`;
  if (isCliDocsTab(tabId) && href.startsWith(platformPrefix)) {
    const suffix = href.slice(platformPrefix.length);
    return `/${docsRoute}/${CLI_DOCS_PREFIX}${suffix}`;
  }
  return href;
}

/** Resolve shared hrefs using the current page pathname (for MDX link overrides) */
export function resolveSharedDocsHrefFromPath(href: string, pathname: string): string {
  if (isCliDocsPath(pathname)) {
    return resolveSharedDocsHref(href, CLI_DOCS_TAB_ID);
  }
  return href;
}

/**
 * Map a content collection id to the URL slug for a given tab.
 * use-plumber/controls -> cli/controls on the CLI tab; unchanged on Platform.
 */
export function contentIdToTabSlug(contentId: string, tabId: string): string {
  if (isCliDocsTab(tabId) && contentId.startsWith(`${PLATFORM_DOCS_PREFIX}/`)) {
    const suffix = contentId.slice(PLATFORM_DOCS_PREFIX.length + 1);
    return `${CLI_DOCS_PREFIX}/${suffix}`;
  }
  return contentId;
}

/** Build a full docs path for a content id within a tab */
export function getDocsPathForContent(contentId: string, tabId: string): string {
  return `/${docsRoute}/${contentIdToTabSlug(contentId, tabId)}`;
}

/** Docs base path (/docs/use-plumber or /docs/cli) from a tab id */
export function getSharedDocsBasePath(tabId: string): string {
  return isCliDocsTab(tabId)
    ? `/${docsRoute}/${CLI_DOCS_PREFIX}`
    : `/${docsRoute}/${PLATFORM_DOCS_PREFIX}`;
}

// Cache for translated tab data to avoid repeated data fetching
const tabCache = new Map<LocaleType, DocsTab[]>();

/**
 * Get translated tabs data with caching
 */
const getTranslatedTabs = (locale: LocaleType): DocsTab[] => {
  if (!tabCache.has(locale)) {
    tabCache.set(locale, getTranslatedData("sidebarNavData", locale).tabs);
  }
  return tabCache.get(locale)!;
};

/**
 * Get tab by ID
 */
export const getTabById = (tabId: string, locale: LocaleType): DocsTab | undefined => {
  return getTranslatedTabs(locale).find((tab) => tab.id === tabId);
};

/**
 * Get sections for a specific tab
 */
export const getTabSections = (tabId: string, locale: LocaleType): DocsSection[] => {
  const tab = getTabById(tabId, locale);
  return tab?.sections || [];
};

/**
 * Get an array of section IDs in the order they should appear in navigation for a specific tab
 */
export const getOrderedSectionIds = (tabId: string, locale: LocaleType): string[] => {
  return getTabSections(tabId, locale).map((section) => section.id);
};

/**
 * Get the section details by ID within a specific tab
 */
export const getSectionById = (
  sectionId: string,
  tabId: string,
  locale: LocaleType,
): DocsSection | undefined => {
  return getTabSections(tabId, locale).find((section) => section.id === sectionId);
};

/**
 * Get the title for a documentation section
 */
export const getSectionTitle = (sectionId: string, tabId: string, locale: LocaleType): string => {
  const section = getSectionById(sectionId, tabId, locale);
  if (section?.title) return section.title;

  // Fallback to title case if section not found
  return sectionId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Get the previous and next pages for a given doc id
 */
export const getAdjacentPages = async (currentId: string, locale: LocaleType, tabId: string) => {
  // Get all non-draft docs
  const allDocs = await getCollection("docs", ({ data }) => {
    return data.draft !== true;
  });

  // Filter docs by locale
  let filteredDocs = filterCollectionByLanguage(allDocs, locale);

  // Filter by tab folder structure (and navLinks shared content)
  const tab = tabId ? getTabById(tabId, locale) : undefined;
  const orderedSectionIds = tab ? getOrderedSectionIds(tabId, locale) : [];
  const sectionIndexMap = new Map(orderedSectionIds.map((id, index) => [id, index]));

  if (tabId && orderedSectionIds.length > 0) {
    const tabSectionIds = new Set(orderedSectionIds);
    const navLinkIds = new Set(getNavLinkContentIds(tabId, locale));

    filteredDocs = filteredDocs.filter((doc) => {
      const firstSegment = doc.id.split("/")[0];
      return tabSectionIds.has(firstSegment) || navLinkIds.has(doc.id);
    });
  }

  const navLinkSectionIndex = orderedSectionIds.length;

  // Sort docs by section order and then by sidebar order
  const sortedDocs = filteredDocs.sort((a, b) => {
    const [aSection] = a.id.split("/");
    const [bSection] = b.id.split("/");

    // Nav-linked shared content (e.g. controls/issues on CLI tab) follows tab sections
    const aSectionIndex = sectionIndexMap.get(aSection) ?? navLinkSectionIndex;
    const bSectionIndex = sectionIndexMap.get(bSection) ?? navLinkSectionIndex;

    // If sections are different, sort by section order
    if (aSectionIndex !== bSectionIndex) {
      return aSectionIndex - bSectionIndex;
    }

    // If in same section, sort by sidebar order if available
    const aOrder = a.data.sidebar?.order;
    const bOrder = b.data.sidebar?.order;

    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder;
    }

    // If only one has order, it should come first
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;

    // If neither has order, sort by title
    return a.data.title.localeCompare(b.data.title, locale);
  });

  // Find the current doc's index
  const currentIndex = sortedDocs.findIndex((doc) => doc.id === currentId);

  return {
    prev:
      currentIndex > 0
        ? {
            slug: contentIdToTabSlug(sortedDocs[currentIndex - 1].id, tabId),
            title:
              sortedDocs[currentIndex - 1].data.sidebar?.label ||
              sortedDocs[currentIndex - 1].data.title,
          }
        : null,
    next:
      currentIndex < sortedDocs.length - 1
        ? {
            slug: contentIdToTabSlug(sortedDocs[currentIndex + 1].id, tabId),
            title:
              sortedDocs[currentIndex + 1].data.sidebar?.label ||
              sortedDocs[currentIndex + 1].data.title,
          }
        : null,
  };
};
