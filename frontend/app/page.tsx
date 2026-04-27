import { DashboardLayout } from "@/components/dashboard-layout";
import { UploadAnalyzePanel } from "@/components/upload-analyze-panel";

export default function HomePage() {
  return (
    <DashboardLayout>
      <UploadAnalyzePanel />
    </DashboardLayout>
  );
}
