import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OrgRole = "owner" | "admin" | "member";

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

/** The organization the signed-in user belongs to (first by creation order). */
export function useCurrentOrg() {
  return useQuery({
    queryKey: ["current-org"],
    queryFn: async (): Promise<CurrentOrg | null> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;

      const { data, error } = await supabase
        .from("org_members")
        .select("role, org_id, organizations!inner(id, name, created_at)")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const org = data.organizations as unknown as {
        id: string;
        name: string;
        created_at: string;
      };
      return { id: org.id, name: org.name, created_at: org.created_at, role: data.role as OrgRole };
    },
  });
}

export function useOrgMembers(orgId: string | undefined) {
  return useQuery({
    queryKey: ["org-members", orgId],
    enabled: Boolean(orgId),
    queryFn: async (): Promise<OrgMember[]> => {
      const { data, error } = await supabase
        .from("org_members")
        .select("user_id, user_email, role, created_at")
        .eq("org_id", orgId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as OrgMember[];
    },
  });
}

export function useRenameOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, name }: { orgId: string; name: string }) => {
      const { error } = await supabase
        .from("organizations")
        .update({ name })
        .eq("id", orgId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-org"] });
    },
  });
}
