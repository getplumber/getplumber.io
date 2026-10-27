import type { APIRoute } from "astro";

import { clientKey, json, rateLimited, readJson, sendMail, validate } from "@/lib/formMail";

export const prerender = false;

/** Book-a-demo form (home page). Body: { name, email, company, pipelines?, website } */
export const POST: APIRoute = async ({ request }) => {
  const fields = await readJson(request);
  if (!fields) return json({ error: "bad_request" }, 400);

  // honeypot: bots fill the hidden "website" field; answer OK without sending
  if (fields.website) return json({ ok: true });

  if (rateLimited(`demo:${clientKey(request)}`)) return json({ error: "rate_limited" }, 429);

  const bad = validate(fields, {
    name: { min: 2, max: 100 },
    email: { max: 200, email: true },
    company: { min: 1, max: 100 },
    pipelines: { max: 50, optional: true },
  });
  if (bad.length) return json({ error: "invalid", fields: bad }, 400);

  const text = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Company: ${fields.company}`,
    `Pipelines: ${fields.pipelines || "-"}`,
  ].join("\n");

  return sendMail(`Demo request: ${fields.company}`, text, fields.email);
};
