import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-subtle-foreground">
          {eyebrow}
        </div>
        <h1 className="mt-2 font-display text-[30px] font-medium leading-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
