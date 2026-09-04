import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Clear, non-decorative label for screens whose source is not connected yet.
 * The pilot never presents illustrative content as real market data.
 */
export function IllustrativeDataNotice({
  what,
  className,
}: {
  what: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-sm border border-hairline bg-surface-2/70 px-3 py-2 text-[11.5px] text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-[1px] h-3.5 w-3.5 shrink-0" />
      <span>
        <span className="font-medium text-foreground">Illustrative only.</span> {what} is not
        connected yet, so the figures below are placeholders and must not be read as market data.
      </span>
    </div>
  );
}
