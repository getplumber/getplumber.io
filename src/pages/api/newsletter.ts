import type { APIRoute } from "astro";

import { clientKey, json, rateLimited, readJson, sendMail, validate } from "@/lib/formMail";

export const prerender = false;

/** Footer newsletter form. Body: { email, website } */
export const POST: APIRoute = async ({ request }) => {
  const fields = await readJson(request);
  if (!fields) return json({ error: "bad_request" }, 400);

  // honeypot: bots fill the hidden "website" field; answer OK without sending
  if (fields.website) return json({ ok: true });

  if (rateLimited(`newsletter:${clientKey(request)}`)) {
    return json({ error: "rate_limited" }, 429);
  }

  const bad = validate(fields, { email: { max: 200, email: true } });
  if (bad.length) return json({ error: "invalid", fields: bad }, 400);

  return sendMail("Newsletter signup", `Email: ${fields.email}`, fields.email);
};
