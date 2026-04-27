import { ReactNode } from "react";

export function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="mesh-breathe relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,hsl(160_84%_45%/.22),transparent_42%),radial-gradient(circle_at_88%_18%,hsl(190_90%_60%/.16),transparent_44%),radial-gradient(circle_at_50%_84%,hsl(160_84%_35%/.14),transparent_46%)]"
      />
      <div aria-hidden className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
      <div aria-hidden className="scanline pointer-events-none absolute inset-0 opacity-45" />

      <header className="glass-card hud-frame relative z-10 border-b border-white/10 bg-background/30">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ViralVantage-AI</p>
            <h1 className="text-lg font-semibold">Creator Performance Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-card rounded-full px-3 py-1 text-xs text-muted-foreground">Phase 8</div>
            <div className="glass-card flex items-center gap-2 rounded-full px-3 py-1 text-xs text-foreground/90">
              <span className="status-blink inline-block h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="uppercase tracking-[0.12em]">System Status: Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">{children}</main>
    </div>
  );
}
