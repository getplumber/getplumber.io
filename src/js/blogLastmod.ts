import fs from "node:fs";
import path from "node:path";

import { slug } from "github-slugger";

/**
 * Map of blog post URL pathname -> lastmod date (YYYY-MM-DD) for the sitemap.
 *
 * Only blog posts get a `lastmod`: their frontmatter carries a truthful
 * pubDate/updatedDate. Other pages deliberately emit none — a fabricated
 * date (e.g. the build timestamp) changes on every deploy and teaches
 * crawlers to ignore the field.
 *
 * Reads frontmatter from the filesystem because this runs from
 * astro.config.mjs, before the content layer exists. Post URLs replicate
 * the Astro glob-loader id: each path segment slugified with github-slugger
 * ("Hands-on CLI" -> "hands-on-cli", "1.34" -> "134"), locale prefix and
 * trailing "/index" removed.
 */
export function getBlogLastmodByPath(): Map<string, string> {
  const blogRoot = path.resolve("src/data/blog");
  const lastmodByPath = new Map<string, string>();
  if (!fs.existsSync(blogRoot)) return lastmodByPath;

  const mdxFiles: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (/\.(md|mdx)$/.test(entry.name) && !entry.name.startsWith("_"))
        mdxFiles.push(fullPath);
    }
  };
  walk(blogRoot);

  for (const file of mdxFiles) {
    const source = fs.readFileSync(file, "utf-8");
    const pubDate = source.match(/^pubDate:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    const updatedDate = source.match(/^updatedDate:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    const lastmod = updatedDate ?? pubDate;
    if (!lastmod) continue;

    // src/data/blog/en/My Post/index.mdx -> ["en", "My Post"] -> "my-post"
    const segments = path
      .relative(blogRoot, file)
      .replace(/\.(md|mdx)$/, "")
      .split(path.sep)
      .filter((segment) => segment !== "index")
      .slice(1); // drop the locale folder (locale-free URLs for the default locale)
    if (segments.length === 0) continue;

    const postSlug = segments.map((segment) => slug(segment)).join("/");
    lastmodByPath.set(`/blog/${postSlug}`, lastmod);
  }

  return lastmodByPath;
}
