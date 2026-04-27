"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AnalyzeResult } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OverallScore } from "@/components/overall-score";
import { TransparencyPanel } from "@/components/transparency-panel";

type TransparencyData = {
  rawLogic: string | null;
  modelName: string | null;
  createdAt: string | null;
};

type ResultsDashboardProps = {
  analysis: AnalyzeResult | null;
  transparencyData: TransparencyData | null;
};

export function ResultsDashboard({ analysis, transparencyData }: Readonly<ResultsDashboardProps>) {
  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardReveal = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, rotateX: 1, rotateY: -1, zIndex: 10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="will-change-transform"
    >
      <Card className="deep-glass overflow-hidden border-white/10 bg-card/70">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Results Dashboard</CardTitle>
            <CardDescription>Scoring, hook diagnostics, and optimization actions.</CardDescription>
          </div>
          <TransparencyPanel
            rawLogic={transparencyData?.rawLogic ?? null}
            modelName={transparencyData?.modelName ?? null}
            createdAt={transparencyData?.createdAt ?? null}
          />
        </CardHeader>

        <CardContent className="custom-scrollbar max-h-[600px] overflow-y-auto p-6 pr-4">
          {analysis ? (
            <motion.div className="space-y-5" variants={staggerContainer} initial="hidden" animate="visible">
              <OverallScore score={analysis.overall_score} />

              <div className="grid grid-cols-1 gap-4">
                <motion.section variants={cardReveal} className="deep-glass rounded-xl bg-background/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hook Analysis</h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-primary">Score: {analysis.hook_strength.score}/10</p>
                  <p className="mt-2 text-sm text-foreground/90">{analysis.hook_strength.analysis}</p>
                </motion.section>

                <motion.section variants={cardReveal} className="deep-glass rounded-xl bg-background/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Pacing Analysis</h3>
                  <p className="mt-2 text-sm text-foreground/90">{analysis.pacing_analysis}</p>
                </motion.section>

                <motion.section variants={cardReveal} className="deep-glass rounded-xl bg-background/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Caption Optimization</h3>
                  <p className="mt-2 text-sm text-foreground/90">{analysis.caption_optimization}</p>
                </motion.section>

                <section className="deep-glass rounded-xl bg-background/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Trending Audio and Hashtags</h3>
                  <ul className="mt-2 space-y-1 text-sm text-foreground/90">
                    {analysis.trending_recommendations.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="deep-glass rounded-xl bg-background/40 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Actionable Feedback</h3>
                  <ul className="mt-2 space-y-1 text-sm text-foreground/90">
                    {analysis.actionable_feedback.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </motion.div>
          ) : (
            <p className="text-sm text-muted-foreground">Run an analysis to render the full results dashboard.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
