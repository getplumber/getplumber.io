#!/usr/bin/env node
/**
 * Refreshes src/data/adopters.json: the open source projects (2k+ stars) that
 * run the Plumber GitHub Action, shown as a logo row on the homepage.
 *
 * Runs as `prebuild`, so every pipeline that builds the site refreshes it.
 * Same discovery and filters as the monorepo's tools/metrics collector:
 *   - GitHub code search for `uses: getplumber/plumber` in workflow files
 *     (public, default-branch, non-fork code only, so every hit has the
 *     workflow merged),
 *   - our own orgs excluded, forks and archived repos dropped,
 *   - one entry per owner, keeping its most-starred repo.
 *
 * Never breaks a build: any failure (no token, rate limit, API down) keeps the
 * committed snapshot. Code search requires authentication, so it reads
 * GITHUB_TOKEN / GH_TOKEN (set in CI) and falls back to `gh auth token` locally.
 * The file is only rewritten when the list itself changed, so a local build
 * does not dirty the tree.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = join(ROOT, "src/data/adopters.json");

const MIN_STARS = 2000;
const OWN_ORGS = new Set(["getplumber", "getplumber-examples"]);
const QUERY = '"uses: getplumber/plumber" path:.github/workflows';
const API = "https://api.github.com";

function resolveToken() {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (fromEnv) return fromEnv;
  try {
    return execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

async function gh(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "getplumber.io-build",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

async function searchRepos(token) {
  const repos = new Set();
  // Code search caps at 1000 results (10 pages of 100).
  for (let page = 1; page <= 10; page++) {
    const q = encodeURIComponent(QUERY);
    const data = await gh(`/search/code?q=${q}&per_page=100&page=${page}`, token);
    for (const item of data.items ?? []) repos.add(item.repository.full_name);
    if (!data.items?.length || page * 100 >= Math.min(data.total_count ?? 0, 1000)) break;
  }
  return [...repos];
}

async function mapLimit(items, limit, fn) {
  const out = [];
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

async function collect(token) {
  const names = (await searchRepos(token)).filter(
    (full) => !OWN_ORGS.has(full.split("/")[0].toLowerCase()),
  );

  // A repo that 404s (deleted, renamed, made private since indexing) is just
  // skipped: without its star count we cannot place it against the threshold.
  const repos = (
    await mapLimit(names, 8, (full) => gh(`/repos/${full}`, token).catch(() => null))
  ).filter((r) => r && !r.fork && !r.archived);

  const byOwner = new Map();
  for (const r of repos) {
    const key = r.owner.login.toLowerCase();
    const best = byOwner.get(key);
    if (!best || r.stargazers_count > best.stargazers_count) byOwner.set(key, r);
  }

  const kept = [...byOwner.values()].filter((r) => r.stargazers_count >= MIN_STARS);

  return mapLimit(kept, 4, async (r) => {
    // Org display names ("Lightpanda") read better than logins ("lightpanda-io").
    let name = r.owner.login;
    if (r.owner.type === "Organization") {
      const org = await gh(`/orgs/${r.owner.login}`, token).catch(() => null);
      if (org?.name) name = org.name;
    }
    return {
      owner: r.owner.login,
      name,
      repo: r.full_name,
      url: r.html_url,
      // Rounded down to the hundred: the site shows "35.6k" anyway, and the
      // raw count moves daily, which would rewrite the file on every build.
      stars: Math.floor(r.stargazers_count / 100) * 100,
      avatar: `https://avatars.githubusercontent.com/u/${r.owner.id}`,
    };
  }).then((list) => list.sort((a, b) => b.stars - a.stars));
}

function readSnapshot() {
  try {
    return JSON.parse(readFileSync(OUTPUT, "utf8"));
  } catch {
    return [];
  }
}

async function main() {
  const snapshot = readSnapshot();
  const token = resolveToken();
  if (!token) {
    console.warn("[adopters] no GitHub token, keeping the committed snapshot");
    return;
  }

  let adopters;
  try {
    adopters = await collect(token);
  } catch (err) {
    console.warn(`[adopters] refresh failed (${err.message}), keeping the committed snapshot`);
    return;
  }

  // An empty result while the snapshot has entries is far more likely a search
  // hiccup than every adopter leaving at once: do not wipe the section.
  if (adopters.length === 0 && snapshot.length > 0) {
    console.warn("[adopters] search returned nothing, keeping the committed snapshot");
    return;
  }

  const serialized = `${JSON.stringify(adopters, null, 2)}\n`;
  if (serialized === `${JSON.stringify(snapshot, null, 2)}\n`) {
    console.log(`[adopters] ${adopters.length} adopters, unchanged`);
    return;
  }
  writeFileSync(OUTPUT, serialized);
  console.log(`[adopters] ${adopters.length} adopters written: ${adopters.map((a) => a.repo).join(", ")}`);
}

main().catch((err) => {
  console.warn(`[adopters] unexpected error (${err.message}), keeping the committed snapshot`);
});
