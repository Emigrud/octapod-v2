import { defineMcp } from "@lovable.dev/mcp-js";
import getDashboardKpis from "./tools/get-dashboard-kpis";
import getMarketOverview from "./tools/get-market-overview";
import getSituationalBriefing from "./tools/get-situational-briefing";
import listEarlySignals from "./tools/list-early-signals";
import listOpportunities from "./tools/list-opportunities";

export default defineMcp({
  name: "octapod-chart-room",
  title: "Octapod Chart Room",
  version: "0.1.0",
  instructions:
    "Read-only tools over the OCTAPOD Nordic/Baltic infrastructure market pilot dataset. Use `list_early_signals` for early market signals, `list_opportunities` for tenders and projects with fit scores, `get_market_overview` for country hotspots, `get_dashboard_kpis` for headline metrics, and `get_situational_briefing` for the situational awareness briefing. Data is demo/pilot content while ingestion is being built.",
  tools: [
    listEarlySignals,
    listOpportunities,
    getMarketOverview,
    getDashboardKpis,
    getSituationalBriefing,
  ],
});
