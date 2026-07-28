import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataTableState = "ready" | "loading" | "empty" | "error";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  align?: "left" | "right" | "center";
  mono?: boolean;
  width?: string;
  render: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows?: T[];
  state?: DataTableState;
  keyExtractor?: (row: T, index: number) => string;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  state = "ready",
  keyExtractor,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyAction,
  errorMessage,
  onRetry,
  className,
}: DataTableProps<T>) {
  const effectiveState: DataTableState =
    state === "ready" && (!rows || rows.length === 0) ? "empty" : state;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-hairline bg-surface-1/50",
        className,
      )}
    >
      <div className="relative w-full overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="hairline-b bg-surface-2/40">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={cn(
                    "px-3 py-2.5 text-eyebrow whitespace-nowrap",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    (c.align === "left" || !c.align) && "text-left",
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {effectiveState === "ready" &&
              rows!.map((row, i) => (
                <tr
                  key={keyExtractor ? keyExtractor(row, i) : i}
                  className="hairline-b last:border-b-0 transition-colors hover:bg-surface-2/40"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-2.5 align-middle",
                        c.align === "right" && "text-right",
                        c.align === "center" && "text-center",
                        c.mono && "font-mono tabular",
                      )}
                    >
                      {c.render(row, i)}
                    </td>
                  ))}
                </tr>
              ))}

            {effectiveState === "loading" &&
              Array.from({ length: 6 }).map((_, r) => (
                <tr key={r} className="hairline-b last:border-b-0">
                  {columns.map((c, i) => (
                    <td key={c.key} className="px-3 py-3">
                      <div
                        className={cn(
                          "h-3 animate-pulse rounded-sm bg-surface-3/70",
                          i === 0 ? "w-2/3" : i === columns.length - 1 ? "w-16 ml-auto" : "w-1/2",
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>

        {effectiveState === "empty" && (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-sm border border-hairline bg-surface-2/60 text-muted-foreground">
              <Inbox className="h-4 w-4" strokeWidth={1.6} />
            </div>
            <div className="font-display text-[15px] text-foreground">{emptyTitle}</div>
            {emptyDescription && (
              <p className="mt-1.5 max-w-md text-[12.5px] text-muted-foreground">
                {emptyDescription}
              </p>
            )}
            {emptyAction && <div className="mt-4">{emptyAction}</div>}
          </div>
        )}

        {effectiveState === "error" && (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-sm border border-danger/40 bg-danger/10 text-danger">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.7} />
            </div>
            <div className="font-display text-[15px] text-foreground">Couldn't load</div>
            <p className="mt-1.5 max-w-md text-[12.5px] text-muted-foreground">
              {errorMessage ?? "The source didn't respond. Nothing was shown to avoid mixing stale and live data."}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-sm border border-hairline bg-surface-2/60 px-3 text-[12px] text-foreground hover:border-border"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
