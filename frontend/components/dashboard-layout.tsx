import { ReactNode } from "react";

import { InteractiveGuide } from "@/components/interactive-guide";

export function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(120,190,255,0.08),transparent_28%),linear-gradient(180deg,hsl(220_15%_8%),hsl(220_18%_10%))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_88%_18%,rgba(120,190,255,0.08),transparent_36%),radial-gradient(circle_at_50%_84%,rgba(255,255,255,0.05),transparent_42%)]"
      />

      <header className="deep-glass relative z-10 border-b border-white/10 bg-background/30">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ViralVantage-AI</p>
            <h1 className="text-lg font-semibold">Creator Performance Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="deep-glass rounded-full px-3 py-1 text-xs text-muted-foreground">Phase 10</div>
            <div className="deep-glass flex items-center gap-2 rounded-full px-3 py-1 text-xs text-foreground/90">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(72,255,191,0.65)]" />
              <span className="uppercase tracking-[0.12em]">System Status: Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">{children}</main>
      <InteractiveGuide />
    </div>
  );
}
