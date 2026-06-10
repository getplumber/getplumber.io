import { defaultLocale } from "@config/siteSettings.json";
import { type CollectionEntry, getCollection } from "astro:content";

import { getCanonicalDocsPathname } from "@/docs/js/docsUtils";

/**
 * Shared helpers for the /llms.txt and /llms-full.txt endpoints
 * (https://llmstxt.org — markdown site index for AI crawlers).
 */

/** Docs sections that are actually routed (must match sidebarNavData tabs) */
export const ROUTED_DOCS_SECTIONS = ["getting-started", "installation", "use-plumber", "cli"];

export function docIdToPath(docId: string): string {
  // Shared controls/issues content canonicalizes to its /docs/cli/* URL
  return getCanonicalDocsPathname(`/docs/${docId.replace(/\/index$/, "")}`);
}

/**
 * Routed, non-draft docs for the default locale, with the locale prefix
 * stripped from ids. Unlike filterCollectionByLanguage this does not mutate
 * the cached collection entries (other routes rely on their ids).
 */
export async function getRoutedDocs(): Promise<CollectionEntry<"docs">[]> {
  const docs = await getCollection("docs", ({ data }) => data.draft !== true);
  const localePrefix = `${defaultLocale}/`;
  return docs
    .map((doc) =>
      doc.id.startsWith(localePrefix) ? { ...doc, id: doc.id.slice(localePrefix.length) } : doc,
    )
    .filter((doc) => ROUTED_DOCS_SECTIONS.includes(doc.id.split("/")[0]));
}
