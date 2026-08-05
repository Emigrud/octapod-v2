import { createServerFn } from "@tanstack/react-start";

export type DataSourceMode = "lovable_cloud" | "external_supabase" | "disconnected";

export type DataSourceStatus = {
  mode: DataSourceMode;
  lovableCloudConnected: boolean;
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
    const explicitMode = process.env["DATA_SOURCE_MODE"] as DataSourceMode | undefined;

    const supabaseConfigured =
      typeof supabaseUrl === "string" &&
      supabaseUrl.length > 0 &&
      typeof supabasePublishableKey === "string" &&
      supabasePublishableKey.length > 0;

    let mode: DataSourceMode;
    if (explicitMode === "lovable_cloud" || explicitMode === "external_supabase" || explicitMode === "disconnected") {
      mode = explicitMode;
    } else if (supabaseConfigured) {
      // When credentials are present but no explicit mode is set, assume the
      // project has been pointed at an external Supabase database (the default
      // after disconnecting Lovable Cloud and adding custom credentials).
      mode = "external_supabase";
    } else {
      mode = "disconnected";
    }

    const lovableCloudConnected = mode === "lovable_cloud";
    const parsed = supabaseUrl ? parseSupabaseUrl(supabaseUrl) : null;

    return {
      mode,
      lovableCloudConnected,
      supabaseConfigured,
      projectHost: parsed?.host,
      projectRef: parsed?.ref,
    };
  },
);
