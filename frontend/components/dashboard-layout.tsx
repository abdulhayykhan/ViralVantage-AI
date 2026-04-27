"use client";

import { ReactNode, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";

import { InteractiveGuide } from "@/components/interactive-guide";
import { SystemNotesWidget } from "@/components/system-notes-widget";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button type="button" variant="outline" size="sm" className="glass-chip h-10 rounded-full px-4 opacity-0" aria-hidden>
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
        className="glass-chip glass-lift h-10 rounded-full px-4"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="text-xs uppercase tracking-[0.12em]">{isDark ? "Light" : "Dark"}</span>
      </Button>
  );
}

export function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleSystemStatusOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("system-status-offline", handleSystemStatusOffline);

    return () => {
      window.removeEventListener("system-status-offline", handleSystemStatusOffline);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="relative min-h-screen glass-mesh">
        <header className="relative z-10">
          <div className="glass-panel mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 lg:px-8 py-6 backdrop-blur-2xl">
            <div className="z-10">
              <div className="flex items-center gap-3">
                <img src="/icon.svg" alt="ViralVantage-AI logo" className="h-6 w-6 shrink-0" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">ViralVantage-AI</p>
              </div>
              <h1 className="mt-1 brand-h1">Creator Performance Dashboard</h1>
            </div>
            <div className="flex items-center gap-3 z-10">
              <div className="glass-chip flex items-center gap-2 px-3 py-1 text-xs font-medium">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${isOnline ? "bg-primary" : "bg-red-500"}`} />
                <span className="uppercase tracking-[0.12em]">SYSTEM STATUS: {isOnline ? "ONLINE" : "OFFLINE"}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto grid w-full max-w-[1800px] grid-cols-1 items-start gap-8 px-4 py-10 lg:grid-cols-[420px_1fr] lg:px-8 xl:grid-cols-[480px_1fr]">{children}</main>
        <SystemNotesWidget />
        <InteractiveGuide />
      </div>
    </ThemeProvider>
  );
}
