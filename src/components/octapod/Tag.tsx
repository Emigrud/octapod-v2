import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TagVariant = "tender" | "signal" | "neutral" | "country" | "success" | "danger";
export type TagSize = "sm" | "md";

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<TagVariant, string> = {
  tender:
    "text-tender border-tender/40 bg-tender-muted",
  signal:
    "text-signal border-signal/40 bg-signal-muted",
  neutral:
    "text-muted-foreground border-hairline bg-surface-2/60",
  country:
    "text-foreground border-hairline bg-surface-2/60 font-mono uppercase tracking-[0.14em]",
  success:
    "text-success border-success/40 bg-success/10",
  danger:
    "text-danger border-danger/40 bg-danger/10",
};

const sizeClasses: Record<TagSize, string> = {
  sm: "h-5 px-1.5 text-[10px]",
  md: "h-6 px-2 text-[11px]",
};

export function Tag({
  children,
  variant = "neutral",
  size = "sm",
  className,
  dot = false,
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border font-medium leading-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1 w-1 rounded-full",
            variant === "tender" && "bg-tender",
            variant === "signal" && "bg-signal",
            variant === "success" && "bg-success",
            variant === "danger" && "bg-danger",
            (variant === "neutral" || variant === "country") && "bg-muted-foreground",
          )}
        />
      )}
      {children}
    </span>
  );
}

export function CountryChip({ code, className }: { code: string; className?: string }) {
  return (
    <Tag variant="country" size="sm" className={className}>
      {code.toUpperCase().slice(0, 3)}
    </Tag>
  );
}
