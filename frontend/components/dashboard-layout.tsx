import { ReactNode } from "react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,hsl(160_84%_16%/.25),transparent_45%),radial-gradient(circle_at_90%_10%,hsl(200_80%_18%/.2),transparent_45%),hsl(var(--background))]">
      <header className="border-b border-border/80 bg-background/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ViralVantage-AI</p>
            <h1 className="text-lg font-semibold">Creator Performance Dashboard</h1>
          </div>
          <div className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Phase 3</div>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">{children}</main>
    </div>
  );
}
