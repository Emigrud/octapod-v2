import { createFileRoute } from "@tanstack/react-router";
import { Map as MapIcon } from "lucide-react";
import { CountryChip, Tag } from "@/components/octapod";
import { PageHeader } from "./index";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map — OCTAPOD" },
      {
        name: "description",
        content:
          "Geographic view of tenders and signals across the pilot market. Layer by sector, source and time.",
      },
      { property: "og:title", content: "Map — OCTAPOD" },
      {
        property: "og:description",
        content: "Tenders and signals on a shared geographic canvas.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-8">
      <PageHeader
        eyebrow="04 · Map"
        title="The chart is empty."
        description="Once opportunities and signals are flowing, this canvas becomes a live map — layered by sector, source and time — with the horizontal signal timeline anchored beneath."
      />

      <div className="relative overflow-hidden rounded-md border border-hairline bg-surface-1/50">
        <div className="absolute inset-0 bg-isoline" />
        <div className="absolute inset-0 bg-chart-grid opacity-40" />

        {/* Faux instrument overlay */}
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <CountryChip code="FIN" />
          <Tag variant="tender" size="sm" dot>
            Tender layer
          </Tag>
          <Tag variant="signal" size="sm" dot>
            Signal layer
          </Tag>
        </div>

        <div className="absolute right-4 top-4 font-mono text-[10.5px] uppercase tracking-[0.18em] text-subtle-foreground">
          60.17°N · 24.94°E · WGS84
        </div>

        <div className="relative z-10 flex min-h-[480px] flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-hairline bg-surface-2/70 text-muted-foreground">
            <MapIcon className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <h2 className="font-display text-[22px] font-medium text-foreground">
            No positions plotted.
          </h2>
          <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
            The map opens once opportunities and signals are flowing. Two layers, always:
            ice-cyan for tenders, amber for signals.
          </p>
          <div className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.18em] text-subtle-foreground">
            Mapbox GL · token pending
          </div>
        </div>
      </div>
    </div>
  );
}
