"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";

type TransparencyPanelProps = {
  rawLogic: string | null;
  modelName: string | null;
  createdAt: string | null;
};

export function TransparencyPanel({ rawLogic, modelName, createdAt }: TransparencyPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen((previous) => !previous)}
      >
        <Info className="h-4 w-4" />
        Transparency
      </Button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[min(32rem,80vw)] rounded-xl border border-border bg-card p-4 shadow-xl">
          <h4 className="text-sm font-semibold">AI Transparency Details</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Raw model reasoning is shown from audit logs for governance and explainability.
          </p>

          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <p>Model: {modelName ?? "Unavailable"}</p>
            <p>Logged At: {createdAt ? new Date(createdAt).toLocaleString() : "Unavailable"}</p>
          </div>

          <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted p-3 text-xs text-foreground">
            {rawLogic ?? "No raw AI logic is available for this run. Sign in and ensure audit log access is enabled."}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
