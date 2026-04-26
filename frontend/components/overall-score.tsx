"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

type OverallScoreProps = {
  score: number;
};

export function OverallScore({ score }: Readonly<OverallScoreProps>) {
  const clampedScore = Math.min(Math.max(score, 0), 100);

  const gauge = useMemo(() => {
    const radius = 62;
    const circumference = 2 * Math.PI * radius;
    const targetOffset = circumference - (clampedScore / 100) * circumference;
    return {
      radius,
      circumference,
      targetOffset,
    };
  }, [clampedScore]);

  const scoreLabel = useMemo(() => {
    if (clampedScore >= 80) {
      return "High Viral Potential";
    }
    if (clampedScore >= 60) {
      return "Promising";
    }
    if (clampedScore >= 40) {
      return "Needs Optimization";
    }
    return "Low Viral Potential";
  }, [clampedScore]);

  return (
    <section className="glass-card neon-glow relative overflow-hidden rounded-2xl p-6">
      <div aria-hidden className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />

      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overall Score</p>

      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={`Overall score ${clampedScore} out of 100`}>
            <circle cx="80" cy="80" r={gauge.radius} className="fill-none stroke-white/10" strokeWidth="12" />
            <motion.circle
              cx="80"
              cy="80"
              r={gauge.radius}
              className="fill-none stroke-[hsl(160_84%_45%)]"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={gauge.circumference}
              initial={{ strokeDashoffset: gauge.circumference }}
              animate={{ strokeDashoffset: gauge.targetOffset }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-3xl font-semibold text-primary">{clampedScore}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-foreground/90">{scoreLabel}</p>
          <p className="text-xs text-muted-foreground">Gauge fill represents confidence-weighted virality score.</p>
        </div>
      </div>
    </section>
  );
}
