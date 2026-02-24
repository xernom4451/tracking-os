import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchSection from "@/components/SearchSection";
import SummaryCard from "@/components/SummaryCard";
import ProgressStepper from "@/components/ProgressStepper";
import StageDetailUser from "@/components/StageDetailUser";
import Timeline from "@/components/Timeline";
import { useSubmissions, type AdminSubmission } from "@/contexts/SubmissionContext";
import { deriveStages, deriveDisplayStatus, getActiveStageIndex } from "@/data/mockData";
import { LogIn } from "lucide-react";

const Index = () => {
  const [submission, setSubmission] = useState<AdminSubmission | null>(null);
  const [selectedStage, setSelectedStage] = useState(0);
  const { findByNumber } = useSubmissions();
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const found = findByNumber(query.trim());
      setSubmission(found || null);
      if (found) {
        setSelectedStage(getActiveStageIndex(found));
      }
    }
  };

  const stages = submission ? deriveStages(submission) : [];
  const displayStatus = submission ? deriveDisplayStatus(submission) : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">PB</span>
            </div>
            <span className="font-heading font-semibold text-foreground text-sm">Sistem Tracking PB UMKU</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">Kementerian Ketenagakerjaan RI</span>
            <button
              onClick={() => navigate("/admin/login")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors ml-3"
            >
              <LogIn className="w-3 h-3" />
              Login Admin
            </button>
          </div>
        </div>
      </header>

      <SearchSection onSearch={handleSearch} />

      {submission && displayStatus && (
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <SummaryCard
            submissionNumber={submission.submissionNumber}
            organizationName={submission.organizationName}
            currentStatus={displayStatus.label}
            currentStatusType={displayStatus.type}
            lastUpdated={submission.lastUpdated}
          />
          <ProgressStepper stages={stages} selectedIndex={selectedStage} onStageClick={setSelectedStage} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <StageDetailUser submission={submission} stageIndex={selectedStage} stages={stages} />
            </div>
            <div className="lg:col-span-2">
              <Timeline events={submission.timeline} />
            </div>
          </div>
        </main>
      )}

      {!submission && (
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground text-sm">Masukkan Nomor Permohonan OSS untuk melihat status pengajuan Anda.</p>
        </div>
      )}

      <footer className="border-t border-border py-6 mt-12">
        <p className="text-center text-xs text-muted-foreground">© 2026 Kementerian Ketenagakerjaan Republik Indonesia. Hak cipta dilindungi.</p>
      </footer>
    </div>
  );
};

export default Index;
