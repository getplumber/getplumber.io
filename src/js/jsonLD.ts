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

    return `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Blogposting",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "${canonicalUrl}"
        },
        "headline": "${postFrontmatter.title}",
        "description": "${postFrontmatter.description}",
        "image": "${image.src}",
        "author": ${JSON.stringify(authorsJsonLd)},
        "datePublished": "${postFrontmatter.pubDate}",
        "dateModified": "${postFrontmatter.updatedDate}"
      }
    </script>`;
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
