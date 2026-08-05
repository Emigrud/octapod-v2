import { defineTool } from "@lovable.dev/mcp-js";
import { KPIS } from "../data";

export default defineTool({
  name: "get_dashboard_kpis",
  title: "Get dashboard KPIs",
  description:
    "Get the at-a-glance dashboard KPIs: early signals, high-fit opportunities, total projects value and projects 6–24 months out.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text" as const, text: JSON.stringify({ kpis: KPIS }, null, 2) }],
    structuredContent: { kpis: KPIS },
  }),
});
