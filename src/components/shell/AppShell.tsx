import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-isoline opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-chart-grid opacity-60"
      />
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="relative flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
