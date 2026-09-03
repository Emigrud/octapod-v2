import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { db, type OrgRole } from "@/integrations/octapod-db";
import { AUTH_ENABLED } from "@/lib/auth-flags";

export type { OrgRole };

export interface CurrentOrg {
  id: string;
  name: string;
  created_at: string;
  role: OrgRole;
}

export interface OrgMember {
  user_id: string;
  user_email: string | null;
  role: OrgRole;
  created_at: string;
}

export function isAdminOrAbove(role: OrgRole | undefined): boolean {
  return role === "owner" || role === "admin";
}

/** The organization the signed-in user belongs to (first by join order). */
export function useCurrentOrg() {
  return useQuery({
    queryKey: ["current-org"],
    enabled: AUTH_ENABLED,
    queryFn: async (): Promise<CurrentOrg | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;

      const { data: membership, error: membershipError } = await db
        .from("org_members")
        .select("org_id, role, created_at")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (membershipError) throw membershipError;
      if (!membership) return null;

      const { data: org, error: orgError } = await db
        .from("organizations")
        .select("id, name, created_at")
        .eq("id", membership.org_id)
        .maybeSingle();

      if (orgError) throw orgError;
      if (!org) return null;

      return {
        id: org.id,
        name: org.name,
        created_at: org.created_at,
        role: membership.role,
      };
    },
  });
}

export function useOrgMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: ["org-members", orgId],
    enabled: Boolean(orgId),
    queryFn: async (): Promise<OrgMember[]> => {
      const { data, error } = await db
        .from("org_members")
        .select("user_id, user_email, role, created_at")
        .eq("org_id", orgId as string)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRenameOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, name }: { orgId: string; name: string }) => {
      const { error } = await db.from("organizations").update({ name }).eq("id", orgId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["current-org"] });
    },
  });
}
