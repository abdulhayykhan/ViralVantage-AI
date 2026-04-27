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
    <motion.div className="glass-lift">
      <Card className="glass-panel overflow-hidden rounded-3xl">
        <CardHeader className="flex flex-col gap-3 p-8 pb-5 z-10">
          <div>
            <CardTitle className="text-3xl font-semibold brand-h2">Results Dashboard</CardTitle>
            <CardDescription className="mt-1 text-[15px] leading-6 text-muted-foreground">Scoring, hook diagnostics, and optimization actions.</CardDescription>
          </div>
          <TransparencyPanel
            rawLogic={transparencyData?.rawLogic ?? null}
            modelName={transparencyData?.modelName ?? null}
            createdAt={transparencyData?.createdAt ?? null}
          />
        </CardHeader>

        <CardContent className="flex flex-col gap-6 p-8 pt-0">
          {analysis ? (
            <motion.div className="grid grid-cols-1 gap-4 xl:grid-cols-2" variants={staggerContainer} initial="hidden" animate="visible">
                  <motion.section layout variants={cardReveal} className="glass-subtle rounded-2xl p-6 xl:col-span-2">
                    <div className="bg-gradient-to-r from-accent-primary/20 to-transparent p-4 rounded-lg">
                      <OverallScore score={analysis.overall_score} />
                    </div>
                  </motion.section>

                  <motion.section layout variants={cardReveal} className="glass-subtle rounded-2xl p-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Hook Analysis</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-primary">Score: {analysis.hook_strength.score}/10</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{analysis.hook_strength.analysis}</p>
              </motion.section>

                  <motion.section layout variants={cardReveal} className="glass-subtle rounded-2xl p-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Pacing Analysis</h3>
                <p className="mt-3 text-sm leading-6 text-foreground">{analysis.pacing_analysis}</p>
              </motion.section>

                  <motion.section layout variants={cardReveal} className="glass-subtle rounded-2xl p-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Caption Optimization</h3>
                <p className="mt-3 text-sm leading-6 text-foreground">{analysis.caption_optimization}</p>
              </motion.section>

                  <motion.section layout variants={cardReveal} className="glass-subtle rounded-2xl p-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Trending Audio and Hashtags</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {analysis.trending_recommendations.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

                  <motion.section layout variants={cardReveal} className="glass-subtle rounded-2xl p-6 xl:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Actionable Feedback</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {analysis.actionable_feedback.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            </motion.div>
          ) : (
            <p className="text-sm text-muted-foreground">Run an analysis to render the full results dashboard.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
