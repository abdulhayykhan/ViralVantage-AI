"use client";

import { AnalyzeResult } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedScore } from "@/components/animated-score";
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
  return (
    <Card className="border-white/10 bg-card/70">
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

      <CardContent>
        {analysis ? (
          <div className="space-y-5">
            <AnimatedScore score={analysis.overall_score} />

            <section className="rounded-xl border border-border/80 bg-background/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Hook Analysis</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-primary">Score: {analysis.hook_strength.score}/10</p>
              <p className="mt-2 text-sm text-foreground/90">{analysis.hook_strength.analysis}</p>
            </section>

            <section className="rounded-xl border border-border/80 bg-background/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Pacing Analysis</h3>
              <p className="mt-2 text-sm text-foreground/90">{analysis.pacing_analysis}</p>
            </section>

            <section className="rounded-xl border border-border/80 bg-background/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Actionable Feedback</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/90">
                {analysis.actionable_feedback.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-border/80 bg-background/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Caption Optimization</h3>
              <p className="mt-2 text-sm text-foreground/90">{analysis.caption_optimization}</p>
            </section>

            <section className="rounded-xl border border-border/80 bg-background/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Trending Audio and Hashtags</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/90">
                {analysis.trending_recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Run an analysis to render the full results dashboard.</p>
        )}
      </CardContent>
    </Card>
  );
}
