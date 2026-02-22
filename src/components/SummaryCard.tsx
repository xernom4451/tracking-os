import { Building2, Clock, Hash, Activity } from "lucide-react";
import type { StageStatus } from "@/data/mockData";

interface SummaryCardProps {
  submissionNumber: string;
  organizationName: string;
  currentStatus: string;
  currentStatusType: StageStatus;
  currentStage: string;
  lastUpdated: string;
}

const statusBadgeClasses: Record<StageStatus, string> = {
  completed: "bg-status-completed-bg text-status-completed",
  active: "bg-status-active-bg text-status-active",
  pending: "bg-status-pending-bg text-status-pending",
  revision: "bg-status-revision-bg text-status-revision",
};

const SummaryCard = ({
  submissionNumber,
  organizationName,
  currentStatus,
  currentStatusType,
  currentStage,
  lastUpdated,
}: SummaryCardProps) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Nomor Permohonan</p>
          <p className="text-lg font-heading font-bold text-foreground">{submissionNumber}</p>
        </div>
        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${statusBadgeClasses[currentStatusType]}`}>
          <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse-soft" />
          {currentStatus}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoItem icon={Building2} label="Nama LPK" value={organizationName} />
        <InfoItem icon={Activity} label="Tahap Saat Ini" value={currentStage} />
        <InfoItem icon={Clock} label="Terakhir Diperbarui" value={lastUpdated} />
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 rounded-lg bg-secondary">
      <Icon className="w-4 h-4 text-accent" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export default SummaryCard;
