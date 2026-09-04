/**
 * PHASE 1 — scheduled TED ingestion endpoint.
 *
 * Called by pg_cron (via pg_net) once a day; see
 * db/migrations/0003_phase1_ted_schedule.sql. The route lives under
 * /api/public/* so the scheduler can reach it on the published site, and it
 * authenticates the caller itself with the shared INGEST_TRIGGER_TOKEN secret.
 */
import { createFileRoute } from "@tanstack/react-router";

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

async function handle(request: Request) {
  const expected = process.env["INGEST_TRIGGER_TOKEN"];
  if (!expected) {
    return new Response(JSON.stringify({ error: "INGEST_TRIGGER_TOKEN is not configured" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  const provided =
    request.headers.get("x-ingest-token") ??
    (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");

  if (provided.length !== expected.length) return unauthorized();
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return unauthorized();

  const { runTedIngest } = await import("@/lib/ted.server");
  const result = await runTedIngest({ trigger: "cron" });

  return new Response(JSON.stringify(result), {
    status: result.error ? 500 : 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/ingest/ted")({
  server: {
    handlers: {
      POST: async ({ request }) => handle(request),
      GET: async ({ request }) => handle(request),
    },
  },
});
