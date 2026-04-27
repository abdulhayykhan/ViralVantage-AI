"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";

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
        <div className="fixed bottom-6 right-6 z-50">
          <motion.button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            className="surface-chip solid-lift flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground shadow-sm"
            aria-expanded={expanded}
            aria-label="Toggle usage guide"
          >
            <span>Usage Guide</span>
            <ChevronUp className={expanded ? "h-4 w-4 rotate-180 transition-transform" : "h-4 w-4 transition-transform"} />
          </motion.button>

          <AnimatePresence>
            {expanded ? (
              <motion.aside
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="surface-panel absolute bottom-full right-0 mb-3 w-[min(24rem,calc(100vw-1.5rem))] rounded-2xl p-5 text-sm text-foreground shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Usage Guide</p>
                    <h2 className="mt-1 text-base font-semibold">Workflow</h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setExpanded(false)}
                    className="h-8 w-8 rounded-full p-0"
                    aria-label="Close guide"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 space-y-2 leading-6 text-foreground/85">
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
