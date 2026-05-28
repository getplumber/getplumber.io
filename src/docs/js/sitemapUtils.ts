import { siteSettings } from "../config/siteSettings.json";

/** Canonical content folder for controls/issues shared across Platform and CLI tabs */
const PLATFORM_DOCS_PREFIX = "use-plumber";

const docsRoute = (siteSettings.docsRoute || "docs").replace(/^\/|\/$/g, "");

/**
 * Controls and issues are served under both /docs/use-plumber/ and /docs/cli/.
 * Sitemap should list only the CLI URLs for that shared content.
 */
export function isDuplicatePlatformDocsSitemapUrl(pageUrl: string): boolean {
  const pathname = pageUrl.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/";
  const prefix = `/${docsRoute}/${PLATFORM_DOCS_PREFIX}/`;
  if (!pathname.startsWith(prefix)) return false;
  const rest = pathname.slice(prefix.length);
  return rest === "controls" || rest === "issues" || rest.startsWith("issues/");
}
