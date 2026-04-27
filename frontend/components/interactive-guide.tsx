"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, X } from "lucide-react";

export function InteractiveGuide() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      setVisible(true);
    }, 2000);

    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <div className="fixed bottom-6 right-6 z-[100]">
          <motion.button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            className="surface-chip solid-lift flex w-auto items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-foreground bg-background/95 backdrop-blur-md border border-border shadow-lg z-[100]"
            aria-expanded={expanded}
            aria-label="Toggle usage guide"
          >
            <span className="whitespace-nowrap">Usage Guide</span>
            <ChevronUp className={expanded ? "h-4 w-4 rotate-180 transition-transform" : "h-4 w-4 transition-transform"} />
          </motion.button>

          <AnimatePresence>
            {expanded ? (
              <motion.aside
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="absolute bottom-full right-0 mb-3 w-[320px] rounded-2xl border border-border bg-white/95 dark:bg-slate-950/95 p-6 shadow-2xl backdrop-blur-3xl z-[100]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Usage Guide</p>
                    <h2 className="mt-1 text-base font-semibold text-foreground">Workflow</h2>
                  </div>
                  <button
                    onClick={() => setExpanded(false)}
                    aria-label="Close guide"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <p>Step 1: Drop a short-form video.</p>
                  <p>Step 2: Wait for Gemini 2.5 Flash to process the hook and pacing.</p>
                  <p>Step 3: Apply actionable feedback.</p>
                </div>
              </motion.aside>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
