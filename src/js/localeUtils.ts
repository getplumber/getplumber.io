import type { CollectionEntry, DataEntryMap } from "astro:content";

import { defaultLocale, locales } from "@/config/siteSettings.json";

/**
 * * returns the current locale gathered from the URL
 * @param url: current URL
 * @returns current locale as a string
 * use like `const currentLocale = getLocaleFromUrl(Astro.url);`
 *
 * This gives you the same result as `Astro.currentLocale` except:
 * - it never returns "undefined", and instead defaults to the defaultLocale
 * - It is useable in this typescript file and other non-astro files
 */
export function getLocaleFromUrl(url: URL): (typeof locales)[number] {
  const [, locale] = url.pathname.split("/");

  //@ts-expect-error element is guaranteed to be an appropriate string
  if (locales.includes(locale)) return locale as (typeof locales)[number];
  return defaultLocale;
}

/**
 * * filters a collection by language
 * @param collection: any[] collection to filter
 * @param locale: string language to filter by
 * @param removeLocale: boolean whether to remove the locale from the URL
 * @returns any[] filtered collection
 *
 * ```ts
 *  import { getAllPosts } from "@/js/blogUtils";
 *  import { filterCollectionByLanguage } from "@/js/i18nUtils";
 *  const posts = await getAllPosts();
 *  const filteredPosts = filterCollectionByLanguage(posts, "de");
 * ```
 *
 * ## How to setup content collection
 *
 * Your content collections should be paths like `src/data/blog/de/my-post.md` and `src/data/blog/en/my-post.md`
 */
export function filterCollectionByLanguage<T extends keyof DataEntryMap>(
  collection: CollectionEntry<T>[],
  locale: (typeof locales)[number],
  removeLocale: boolean = true,
): CollectionEntry<T>[] {
  // check if the passed language is in the languages array
  if (!locales.includes(locale)) {
    console.error(`Language ${locale} not found in locales array`);
    return [];
  }

  const filteredCollection = collection.filter((item) => item.id.startsWith(`${locale}/`));

  // remove locale from URL
  if (removeLocale) {
    filteredCollection.forEach((item) => {
      item.id = removeLocaleFromSlug(item.id);
    });
  }

  // filter the collection by the passed language
  return filteredCollection;
}

/**
 * * removes any instances of the locale from the URL
 * @param slug: string URL to remove locale from
 * @returns string URL with locale removed
 * Useful for content colection subfolders like blog/en/my-post where the slug field will be "en/my-post"
 */
export function removeLocaleFromSlug(slug: string): string {
  // split the URL into parts separated by "/"
  const SlugElements = slug.split("/");

  // map over the URL parts and remove any locales
  const newSlugElements = SlugElements.filter(
    //@ts-expect-error element is guaranteed to be an appropriate string
    (element) => !locales.includes(element),
  );

  // combine the URL parts back into a string
  return newSlugElements.join("/");
}
