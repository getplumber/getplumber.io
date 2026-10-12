#!/usr/bin/env node
/**
 * Enforcing `npm audit` with an explicit allowlist for advisories that have no patched
 * release yet.
 *
 * Usage: node scripts/npm-audit.mjs [npm audit flags, e.g. --audit-level=moderate --omit=dev]
 *
 * - Runs `npm audit --json` with the given flags and fails on any advisory at or above the
 *   audit level that is not listed in .github/npm-audit-allowlist.json.
 * - Every allowlist entry carries an `expires` date. An expired entry fails the run, so an
 *   exception is re-evaluated against upstream instead of living forever.
 * - Allowlisted advisories that no longer show up are reported as stale so the entry can go.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const LEVELS = ["info", "low", "moderate", "high", "critical"];

const args = process.argv.slice(2);
const levelArg = args.find((arg) => arg.startsWith("--audit-level="));
const level = levelArg ? levelArg.slice("--audit-level=".length) : "low";
if (!LEVELS.includes(level)) {
  console.error(`Unknown audit level "${level}". Expected one of: ${LEVELS.join(", ")}.`);
  process.exit(2);
}
const threshold = LEVELS.indexOf(level);

const allowlistPath = fileURLToPath(
  new URL("../.github/npm-audit-allowlist.json", import.meta.url),
);
const allowlist = JSON.parse(readFileSync(allowlistPath, "utf8"));
const allowed = new Map(allowlist.map((entry) => [entry.id, entry]));

const spawnOptions = { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 };
// On Windows npm is a .cmd shim, which Node only runs through a shell (as one command string).
const result =
  process.platform === "win32"
    ? spawnSync(["npm", "audit", "--json", ...args].join(" "), { ...spawnOptions, shell: true })
    : spawnSync("npm", ["audit", "--json", ...args], spawnOptions);

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error("npm audit did not return JSON:");
  console.error(result.stdout);
  console.error(result.stderr);
  process.exit(2);
}
if (report.error) {
  console.error(`npm audit failed: ${report.error.summary ?? JSON.stringify(report.error)}`);
  process.exit(2);
}

// Flatten the per-package report into one entry per advisory. Transitive entries only list
// the package names they inherit the problem from; the advisory objects carry the GHSA id.
const advisories = new Map();
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vulnerability.via) {
    if (typeof via !== "object") continue;
    const id = via.url ? via.url.split("/").pop() : String(via.source);
    const entry = advisories.get(id) ?? {
      id,
      severity: via.severity,
      title: via.title,
      url: via.url,
      packages: new Set(),
    };
    entry.packages.add(`${via.name}@${via.range}`);
    advisories.set(id, entry);
  }
}

const today = new Date().toISOString().slice(0, 10);
const failures = [];
const accepted = [];
for (const advisory of advisories.values()) {
  if (LEVELS.indexOf(advisory.severity) < threshold) continue;
  const describe = `${advisory.id} [${advisory.severity}] ${advisory.title} (${[...advisory.packages].join(", ")})`;
  const rule = allowed.get(advisory.id);
  if (!rule) {
    failures.push(`${describe}\n    ${advisory.url}`);
  } else if (!rule.expires || rule.expires < today) {
    failures.push(
      `${describe}\n    allowlist entry expired on ${rule.expires ?? "(no date)"}; re-check upstream for a patched release`,
    );
  } else {
    accepted.push(`${describe}\n    allowlisted until ${rule.expires}: ${rule.reason}`);
  }
}
const stale = allowlist.filter((entry) => !advisories.has(entry.id));

const counts = report.metadata?.vulnerabilities ?? {};
console.log(
  `npm audit: ${counts.total ?? 0} finding(s) in the tree, ${advisories.size} distinct advisories, level >= ${level}`,
);
for (const line of accepted) console.log(`  allowed  ${line}`);
for (const entry of stale) {
  console.log(`  stale    ${entry.id} no longer appears; remove it from the allowlist`);
}
for (const line of failures) console.log(`  FAIL     ${line}`);

if (failures.length > 0) {
  console.error(`\n${failures.length} advisory(ies) at or above "${level}" are not allowlisted.`);
  process.exit(1);
}
console.log("\nnpm audit passed.");
