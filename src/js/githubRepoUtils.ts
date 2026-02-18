/**
 * Fetch public GitHub repo stats at build time for display (e.g. stars, latest release).
 * Uses GitHub REST API. Optional GITHUB_TOKEN env var increases rate limits.
 */

const GITHUB_API = "https://api.github.com";
const REPO = "getplumber/plumber";

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "Plumber-Website (https://getplumber.io)",
};

function getAuthHeaders(): HeadersInit {
  const token =
    (typeof import.meta.env !== "undefined" && import.meta.env.GITHUB_TOKEN) ||
    (typeof process !== "undefined" && process.env?.GITHUB_TOKEN);
  if (token && typeof token === "string") {
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
}

export interface GitHubRepoInfo {
  stars: number | null;
  latestVersion: string | null;
}

const DEBUG = typeof import.meta.env !== "undefined" && import.meta.env.DEV;

function log(message: string, detail?: unknown) {
  if (DEBUG) {
    console.warn("[getGitHubRepoInfo]", message, detail ?? "");
  }
}

/**
 * Fetches repo metadata (stars) and latest release tag from GitHub.
 * Returns null fields on failure so the UI can hide or fallback.
 */
export async function getGitHubRepoInfo(): Promise<GitHubRepoInfo> {
  const result: GitHubRepoInfo = { stars: null, latestVersion: null };
  const h = getAuthHeaders();

  try {
    const [repoRes, releaseRes] = await Promise.all([
      fetch(`${GITHUB_API}/repos/${REPO}`, { headers: h }),
      fetch(`${GITHUB_API}/repos/${REPO}/releases/latest`, { headers: h }),
    ]);

    if (repoRes.status === 403) {
      log(
        "GitHub API rate limit (403). Set GITHUB_TOKEN in your environment for higher limits.",
        { remaining: repoRes.headers.get("x-ratelimit-remaining") }
      );
    } else if (!repoRes.ok) {
      log("GitHub repo request failed", { status: repoRes.status, url: repoRes.url });
    } else {
      const repo = (await repoRes.json()) as { stargazers_count?: number };
      if (typeof repo.stargazers_count === "number") {
        result.stars = repo.stargazers_count;
      }
    }

    if (releaseRes.status === 404) {
      // No "latest" release (only tags exist). Not an error.
    } else if (!releaseRes.ok) {
      log("GitHub releases/latest request failed", { status: releaseRes.status });
    } else {
      const release = (await releaseRes.json()) as { tag_name?: string };
      if (typeof release.tag_name === "string") {
        result.latestVersion = release.tag_name.replace(/^v/, "");
      }
    }
  } catch (err) {
    log("GitHub fetch error (network or build env)", err);
  }

  return result;
}
