import { createServerFn } from "@tanstack/react-start";

export type DataSourceMode = "external_supabase" | "disconnected";

export type DataSourceStatus = {
  mode: DataSourceMode;
  supabaseConfigured: boolean;
  projectHost?: string;
  projectRef?: string;
};

function parseSupabaseUrl(url: string): { host: string; ref: string } | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    // Supabase project refs are the first subdomain segment, e.g. <ref>.supabase.co
    const ref = host.split(".")[0];
    return { host, ref };
  } catch {
    return null;
  }
}

export const getDataSourceStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<DataSourceStatus> => {
    const supabaseUrl = process.env["SUPABASE_URL"];
    const supabasePublishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];

    const supabaseConfigured =
      typeof supabaseUrl === "string" &&
      supabaseUrl.length > 0 &&
      typeof supabasePublishableKey === "string" &&
      supabasePublishableKey.length > 0;

    const parsed = supabaseUrl ? parseSupabaseUrl(supabaseUrl) : null;

    return {
      mode: supabaseConfigured ? "external_supabase" : "disconnected",
      supabaseConfigured,
      projectHost: parsed?.host,
      projectRef: parsed?.ref,
    };
  },
);
