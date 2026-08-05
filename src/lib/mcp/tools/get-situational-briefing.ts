import { defineTool } from "@lovable.dev/mcp-js";
import { BRIEFING } from "../data";

export default defineTool({
  name: "get_situational_briefing",
  title: "Get situational awareness briefing",
  description:
    "Get the AI situational awareness briefing: key developments and recommended actions. Currently returns placeholder pilot content.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text" as const, text: JSON.stringify(BRIEFING, null, 2) }],
    structuredContent: BRIEFING,
  }),
});
