/**
 * Submit the production sitemap URLs to IndexNow (https://www.indexnow.org).
 *
 * IndexNow gives instant-indexing signals to Bing (whose index also feeds
 * AI assistants like ChatGPT search), Seznam, Naver, and Yandex. Run after
 * a production deploy: `node scripts/indexnow-submit.js`.
 *
 * The key is public by design — the protocol verifies ownership by fetching
 * https://<host>/<key>.txt, which is served from public/.
 */

const HOST = "getplumber.io";
const KEY = "9d9a12ab657a0134d92384f186ea6b6c";
const SITEMAP_URL = `https://${HOST}/sitemap-0.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function main() {
  const sitemapResponse = await fetch(SITEMAP_URL);
  if (!sitemapResponse.ok) {
    throw new Error(`Failed to fetch sitemap: HTTP ${sitemapResponse.status}`);
  }
  const xml = await sitemapResponse.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (urls.length === 0) {
    throw new Error("No URLs found in sitemap");
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }),
  });

  // 200 = submitted, 202 = accepted (key validation pending)
  if (response.status === 200 || response.status === 202) {
    console.log(`IndexNow: submitted ${urls.length} URLs (HTTP ${response.status})`);
  } else {
    throw new Error(`IndexNow submission failed: HTTP ${response.status} ${await response.text()}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
