import { defaultLocale } from "@config/siteSettings.json";
import { getAllPosts } from "@js/blogUtils";
import { docIdToPath, getRoutedDocs } from "@js/llmsTxtUtils";
import type { APIRoute } from "astro";

/**
 * llms.txt — curated markdown index of the site for AI crawlers and answer
 * engines (https://llmstxt.org). The full docs content is in /llms-full.txt.
 */
export const GET: APIRoute = async (context) => {
  const baseUrl = context.site?.toString().replace(/\/$/, "") ?? "";

  const docs = await getRoutedDocs();
  const docsLines = docs
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((doc) => {
      const desc = doc.data.description ? `: ${doc.data.description}` : "";
      return `- [${doc.data.title}](${baseUrl}${docIdToPath(doc.id)})${desc}`;
    });

  const posts = await getAllPosts(defaultLocale, true);
  const blogLines = posts.map(
    (post) => `- [${post.data.title}](${baseUrl}/blog/${post.id}): ${post.data.description}`,
  );

  const content = `# Plumber

> Plumber is an open-source tool that maps your CI/CD pipelines, detects the security leaks attackers exploit, fixes them, and grades your GitLab CI/CD and GitHub Actions setup with a letter grade (A-E). It runs as one continuous loop: map, detect, fix, prove. It checks pipeline composition, container images, dangerous triggers and permissions, and branch protection against a policy file, with documented remediation for every issue found.

The open-source CLI scans a repository locally or in CI (GitLab CI/CD and GitHub Actions share one policy file and the same controls). The Plumber Platform continuously maps, audits, and remediates CI/CD security gaps across whole GitLab and GitHub organizations, for regulatory frameworks such as ISO 27001, NIS2, DORA, and SOC 2.

## Key pages

- [Plumber CLI (homepage)](${baseUrl}/): Open-source CI/CD security CLI for GitHub and GitLab
- [GitHub repository](https://github.com/getplumber/plumber): Source code, releases, and issue tracker
- [Plumber Radar](${baseUrl}/radar): Live CI/CD security scan of public open-source projects

## Documentation

${docsLines.join("\n")}

## Blog

${blogLines.join("\n")}

## Optional

- [Full documentation content](${baseUrl}/llms-full.txt): All docs pages in one file
- [RSS feed](${baseUrl}/rss.xml)
- [Contact](${baseUrl}/contact)
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
