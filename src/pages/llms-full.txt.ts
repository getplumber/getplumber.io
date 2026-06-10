import { docIdToPath, getRoutedDocs, ROUTED_DOCS_SECTIONS } from "@js/llmsTxtUtils";
import type { APIRoute } from "astro";

/**
 * llms-full.txt — full documentation content in one markdown file for AI
 * crawlers and answer engines (https://llmstxt.org). Indexed in /llms.txt.
 */

// Raw MDX sources keyed by file path (docs collection uses retainBody: false,
// so the body is not available through the content API)
const rawDocs = import.meta.glob<string>("/src/docs/data/docs/en/**/*.{md,mdx}", {
  query: "?raw",
  import: "default",
});

/** Strip MDX-only noise so the output reads as plain markdown */
function cleanMdxBody(source: string): string {
  return (
    source
      // frontmatter
      .replace(/^---\n[\s\S]*?\n---\n/, "")
      // import statements
      .replace(/^import\s.*$/gm, "")
      // MDX comments
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function docIdToFilePath(docId: string): string | undefined {
  const candidates = [
    `/src/docs/data/docs/en/${docId}.mdx`,
    `/src/docs/data/docs/en/${docId}.md`,
    `/src/docs/data/docs/en/${docId}/index.mdx`,
    `/src/docs/data/docs/en/${docId}/index.md`,
  ];
  return candidates.find((path) => path in rawDocs);
}

export const GET: APIRoute = async (context) => {
  const baseUrl = context.site?.toString().replace(/\/$/, "") ?? "";

  const docs = (await getRoutedDocs()).sort(
    (a, b) =>
      ROUTED_DOCS_SECTIONS.indexOf(a.id.split("/")[0]) -
        ROUTED_DOCS_SECTIONS.indexOf(b.id.split("/")[0]) || a.id.localeCompare(b.id),
  );

  const sections: string[] = [];
  for (const doc of docs) {
    const filePath = docIdToFilePath(doc.id);
    if (!filePath) continue;
    const body = cleanMdxBody(await rawDocs[filePath]());
    sections.push(
      `# ${doc.data.title}\n\nSource: ${baseUrl}${docIdToPath(doc.id)}\n${
        doc.data.description ? `\n${doc.data.description}\n` : ""
      }\n${body}`,
    );
  }

  const content = `<!-- Plumber documentation, generated for AI consumption. Index: ${baseUrl}/llms.txt -->\n\n${sections.join("\n\n---\n\n")}\n`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
