import { DashboardLayout } from "@/components/dashboard-layout";
import { UploadAnalyzePanel } from "@/components/upload-analyze-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <DashboardLayout>
      <UploadAnalyzePanel />

      <Card className="h-fit border-white/10 bg-card/70">
        <CardHeader>
          <CardTitle>System Notes</CardTitle>
          <CardDescription>Lightweight local runtime, cloud-executed heavy operations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>- Uploads go directly to Supabase Storage from browser.</p>
          <p>- Backend handles orchestration and audit logging only.</p>
          <p>- AI inference runs on Gemini API, not your local machine.</p>
          <p>- Oversized files are blocked client-side before upload.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
