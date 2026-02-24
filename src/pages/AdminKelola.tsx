import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSubmissions } from "@/contexts/SubmissionContext";
import { useAuth } from "@/contexts/AuthContext";
import { deriveStages, getActiveStageIndex } from "@/data/mockData";
import { ArrowLeft, LogOut } from "lucide-react";
import ProgressStepper from "@/components/ProgressStepper";
import StageDetailAdmin from "@/components/StageDetailAdmin";

const AdminKelola = () => {
  const { id } = useParams<{ id: string }>();
  const { getSubmission } = useSubmissions();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const submission = getSubmission(id || "");
  const stages = submission ? deriveStages(submission) : [];
  const [selectedStage, setSelectedStage] = useState(() =>
    submission ? getActiveStageIndex(submission) : 0
  );

  if (!submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Permohonan tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">PB</span>
            </div>
            <span className="font-heading font-semibold text-foreground text-sm">Sistem Tracking PB UMKU</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </button>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-status-revision hover:bg-status-revision-bg rounded-lg transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-heading font-bold text-foreground">Kelola Permohonan</h1>
        </div>

        {/* Info */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-heading font-bold text-foreground mb-4">Informasi Permohonan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <InfoRow label="Nomor Permohonan" value={submission.submissionNumber} />
            <InfoRow label="Nama LPK" value={submission.organizationName} />
            <InfoRow label="Terakhir Diperbarui" value={submission.lastUpdated} />
          </div>
        </div>

        {/* Stepper */}
        <ProgressStepper stages={stages} selectedIndex={selectedStage} onStageClick={setSelectedStage} />

        {/* Stage Detail */}
        <StageDetailAdmin submission={submission} stageIndex={selectedStage} stages={stages} />
      </main>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium text-foreground">{value}</p>
  </div>
);

export default AdminKelola;
