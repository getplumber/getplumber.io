import { file, glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";

// Type-check frontmatter using a schema
const blogCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // reference the authors collection https://docs.astro.build/en/guides/content-collections/#defining-collection-references
      authors: z.array(reference("authors")),
      // Transform string to Date object
      pubDate: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      updatedDate: z
        .string()
        .optional()
        .transform((str) => (str ? new Date(str) : undefined)),
      heroImage: image(),
      categories: z.array(z.string().optional()).optional(),
      // mappingKey allows you to match entries across languages for SEO purposes
      mappingKey: z.string().optional(),
      // blog posts will be excluded from build if draft is "true"
      draft: z.boolean().optional(),
    }),
});

// authors
const authorsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/authors" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      avatar: image(),
      about: z.string(),
      email: z.string(),
      authorLink: z.string(), // author page link. Could be a personal website, github, twitter, whatever you want
    }),
});

// other pages
const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/otherPages" }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      // mappingKey allows you to match entries across languages for SEO purposes
      mappingKey: z.string().optional(),
      draft: z.boolean().optional(),
    }),
});

// each code toggle section is it's own content file
const codeToggleCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/codeToggles" }),
  schema: () =>
    z.object({
      language: z.string(),
      order: z.number(),
      icon: z.string().optional(),
      draft: z.boolean().optional(),
    }),
});

const docsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/docs/data/docs" }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      sidebar: z
        .object({
          label: z.string().optional(),
          order: z.number().optional(),
          badge: z
            .object({
              text: z.string(),
              variant: z.enum(["note", "tip", "caution", "danger", "info"]).default("note"),
            })
            .optional(),
        })
        .optional(),
      tableOfContents: z
        .object({
          minHeadingLevel: z.number().min(1).max(6).optional(),
          maxHeadingLevel: z.number().min(1).max(6).optional(),
        })
        .optional(),
      pagefind: z.boolean().optional(),
      mappingKey: z.string().optional(),
      draft: z.boolean().optional(),
    }),
});

export const collections = {
  blog: blogCollection,
  docs: docsCollection,
  authors: authorsCollection,
  otherPages: pagesCollection,
  codeToggles: codeToggleCollection,
};
