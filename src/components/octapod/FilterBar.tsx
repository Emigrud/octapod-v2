import type { ReactNode } from "react";
import { Search, SlidersHorizontal, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterBarState = "ready" | "loading" | "empty" | "error";

interface FilterBarProps {
  state?: FilterBarState;
  disabled?: boolean;
  searchPlaceholder?: string;
  children?: ReactNode;
  applied?: ReactNode;
  onSave?: () => void;
  errorMessage?: string;
  className?: string;
}

export function FilterBar({
  state = "ready",
  disabled = false,
  searchPlaceholder = "Search…",
  children,
  applied,
  onSave,
  errorMessage,
  className,
}: FilterBarProps) {
  const isDisabled = disabled || state !== "ready";

  return (
    <div
      className={cn(
        "rounded-md border border-hairline bg-surface-1/50",
        isDisabled && "opacity-70",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle-foreground" />
          <input
            disabled={isDisabled}
            type="search"
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-sm border border-hairline bg-surface-2/60 pl-8 pr-3 text-[12.5px] text-foreground placeholder:text-subtle-foreground focus:border-tender/50 focus:outline-none focus:ring-1 focus:ring-tender/30 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {children ?? <FilterBarPlaceholders />}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            disabled={isDisabled}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-hairline bg-surface-2/60 px-2.5 text-[11.5px] text-muted-foreground hover:text-foreground hover:border-border disabled:cursor-not-allowed"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            More filters
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isDisabled}
            className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-tender/40 bg-tender-muted px-2.5 text-[11.5px] font-medium text-tender hover:border-tender/70 disabled:cursor-not-allowed"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Save filter
          </button>
        </div>
      </div>

      {state === "error" && (
        <div className="hairline-t px-3 py-2 text-[12px] text-danger">
          {errorMessage ?? "Filters couldn't load. Refresh to try again."}
        </div>
      )}

      {applied && state === "ready" && (
        <div className="hairline-t flex flex-wrap items-center gap-2 px-3 py-2">
          <span className="text-eyebrow">Applied</span>
          {applied}
        </div>
      )}
    </div>
  );
}

function FilterBarPlaceholders() {
  return (
    <>
      {["Sector", "Country", "Value", "Deadline"].map((f) => (
        <span
          key={f}
          className="inline-flex h-8 items-center gap-1 rounded-sm border border-dashed border-hairline px-2.5 text-[11.5px] text-subtle-foreground"
        >
          {f}
        </span>
      ))}
    </>
  );
}
