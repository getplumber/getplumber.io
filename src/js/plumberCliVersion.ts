import { PLUMBER_GITHUB_REPO } from "./plumberGithubRepo";

const GITHUB_API = "https://api.github.com";

const HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

/**
 * Fills every `[data-plumber-cli-version]` element with the latest Plumber CLI
 * release tag, fetched in the browser (no auth token, textContent only), the
 * same way the landing-page hero badge resolves it. Each target renders a
 * skeleton up-front; this swaps in the real `vX.Y.Z`, or falls back to the word
 * "latest" (the link still points at `/releases/latest`) if the lookup fails.
 */
export function initPlumberCliVersion(): void {
  void run();
}

async function run(): Promise<void> {
  const targets = document.querySelectorAll<HTMLElement>("[data-plumber-cli-version]");
  if (targets.length === 0) {
    return;
  }

  const release = await fetch(`${GITHUB_API}/repos/${PLUMBER_GITHUB_REPO}/releases/latest`, {
    headers: HEADERS,
  })
    .then((res) => {
      if (res.status === 404) return null;
      return res.ok ? (res.json() as Promise<{ tag_name?: string }>) : null;
    })
    .catch(() => null);

  const label =
    release && typeof release.tag_name === "string"
      ? `v${release.tag_name.replace(/^v/i, "")}`
      : "latest";

  targets.forEach((el) => {
    el.textContent = label;
  });
}
