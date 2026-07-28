import { type CollectionEntry } from "astro:content";

import { defaultLocale } from "@/config/siteSettings.json";
import { getTranslatedData } from "@/js/translationUtils";

// siteData.title should not change based on locale so this should be fine
const siteData = getTranslatedData("siteData", defaultLocale);

interface GeneralProps {
  type: "general";
}

export interface BlogProps {
  type: "blog";
  postFrontmatter: CollectionEntry<"blog">["data"];
  image: ImageMetadata; // result of getImage() from Seo.astro
  authors: CollectionEntry<"authors">[];
  canonicalUrl: URL;
}

/** One entry in a BreadcrumbList. The final (current page) crumb may omit `item`. */
export interface BreadcrumbItem {
  name: string;
  item?: string;
}

/** One Q&A pair for FAQPage markup. Answers must be visible on the page. */
export interface FaqItem {
  question: string;
  answer: string;
}

export interface DocsProps {
  type: "docs";
  headline: string; // should match the page's visible H1
  description?: string;
  canonicalUrl: URL;
  breadcrumbs: BreadcrumbItem[];
  faq?: FaqItem[];
}

export type JsonLDProps = BlogProps | GeneralProps | DocsProps;

const getBaseUrl = () => import.meta.env.SITE?.replace(/\/$/, "") ?? "";

/** Organization entity reused across the site graphs (publisher / author ref) */
function buildOrganization(baseUrl: string) {
  return {
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: siteData.name,
    url: baseUrl,
    description: siteData.description,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}${siteData.defaultImage.src.startsWith("/") ? "" : "/"}${siteData.defaultImage.src}`,
    },
    // Entity consolidation for knowledge graphs / answer engines
    sameAs: [
      "https://github.com/getplumber",
      "https://www.linkedin.com/company/getplumber",
      "https://x.com/getplumber_io",
    ],
  };
}

/** WebSite entity reused across the site graphs */
function buildWebSite(baseUrl: string, organizationId: string) {
  return {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: siteData.title,
    url: baseUrl,
    description: siteData.description,
    publisher: { "@id": organizationId },
  };
}

export default function jsonLDGenerator(props: JsonLDProps) {
  const { type } = props;
  if (type === "blog") {
    const { postFrontmatter, image, authors, canonicalUrl } = props as BlogProps;

    const authorsJsonLdArray = authors.map((author) => {
      return {
        "@type": "Person",
        name: author.data.name,
        url: author.data.authorLink,
      };
    });

    let authorsJsonLd;

    if (authorsJsonLdArray.length === 1) {
      authorsJsonLd = authorsJsonLdArray[0];
    } else {
      authorsJsonLd = authorsJsonLdArray;
    }

    const baseUrl = import.meta.env.SITE?.replace(/\/$/, "") ?? "";
    const absoluteImage = image.src.startsWith("http") ? image.src : `${baseUrl}${image.src}`;
    const datePublished = postFrontmatter.pubDate instanceof Date
      ? postFrontmatter.pubDate.toISOString()
      : postFrontmatter.pubDate;
    const dateModified = postFrontmatter.updatedDate instanceof Date
      ? postFrontmatter.updatedDate.toISOString()
      : undefined;

    const blogPosting: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl.toString(),
      },
      "headline": postFrontmatter.title,
      "description": postFrontmatter.description,
      "image": absoluteImage,
      "author": authorsJsonLd,
      "publisher": { "@type": "Organization", "name": siteData.name, "url": baseUrl },
      "datePublished": datePublished,
    };

    if (dateModified) {
      blogPosting["dateModified"] = dateModified;
    }

    return `<script type="application/ld+json">${JSON.stringify(blogPosting)}</script>`;
  }

  if (type === "docs") {
    // Per-page TechArticle + BreadcrumbList for documentation pages, bundled
    // into one @graph with the site Organization/WebSite so the entities
    // cross-reference (publisher, isPartOf). Big ranking signal for tool docs.
    const { headline, description, canonicalUrl, breadcrumbs, faq } = props as DocsProps;
    const baseUrl = getBaseUrl();
    const organization = buildOrganization(baseUrl);
    const webSite = buildWebSite(baseUrl, organization["@id"] as string);
    const pageUrl = canonicalUrl.toString();

    const techArticle: Record<string, unknown> = {
      "@type": "TechArticle",
      "@id": `${pageUrl}#article`,
      headline,
      inLanguage: "en",
      url: pageUrl,
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      isPartOf: { "@id": webSite["@id"] },
      author: { "@id": organization["@id"] },
      publisher: { "@id": organization["@id"] },
    };
    if (description) {
      techArticle["description"] = description;
    }

    const breadcrumbList = {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      // Each non-final crumb must carry a resolvable `item` URL (Google
      // flags missing items); the current page is the final crumb.
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        ...(crumb.item ? { item: crumb.item } : {}),
      })),
    };

    const docsGraph: Record<string, unknown>[] = [
      organization,
      webSite,
      techArticle,
      breadcrumbList,
    ];
    if (faq && faq.length > 0) {
      docsGraph.push({
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      });
    }
    // Escape "<" so embedded text can't break the <script> block and so
    // @playform/compress can process the output (see SoftwareAppJsonLd).
    return `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@graph": docsGraph,
    }).replace(/</g, "\\u003c")}</script>`;
  }

  // Organization + WebSite for SEO and AEO (answer engines use entity markup)
  const baseUrl = getBaseUrl();
  const organization = buildOrganization(baseUrl);
  const webSite = buildWebSite(baseUrl, organization["@id"] as string);
  const graph = [organization, webSite];
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>`;
}
