import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";
import type { OctapodDatabase } from "@/integrations/octapod-db";

/**
 * TEMPORARY — Phase 0B acceptance verification endpoint.
 *
 * Creates two throwaway auth users (with auto-created orgs via the signup
 * trigger), inspects the org/membership rows as the service role, then signs
 * in as each user through the publishable client (RLS-enforced) to prove:
 *   - signup automation created exactly one org + one owner membership, and
 *   - a user can read only their own organization/membership rows (isolation).
 *
 * Guarded by a throwaway token in PHASE0B_VERIFY_TOKEN (timing-safe compare).
 * Deletes all created users/orgs at the end. No PII is persisted.
 */
export const Route = createFileRoute("/api/public/phase0b-verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const json = (b: unknown, status = 200) =>
          new Response(JSON.stringify(b), {
            status,
            headers: { "content-type": "application/json" },
          });

        if (!tokenOk(request)) return json({ error: "unauthorized" }, 401);

        const stamp = Date.now();
        const password = `Verify-${stamp}-Aa1!`;
        const specs = [
          { email: `octapod-verify-a+${stamp}@example.com`, org: "Verify Org Alpha" },
          { email: `octapod-verify-b+${stamp}@example.com`, org: "Verify Org Beta" },
        ];
        const created: { id: string; email: string; org: string }[] = [];

        try {
          const admin = makeAdmin();
          const pubUrl = process.env["SUPABASE_URL"]!;
          const pubKey = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

          // 1) Create two users; the on_auth_user_created trigger should
          //    create an org + owner membership for each.
          for (const s of specs) {
            const { data, error } = await admin.auth.admin.createUser({
              email: s.email,
              password,
              email_confirm: true,
              user_metadata: { organization_name: s.org },
            });
            if (error || !data.user) {
              return json({ stage: "createUser", email: s.email, error: error?.message ?? "no user" }, 500);
            }
            created.push({ id: data.user.id, email: s.email, org: s.org });
          }

          // Let the AFTER INSERT trigger settle.
          await sleep(800);

          const userIds = created.map((c) => c.id);

          // 2) Admin view (bypasses RLS): all memberships + orgs for these users.
          const { data: memberships } = await admin
            .from("org_members")
            .select("org_id,user_id,role,user_email")
            .in("user_id", userIds);
          const memRows = (memberships ?? []) as unknown as Array<{
            org_id: string;
            user_id: string;
            role: string;
            user_email: string | null;
          }>;
          const orgIds = Array.from(new Set(memRows.map((m) => m.org_id)));
          const { data: orgsAdmin } = await admin
            .from("organizations")
            .select("id,name")
            .in("id", orgIds);
          const orgRows = (orgsAdmin ?? []) as unknown as Array<{ id: string; name: string }>;

          // 3) Per-user RLS view via publishable client.
          const rls: Array<Record<string, unknown>> = [];
          for (const c of created) {
            const uc = makePublishable(pubUrl, pubKey);
            const { data: sess, error: se } = await uc.auth.signInWithPassword({
              email: c.email,
              password,
            });
            if (se || !sess.session) {
              rls.push({ user: c.email, error: se?.message ?? "no session" });
              continue;
            }
            const { data: myOrgs } = await uc.from("organizations").select("id,name");
            const { data: myMembers } = await uc.from("org_members").select("org_id,user_id,role");
            const other = created.find((x) => x.id !== c.id);
            const otherOrgId = memRows.find((m) => m.user_id === other?.id)?.org_id ?? null;
            const cross = otherOrgId
              ? await uc.from("organizations").select("id,name").eq("id", otherOrgId)
              : null;
            rls.push({
              user: c.email,
              seesOrgCount: (myOrgs ?? []).length,
              seesOrgs: myOrgs ?? [],
              seesMembershipCount: (myMembers ?? []).length,
              seesMemberships: myMembers ?? [],
              otherOrgRequested: otherOrgId,
              crossOrgVisibleRows: cross?.data ?? [],
            });
            await uc.auth.signOut();
          }

          const eachOwnsOneOrg =
            rls.length === 2 &&
            rls.every(
              (r) =>
                Number(r.seesOrgCount) === 1 && Number(r.seesMembershipCount) === 1,
            );
          const isolationHolds = rls.every(
            (r) => Number((r.crossOrgVisibleRows as unknown[])?.length ?? 0) === 0,
          );

          return json({
            ok: true,
            projectRef: process.env["SUPABASE_PROJECT_ID"] ?? null,
            adminView: {
              usersCreated: created.length,
              memberships: memRows,
              orgs: orgRows,
            },
            rls,
            summary: {
              signupAutomationCreatedOrgAndOwner:
                memRows.length === created.length &&
                memRows.every((m) => m.role === "owner") &&
                orgRows.length === created.length,
              eachUserSeesExactlyOneOrg: eachOwnsOneOrg,
              crossOrgIsolationHolds: isolationHolds,
            },
          });
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : String(e) }, 500);
        } finally {
          // 4) Cleanup regardless of outcome.
          try {
            const admin = makeAdmin();
            for (const c of created) {
              await admin.auth.admin.deleteUser(c.id);
            }
            if (created.length) {
              const userIds = created.map((c) => c.id);
              const { data: mems } = await admin
                .from("org_members")
                .select("org_id")
                .in("user_id", userIds);
              const ids = Array.from(
                new Set((mems ?? []).map((m: { org_id: string }) => m.org_id)),
              );
              if (ids.length) await admin.from("organizations").delete().in("id", ids);
            }
          } catch {
            /* best-effort cleanup */
          }
        }
      },
    },
  },
});

function tokenOk(request: Request): boolean {
  const got = request.headers.get("x-verify-token") ?? "";
  const want = process.env["PHASE0B_VERIFY_TOKEN"] ?? "";
  if (!got || !want) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchShim(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    }
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

function makeAdmin(): SupabaseClient<OctapodDatabase> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["OCTAPOD_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Missing SUPABASE_URL / service role key");
  return createClient<OctapodDatabase>(url, key, {
    global: { fetch: fetchShim(key) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function makePublishable(url: string, key: string): SupabaseClient<OctapodDatabase> {
  return createClient<OctapodDatabase>(url, key, {
    global: { fetch: fetchShim(key) },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
