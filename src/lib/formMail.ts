/**
 * Shared helpers for the form API routes (/api/demo, /api/newsletter):
 * JSON parsing with a size cap, field validation, a best-effort per-IP rate limit,
 * and delivery through the Resend HTTP API.
 *
 * Environment (see .env.example): RESEND_API_KEY, RESEND_FROM, CONTACT_TO_EMAIL, read from
 * the function's environment at request time. Without RESEND_API_KEY and RESEND_FROM the
 * routes answer 503 so forms can fall back to a mailto link in preview and local development.
 */

export type Fields = Record<string, string>;

export interface FieldRule {
  min?: number;
  max: number;
  email?: boolean;
  optional?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const MAX_BODY_BYTES = 8192;

const hits = new Map<string, number[]>();
const PRUNE_ABOVE = 500;

/** True when the key made more than LIMIT requests inside the sliding window. */
export function rateLimited(key: string): boolean {
  const now = Date.now();
  if (hits.size > PRUNE_ABOVE) {
    // drop the clients whose last request left the window, so the map cannot grow for
    // the life of the instance
    for (const [other, times] of hits) {
      if (now - (times[times.length - 1] ?? 0) >= WINDOW_MS) hits.delete(other);
    }
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > LIMIT;
}

/** Parses a small JSON object body; every value is coerced to a trimmed string. */
export async function readJson(request: Request): Promise<Fields | null> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return null;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return null;
    const data: unknown = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    const out: Fields = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      out[key] = typeof value === "string" ? value.trim() : "";
    }
    return out;
  } catch {
    return null;
  }
}

/** Returns the names of the fields that fail their rule. */
export function validate(fields: Fields, rules: Record<string, FieldRule>): string[] {
  const bad: string[] = [];
  for (const [name, rule] of Object.entries(rules)) {
    const value = fields[name] ?? "";
    if (!value) {
      if (!rule.optional) bad.push(name);
      continue;
    }
    if (
      value.length > rule.max ||
      (rule.min !== undefined && value.length < rule.min) ||
      (rule.email && !EMAIL_RE.test(value))
    ) {
      bad.push(name);
    }
  }
  return bad;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
}

/**
 * Reads a setting when the request runs. `import.meta.env` is replaced at build time, so a
 * prebuilt deploy (vercel build in CI) would freeze whatever the build machine had; the
 * function's own environment holds the project's current values.
 */
function setting(name: string): string | undefined {
  const runtime = typeof process !== "undefined" ? process.env[name] : undefined;
  return runtime || (import.meta.env[name] as string | undefined) || undefined;
}

/** Sends a plain-text email through Resend. */
export async function sendMail(subject: string, text: string, replyTo?: string): Promise<Response> {
  const key = setting("RESEND_API_KEY");
  const from = setting("RESEND_FROM");
  const to = setting("CONTACT_TO_EMAIL") || "hello@getplumber.io";
  if (!key || !from) return json({ error: "unconfigured" }, 503);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text, reply_to: replyTo }),
    });
    if (res.ok) return json({ ok: true });
    // the reason lands in the function logs (Vercel), never in the response
    console.error("[formMail] Resend refused the email:", res.status, await res.text());
    return json({ error: "upstream" }, 502);
  } catch (error) {
    console.error("[formMail] Resend unreachable:", error);
    return json({ error: "upstream" }, 502);
  }
}
