import { PLUMBER_GITHUB_REPO } from "./plumberGithubRepo";

const GITHUB_API = "https://api.github.com";

const HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

/**
 * Fetches hero GitHub stars and latest release in the browser, then shows the badge only
 * when at least one value is available. No auth token. Uses textContent only.
 */
export function initGitHubHeroStats(): void {
  void run();
}

async function run(): Promise<void> {
  const badgeEl = document.getElementById("gh-hero-stats-badge");
  const starsEl = document.getElementById("gh-stars");
  const starsWrap = badgeEl?.querySelector("[data-gh-stars-wrap]");
  const releaseEl = document.getElementById("gh-release");
  const releaseWrap = badgeEl?.querySelector("[data-gh-release-wrap]");
  const dividerEl = document.getElementById("gh-hero-stats-divider");

  if (!badgeEl || !starsEl || !releaseEl) {
    return;
  }

  const repoUrl = `${GITHUB_API}/repos/${PLUMBER_GITHUB_REPO}`;

  const [starsJson, releaseJson] = await Promise.all([
    fetch(repoUrl, { headers: HEADERS })
      .then((res) => (res.ok ? (res.json() as Promise<{ stargazers_count?: unknown }>) : null))
      .catch(() => null),
    fetch(`${repoUrl}/releases/latest`, { headers: HEADERS })
      .then((res) => {
        if (res.status === 404) return null;
        return res.ok ? (res.json() as Promise<{ tag_name?: string }>) : null;
      })
      .catch(() => null),
  ]);

  let starsOk = false;
  let releaseOk = false;

  if (typeof starsJson?.stargazers_count === "number") {
    starsEl.textContent = starsJson.stargazers_count.toLocaleString();
    starsOk = true;
  } else {
    starsWrap?.classList.add("hidden");
  }

  if (releaseJson && typeof releaseJson.tag_name === "string") {
    const tag = releaseJson.tag_name.replace(/^v/i, "");
    releaseEl.textContent = `v${tag}`;
    releaseOk = true;
  } else {
    releaseWrap?.classList.add("hidden");
  }

  if (!starsOk || !releaseOk) {
    dividerEl?.classList.add("hidden");
  }

  if (starsOk || releaseOk) {
    badgeEl.classList.remove("hidden");
    badgeEl.classList.add("inline-flex");
    badgeEl.removeAttribute("aria-hidden");
  }
}
