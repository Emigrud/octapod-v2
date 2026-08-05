import { defineTool } from "@lovable.dev/mcp-js";
import { MARKET_OVERVIEW } from "../data";

export default defineTool({
  name: "get_market_overview",
  title: "Get market overview",
  description:
    "Get the Nordic/Baltic market overview: project-activity hotspots per country with intensity, plus the pilot market.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text" as const, text: JSON.stringify(MARKET_OVERVIEW, null, 2) }],
    structuredContent: MARKET_OVERVIEW,
  }),
});
