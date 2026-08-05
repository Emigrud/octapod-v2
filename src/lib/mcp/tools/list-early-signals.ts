import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { SIGNALS } from "../data";

export default defineTool({
  name: "list_early_signals",
  title: "List early signals",
  description:
    "List early market signals (grid, wind, solar, data center) tracked in the OCTAPOD pilot, newest first.",
  inputSchema: {
    country: z
      .string()
      .optional()
      .describe("Optional ISO 3166-1 alpha-2 country code filter, e.g. FI."),
    sector: z.string().optional().describe("Optional sector filter, e.g. Power Grid, Wind, Solar."),
    impact: z.enum(["High", "Medium", "Low"]).optional().describe("Optional impact filter."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ country, sector, impact }) => {
    const items = SIGNALS.filter(
      (s) =>
        (!country || s.country.toLowerCase() === country.trim().toLowerCase()) &&
        (!sector || s.sector.toLowerCase() === sector.trim().toLowerCase()) &&
        (!impact || s.impact === impact),
    );

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ count: items.length, items }, null, 2) }],
      structuredContent: { count: items.length, items },
    };
  },
});
