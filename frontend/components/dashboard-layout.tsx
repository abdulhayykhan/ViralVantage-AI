"use client";

import { ReactNode, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";

import { InteractiveGuide } from "@/components/interactive-guide";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button type="button" variant="outline" size="sm" className="vision-glass h-10 rounded-full px-4 opacity-0" aria-hidden>
        <Sun className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.12em]">Theme</span>
        <Moon className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme !== "light";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="vision-glass hover-glow h-10 rounded-full px-4"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="text-xs uppercase tracking-[0.12em]">{isDark ? "Light" : "Dark"}</span>
    </Button>
  );
}

export function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]" aria-hidden />

        <header className="relative z-10 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">ViralVantage-AI</p>
              <h1 className="text-lg font-semibold">Creator Performance Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="vision-glass rounded-full px-3 py-1 text-xs text-muted-foreground">Phase 12</div>
              <div className="vision-glass flex items-center gap-2 rounded-full px-3 py-1 text-xs text-foreground/90">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(72,255,191,0.65)]" />
                <span className="uppercase tracking-[0.12em]">System Status: Online</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto grid w-full max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">{children}</main>
        <InteractiveGuide />
      </div>
    </ThemeProvider>
  );
}
