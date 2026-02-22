import { useState } from "react";
import SearchSection from "@/components/SearchSection";
import SummaryCard from "@/components/SummaryCard";
import ProgressStepper from "@/components/ProgressStepper";
import DocumentList from "@/components/DocumentList";
import Timeline from "@/components/Timeline";
import { mockSubmission } from "@/data/mockData";

const Index = () => {
  const [submission, setSubmission] = useState<typeof mockSubmission | null>(null);

  const handleSearch = (query: string) => {
    // Mock: always show data for demo
    if (query.trim()) {
      setSubmission(mockSubmission);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-sm">PB</span>
            </div>
            <span className="font-heading font-semibold text-foreground text-sm">Sistem Tracking PB UMKU</span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">Kementerian Ketenagakerjaan RI</span>
        </div>
      </header>

      <SearchSection onSearch={handleSearch} />

      {submission && (
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <SummaryCard
            submissionNumber={submission.submissionNumber}
            organizationName={submission.organizationName}
            currentStatus={submission.currentStatus}
            currentStatusType={submission.currentStatusType}
            currentStage={submission.currentStage}
            lastUpdated={submission.lastUpdated}
          />
          <ProgressStepper stages={submission.stages} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <DocumentList documents={submission.documents} />
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
