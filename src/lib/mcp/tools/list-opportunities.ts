import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { OPPORTUNITIES } from "../data";

export default defineTool({
  name: "list_opportunities",
  title: "List opportunities",
  description:
    "List tender/project opportunities in the OCTAPOD pilot pipeline with fit score, value band, status and deadline.",
  inputSchema: {
    min_fit_score: z
      .number()
      .optional()
      .describe("Only return opportunities whose fit score is at least this value (0-100)."),
    sector: z.string().optional().describe("Optional sector filter, e.g. Power Grid, Wind, Solar."),
    country: z.string().optional().describe("Optional ISO 3166-1 alpha-2 country code filter, e.g. FI."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ min_fit_score, sector, country }) => {
    const items = OPPORTUNITIES.filter(
      (o) =>
        (min_fit_score === undefined || o.fit_score >= min_fit_score) &&
        (!sector || o.sector.toLowerCase() === sector.trim().toLowerCase()) &&
        (!country || o.country.toLowerCase() === country.trim().toLowerCase()),
    ).sort((a, b) => b.fit_score - a.fit_score);

    return {
      content: [{ type: "text" as const, text: JSON.stringify({ count: items.length, items }, null, 2) }],
      structuredContent: { count: items.length, items },
    };
  },
});
