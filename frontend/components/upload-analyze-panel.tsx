"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, UploadCloud, Video } from "lucide-react";

import { analyzeContent, AnalyzeResult } from "@/lib/api";
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

  const isBusy = stage !== "idle";

  const stageLabel = useMemo(() => {
    if (stage === "uploading") {
      return "Uploading to Supabase Storage...";
    }
    if (stage === "analyzing") {
      return "Analyzing with Gemini 1.5 Pro...";
    }
    return null;
  }, [stage]);

  const readyToAnalyze = Boolean(file) && !isBusy;

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

      if (userId) {
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
      <motion.div
        whileHover={{ rotateX: 2, rotateY: -2, scale: 1.02 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d", perspective: 1200 }}
        className="will-change-transform"
      >
        <Card className="vision-glass overflow-hidden">
          <CardHeader className="flex flex-col gap-2 p-6">
            <CardTitle>Upload and Analyze</CardTitle>
            <CardDescription>
              Drag a short-form video to upload directly to Supabase and run virality analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-6 pt-0">
            <label
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              htmlFor="video-upload-input"
              className={cn(
                "flex min-h-40 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition",
                isDragging ? "border-white/30 bg-white/10" : "",
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
              <UploadCloud className={cn("mb-3 h-8 w-8 text-muted-foreground", readyToAnalyze && "animate-pulse text-primary")} />
              <p className="text-sm font-medium">Drop video here or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">Maximum file size: 50MB</p>
            </label>

            {file ? (
              <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Video className="h-4 w-4 text-primary" />
                  <span className="truncate">{file.name}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : null}

            {stageLabel ? (
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{stageLabel}</span>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-300">{error}</p> : null}

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
