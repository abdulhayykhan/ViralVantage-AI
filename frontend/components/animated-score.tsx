"use client";

import { useEffect, useMemo, useState } from "react";

type AnimatedScoreProps = {
  score: number;
};

export function AnimatedScore({ score }: AnimatedScoreProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const clampedTarget = Math.min(Math.max(score, 0), 100);
    const durationMs = 900;
    const startedAt = performance.now();

    let frameId = 0;

    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setAnimatedValue(Math.round(clampedTarget * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [score]);

  const scoreLabel = useMemo(() => {
    if (score >= 80) {
      return "High Viral Potential";
    }
    if (score >= 60) {
      return "Promising";
    }
    if (score >= 40) {
      return "Needs Optimization";
    }
    return "Low Viral Potential";
  }, [score]);

  const progress = Math.min(Math.max(score, 0), 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-[linear-gradient(145deg,hsl(var(--card))_30%,hsl(160_80%_14%/.55))] p-6">
      <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overall Score</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-6xl font-semibold leading-none text-primary">{animatedValue}</span>
        <span className="pb-1 text-xl text-muted-foreground">/100</span>
      </div>
      <p className="mt-2 text-sm text-foreground/90">{scoreLabel}</p>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted/80">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
