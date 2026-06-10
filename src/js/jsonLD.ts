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

export type JsonLDProps = BlogProps | GeneralProps;

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
  // Organization + WebSite for SEO and AEO (answer engines use entity markup)
  const baseUrl = import.meta.env.SITE?.replace(/\/$/, "") ?? "";
  const organization = {
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
  const webSite = {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: siteData.title,
    url: baseUrl,
    description: siteData.description,
    publisher: { "@id": organization["@id"] },
  };
  const graph = [organization, webSite];
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>`;
}
