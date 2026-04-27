"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function InteractiveGuide() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setVisible(true);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          initial={{ opacity: 0, y: 24, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 24, x: 20 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="deep-glass fixed bottom-5 right-5 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-4 text-sm text-foreground/90"
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
              onClick={() => setVisible(false)}
              className="h-8 w-8 rounded-full p-0"
              aria-label="Dismiss guide"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 space-y-2 leading-6 text-foreground/85">
            <p>Step 1: Drop a short-form video.</p>
            <p>Step 2: Wait for Gemini 2.0 Flash to process the hook and pacing.</p>
            <p>Step 3: Apply actionable feedback.</p>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
