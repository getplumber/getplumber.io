import { type CollectionEntry, getCollection } from "astro:content";

import { locales } from "@/config/siteSettings.json";
import { filterCollectionByLanguage, removeLocaleFromSlug } from "@/js/localeUtils";
import { slugify } from "@/js/textUtils";

// --------------------------------------------------------
/**
 * * get all blog posts in a formatted array
 * @param lang: string (optional) - language to filter by (matching a locale in i18nUtils.ts)
 * @returns all blog posts, filtered for drafts, sorted by date, future posts removed, locale removed from slug, and filtered by language if passed
 *
 * ## Examples
 *
 * ### If not using i18n features
 * ```ts
 * const posts = await getAllPosts();
 * ```
 *
 * ### If using i18n features
 * ```ts
 * const posts = await getAllPosts("en");
 * ```
 * or
 * ```ts
 * const currentLocale = getLocaleFromUrl(Astro.url);
 * const posts = await getAllPosts(currentLocale);
 * ```
 */
export async function getAllPosts(
  lang?: (typeof locales)[number],
): Promise<CollectionEntry<"blog">[]> {
  const posts = await getCollection("blog", ({ data }) => {
    // filter out draft posts
    return data.draft !== true;
  });

  // if a language is passed, filter the posts by that language
  let filteredPosts: CollectionEntry<"blog">[];
  if (lang) {
    // console.log("filtering by language", lang);
    filteredPosts = filterCollectionByLanguage(posts, lang) as CollectionEntry<"blog">[];
    // filteredPosts = posts;
  } else {
    // console.log("no language passed, returning all posts");
    filteredPosts = posts;
  }

  // filter out future posts and sort by date
  const formattedPosts = formatPosts(filteredPosts, {
    filterOutFuturePosts: true,
    sortByDate: true,
    limit: undefined,
    removeLocale: true,
  });

  return formattedPosts;
}

// --------------------------------------------------------
/**
 * * returns all blog posts in a formatted array
 * @param posts: CollectionEntry<"blog">[] - array of posts, unformatted
 * note: this has an optional options object, params below
 * @param filterOutFuturePosts: boolean - if true, filters out future posts
 * @param sortByDate: boolean - if true, sorts posts by date
 * @param limit: number - if number is passed, limits the number of posts returned
 * @returns formatted blog posts according to passed parameters
 */
interface FormatPostsOptions {
  filterOutFuturePosts?: boolean;
  sortByDate?: boolean;
  limit?: number;
  removeLocale?: boolean;
}

export function formatPosts(
  posts: CollectionEntry<"blog">[],
  {
    filterOutFuturePosts = true,
    sortByDate = true,
    limit = undefined,
    removeLocale = true,
  }: FormatPostsOptions = {},
): CollectionEntry<"blog">[] {
  const filteredPosts = posts.reduce((acc: CollectionEntry<"blog">[], post) => {
    const { pubDate } = post.data;

    // filterOutFuturePosts if true
    if (filterOutFuturePosts && new Date(pubDate) > new Date()) return acc;

    // add post to acc
    acc.push(post);

    return acc;
  }, []);

  // now we have filteredPosts
  // sortByDate or randomize
  if (sortByDate) {
    filteredPosts.sort(
      (a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) =>
        new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime(),
    );
  } else {
    filteredPosts.sort(() => Math.random() - 0.5);
  }

  // remove locale from URL
  if (removeLocale) {
    filteredPosts.forEach((post) => {
      // console.log("removing locale from slug for post", post.id);
      post.id = removeLocaleFromSlug(post.id);
    });
  }

  // limit if number is passed
  if (typeof limit === "number") {
    return filteredPosts.slice(0, limit);
  }

  return filteredPosts;
}

// --------------------------------------------------------
/**
 * * returns true if the posts are related to each other
 * @param postOne: CollectionEntry<"blog">
 * @param postTwo: CollectionEntry<"blog">
 * @returns true if the posts are related, false if not
 *
 * note: this currently compares by categories
 *
 * In a production site, you might want to implement a more robust algorithm, choosing related posts based on tags, categories, dates, authors, or keywords.
 * See example: https://blog.codybrunner.com/2024/adding-related-articles-with-astro-content-collections/
 */
export function arePostsRelated(
  postOne: CollectionEntry<"blog">,
  postTwo: CollectionEntry<"blog">,
): boolean {
  // if titles are the same, then they are the same post. return false
  if (postOne.id === postTwo.id) return false;

  // if either post has no categories, return false
  if (
    !postOne.data.categories ||
    !postTwo.data.categories ||
    postOne.data.categories.length === 0 ||
    postTwo.data.categories.length === 0
  )
    return false;

  const postOneCategories = postOne.data.categories
    .filter((category): category is string => typeof category === "string")
    .map((category) => slugify(category));

  const postTwoCategories = postTwo.data.categories
    .filter((category): category is string => typeof category === "string")
    .map((category) => slugify(category));

  // if any tags or categories match, return true
  const categoriesMatch = postOneCategories.some((category) =>
    postTwoCategories.includes(category),
  );

  return categoriesMatch;
}

// --------------------------------------------------------
/**
 * * returns an array of processed items, sorted by count
 * @param items: string[] - array of items to count and sort
 * @returns object with counts of each item in the array
 *
 * note: return looks like { productivity: 2, 'cool-code': 1 }
 */

export function countItems(items: string[]): object {
  // get counts of each item in the array
  const countedItems = items.reduce((acc, item) => {
    const val = acc[slugify(item)] || 0;

    return {
      ...acc,
      [slugify(item)]: val + 1,
    };
  }, {});

  return countedItems;
}

// --------------------------------------------------------
/**
 * * returns array of arrays, sorted by value (high value first)
 * @param jsObj: object - array of "key: value" pairs to sort
 * @returns array of arrays with counts, sorted by count
 *
 * note: return looks like [ [ 'productivity', 2 ], [ 'cool-code', 1 ] ]
 * note: this is used for tag and category cloud ordering
 */
export function sortByValue(jsObj: object): [string, number][] {
  const array: [string, number][] = [];
  for (const i in jsObj) {
    array.push([i, jsObj[i]]);
  }

  const sorted = array.sort((a, b) => {
    return b[1] - a[1];
  });

  // looks like [ [ 'productivity', 2 ], [ 'cool-code', 1 ] ]
  return sorted;
}
