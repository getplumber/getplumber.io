import rss from "@astrojs/rss";
import { defaultLocale } from "@config/siteSettings.json";
import { getAllPosts } from "@js/blogUtils";
import { getTranslatedData } from "@js/translationUtils";
import { type CollectionEntry, getCollection } from "astro:content";

const siteData = getTranslatedData("siteData", defaultLocale);

// you can switch the RSS locale here to something else if desired
const rssLocale = defaultLocale;

// this is needed for getAuthorName() and getAuthorEmail() below
const authors: CollectionEntry<"authors">[] = await getCollection("authors");

export async function GET(context) {
  const posts = await getAllPosts(rssLocale, true); // exclude archived Plumber releases from RSS

  // TODO: (maybe?) handle multiple authors instead of just putting the first author's data
  return rss({
    // ex. you can use a stylesheet from "public/rss/styles.xsl"
    // stylesheet: "/rss/styles.xsl",
    // `<title>` field in output xml
    title: siteData.title,
    // `<description>` field in output xml
    description: siteData.description,
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site,
    // media is needed for blog posts. recommended to add atom support
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
      atom: "http://www.w3.org/2005/Atom",
    },
    // add atom:link to be compatible with atom
    customData: `<atom:link href="${context.site}rss.xml" rel="self" type="application/rss+xml" />`,
    // items (each post)
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      author: `${getAuthorEmail(post.data.authors[0].id)} (${getAuthorName(
        post.data.authors[0].id,
      )})`,

      // custom data example, define in XML tags
      // this adds the blog post image
      customData: `<media:content
          type="image/${post.data.heroImage.format == "jpg" ? "jpeg" : "png"}"
          width="${post.data.heroImage.width}"
          height="${post.data.heroImage.height}"
          medium="image"
          url="${getImageUrl(post)}" />
      `,

      // Compute RSS link from post `slug`
      // This example assumes all posts are rendered as `/blog/[slug]` routes
      link: `/blog/${post.id}/`,
    })),
  });
}

// --------------------------------------------------------
// map the post author slug to the author name
const getAuthorName = (authorSlug: string) => {
  let authorName = "unk";
  authors.map((author) => {
    if (author.id === authorSlug) {
      authorName = author.data.name;
    }
  });

  return authorName;
};

// --------------------------------------------------------
// map the post author slug to the author email
const getAuthorEmail = (authorSlug: string) => {
  let authorEmail = "";
  authors.map((author) => {
    if (author.id === authorSlug) {
      authorEmail = author.data.email;
    }
  });

  return authorEmail;
};

// --------------------------------------------------------
// get image url from frontmatter
const getImageUrl = (post: CollectionEntry<"blog">) => {
  let imageUrl = "";
  let imageUrlEnd = "";

  // assumes post.data.heroImage is defined
  imageUrlEnd = post.data.heroImage.src.toString();

  // in dev mode, url is /@fs/full/path/to/project/public/assets/images/image-name.jpg
  if (imageUrlEnd.startsWith("/@fs")) {
    imageUrl = imageUrlEnd;
  }
  // in deployment, imageUrlEnd is correct. Something like "_astro/img-name.hash.jpg"
  else {
    imageUrl = import.meta.env.SITE + imageUrlEnd;
  }

  return imageUrl;
};
