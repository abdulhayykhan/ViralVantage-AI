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

    globalThis.addEventListener("system-status-offline", handleSystemStatusOffline);

    return () => {
      globalThis.removeEventListener("system-status-offline", handleSystemStatusOffline);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="relative min-h-screen glass-mesh">
        <header className="relative z-10">
          <div className="glass-panel mx-auto flex w-full max-w-[1800px] flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row lg:px-8 backdrop-blur-2xl">
            <div className="z-10 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <img src="/icon.svg" alt="ViralVantage-AI logo" className="h-6 w-6 shrink-0" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">ViralVantage-AI</p>
              </div>
              <h1 className="mt-1 text-xl text-center sm:text-left sm:text-2xl md:text-3xl brand-h1">Creator Performance Dashboard</h1>
            </div>
            <div className="flex w-full flex-row items-center justify-center gap-2 sm:w-auto sm:justify-end sm:gap-4 z-10">
              <div className="glass-chip flex items-center gap-2 px-3 py-1 text-xs font-medium">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${isOnline ? "bg-primary" : "bg-red-500"}`} />
                <span className="uppercase tracking-[0.12em]">SYSTEM STATUS: {isOnline ? "ONLINE" : "OFFLINE"}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-[1800px] flex-col gap-4 px-4 py-10 pb-24 sm:gap-6 sm:pb-32 lg:flex-row lg:gap-8 lg:px-8">{children}</main>
        <footer className="relative z-10 mt-auto w-full py-8 text-center text-sm text-gray-400/80">
          Made with ❤️ by{" "}
          <a
            href="https://www.linkedin.com/in/abdulhayykhan/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 transition-colors hover:text-emerald-400"
          >
            Abdul Hayy Khan
          </a>
        </footer>
        <SystemNotesWidget />
        <InteractiveGuide />
      </div>
    </ThemeProvider>
  );
}
