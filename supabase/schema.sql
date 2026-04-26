-- ===============================================
-- ViralVantage-AI: Final Consolidated Schema
-- ===============================================

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) AI Audit Logs Table
CREATE TABLE IF NOT EXISTS public.ai_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  input_type text NOT NULL CHECK (input_type IN ('text', 'image', 'video', 'audio', 'mixed')),
  input_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_payload jsonb,
  model_provider text NOT NULL DEFAULT 'google',
  model_name text NOT NULL DEFAULT 'gemini-1.5-pro',
  model_version text,
  request_id text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'timeout')),
  latency_ms integer CHECK (latency_ms IS NULL OR latency_ms >= 0),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Auto-maintain updated_at
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ai_audit_logs_set_updated_at ON public.ai_audit_logs;
CREATE TRIGGER trg_ai_audit_logs_set_updated_at
BEFORE UPDATE ON public.ai_audit_logs
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Enable RLS for ai_audit_logs
ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- DROP old policies to ensure a clean state
DROP POLICY IF EXISTS "ai_audit_logs_select_own" ON public.ai_audit_logs;
DROP POLICY IF EXISTS "ai_audit_logs_insert_own" ON public.ai_audit_logs;

-- Re-create policies (Public for current dev testing)
CREATE POLICY "Public log select" ON public.ai_audit_logs FOR SELECT TO public USING (true);
CREATE POLICY "Public log insert" ON public.ai_audit_logs FOR INSERT TO public WITH CHECK (true);

-- 2) Storage Bucket for Creator Uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'creator_content',
  'creator_content',
  true, -- Set to true for easier development testing
  52428800,
  ARRAY['video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE
SET public = excluded.public, file_size_limit = excluded.file_size_limit;

-- 3) Storage Policies (Enabling Public testing to fix 'Bucket not found' errors)
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Read" ON storage.objects;

CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'creator_content');

CREATE POLICY "Public Read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'creator_content');