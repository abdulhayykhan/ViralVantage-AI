"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, UploadCloud, Video } from "lucide-react";

import { analyzeContent, AnalyzeResult, MOCK_VIRAL_RESULT } from "@/lib/api";
import { supabase } from "@/lib/supabase-client";
import { ResultsDashboard } from "@/components/results-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "creator_content";

type UploadStage = "idle" | "uploading" | "analyzing";

type TransparencyData = {
  rawLogic: string | null;
  modelName: string | null;
  createdAt: string | null;
};

export function UploadAnalyzePanel() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [transparencyData, setTransparencyData] = useState<TransparencyData | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [showOfflineModeNotice, setShowOfflineModeNotice] = useState(false);

  const isBusy = stage !== "idle";

  const stageLabel = useMemo(() => {
    if (stage === "uploading") {
      return "Uploading to Supabase Storage...";
    }
    if (stage === "analyzing") {
      return "Analyzing with Gemini 2.5 Flash...";
    }
    return null;
  }, [stage]);

  const readyToAnalyze = Boolean(file) && !isBusy;

  useEffect(() => {
    if (!showOfflineModeNotice) {
      return;
    }

    const timerId = globalThis.setTimeout(() => {
      setShowOfflineModeNotice(false);
    }, 5000);

    return () => globalThis.clearTimeout(timerId);
  }, [showOfflineModeNotice]);

  function validateFile(nextFile: File): string | null {
    if (!nextFile.type.startsWith("video/")) {
      return "Only video files are supported.";
    }
    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      return "File exceeds 50MB. Please upload a smaller video.";
    }
    return null;
  }

  function applyFile(nextFile: File | null) {
    setAnalysis(null);
    setTransparencyData(null);
    setError(null);

    if (!nextFile) {
      setFile(null);
      return;
    }

    const validationError = validateFile(nextFile);
    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }

    setFile(nextFile);
  }

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    applyFile(selectedFile);
  }

  function onDragOver(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (!isBusy) {
      setIsDragging(true);
    }
  }

  function onDragLeave(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function onDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (isBusy) {
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    applyFile(droppedFile);
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please choose a video file first.");
      return;
    }

    setError(null);
    setAnalysis(null);
    setTransparencyData(null);
    setIsMockData(false);
    setShowOfflineModeNotice(false);
    setStage("uploading");

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      const cleanName = file.name.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
      const objectPath = `${userId ?? "anonymous"}/${Date.now()}-${cleanName}`;

      const uploadResult = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (uploadResult.error) {
        const uploadErrorText = uploadResult.error.message.toLowerCase();
        if (uploadErrorText.includes("row-level security") || uploadErrorText.includes("permission")) {
          setError("Upload denied by Supabase policies. Sign in and retry.");
          return;
        }
        setError(uploadResult.error.message);
        return;
      }

      const publicUrlResult = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
      const videoUrl = publicUrlResult.data.publicUrl;

      if (!videoUrl) {
        setError("Could not generate public URL for uploaded video.");
        return;
      }

      setStage("analyzing");

      const result = await analyzeContent({
        video_url: videoUrl,
        user_id: userId,
      });
      setAnalysis(result);

      const usedMockResult = result === MOCK_VIRAL_RESULT;
      setIsMockData(usedMockResult);
      setShowOfflineModeNotice(usedMockResult);

      if (userId && !usedMockResult) {
        const auditDetails = await fetchTransparencyFromAuditLog(userId, videoUrl);
        setTransparencyData(auditDetails);
      }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Upload or analyze request failed.";
      setError(message);
    } finally {
      setStage("idle");
    }
  }

  async function fetchTransparencyFromAuditLog(userId: string, videoUrl: string): Promise<TransparencyData | null> {
    const table = supabase.from("ai_audit_logs");

    const primaryQuery = await table
      .select("output_payload,model_name,created_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .eq("input_payload->>video_url", videoUrl)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let row = primaryQuery.data;

    if (!row) {
      const fallbackQuery = await table
        .select("output_payload,model_name,created_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      row = fallbackQuery.data;
    }

    if (!row) {
      return null;
    }

    const outputPayload = (row.output_payload ?? {}) as Record<string, unknown>;
    const rawLogic = typeof outputPayload.raw_ai_logic === "string" ? outputPayload.raw_ai_logic : null;

    return {
      rawLogic,
      modelName: typeof row.model_name === "string" ? row.model_name : null,
      createdAt: typeof row.created_at === "string" ? row.created_at : null,
    };
  }

  return (
    <>
      <motion.div whileHover={{}} transition={{ duration: 0.5 }} className="glass-lift sticky top-8">
        <Card className="glass-panel overflow-hidden rounded-3xl">
          <CardHeader className="flex flex-col gap-3 p-8 pb-5 z-10">
            <CardTitle className="text-3xl font-semibold brand-h2">Upload and Analyze</CardTitle>
            <CardDescription className="max-w-prose text-[15px] leading-6 text-muted-foreground">
              Drag a short-form video to upload. Panels use premium glass for an elevated, cinematic experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-8 pt-0 z-10">
            <label
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              htmlFor="video-upload-input"
              className={cn(
                "glass-subtle glass-lift flex min-h-44 flex-col items-center justify-center rounded-2xl p-7 text-center",
                isDragging ? "border-accent-primary bg-accent-primary/6" : "",
                isBusy && "cursor-not-allowed opacity-70",
              )}
            >
              <input
                id="video-upload-input"
                type="file"
                accept="video/*"
                onChange={onFileInput}
                disabled={isBusy}
                className="sr-only"
                aria-label="Upload video"
              />
              <UploadCloud className={cn("mb-3 h-10 w-10 text-muted-foreground", readyToAnalyze && "animate-pulse text-accent-primary")} />
              <p className="text-lg font-semibold tracking-[-0.01em]">Drop video here or click to browse</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Maximum file size: 50MB</p>
            </label>

            {file ? (
              <div className="glass-subtle flex flex-col gap-1 rounded-2xl p-4 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Video className="h-4 w-4 text-accent-primary" />
                  <span className="truncate">{file.name}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : null}

            {stageLabel ? (
              <div className="glass-subtle flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-accent-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">{stageLabel}</span>
              </div>
            ) : null}

            {showOfflineModeNotice ? (
              <div className="rounded-2xl border border-amber-400 bg-amber-50/40 px-4 py-3 text-sm font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
                Offline Mode: Using cached analysis
              </div>
            ) : null}

            {isMockData && !showOfflineModeNotice ? (
              <p className="text-xs text-amber-600">Cached analysis used for demo reliability.</p>
            ) : null}

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <Button onClick={handleAnalyze} disabled={!file || isBusy} className="w-full">
              {isBusy ? "Processing..." : "Analyze Video"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <ResultsDashboard analysis={analysis} transparencyData={transparencyData} />
    </>
  );
}
