import { Check, Clock, AlertTriangle, Lock, FileText, Download } from "lucide-react";
import type { AdminSubmission } from "@/contexts/SubmissionContext";
import type { Stage } from "@/data/mockData";

interface StageDetailUserProps {
  submission: AdminSubmission;
  stageIndex: number;
  stages: Stage[];
}

const statusConfig = {
  approved: { icon: Check, label: "Disetujui", className: "text-status-completed bg-status-completed-bg" },
  under_review: { icon: Clock, label: "Sedang Diverifikasi", className: "text-status-active bg-status-active-bg" },
  revision_required: { icon: AlertTriangle, label: "Perlu Perbaikan", className: "text-status-revision bg-status-revision-bg" },
  locked: { icon: Lock, label: "Terkunci", className: "text-status-locked bg-status-locked-bg" },
};

const StageDetailUser = ({ submission, stageIndex, stages }: StageDetailUserProps) => {
  const stage = stages[stageIndex];

  if (stage.status === "locked") {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center">
        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Tahap ini belum dapat diakses.</p>
        <p className="text-xs text-muted-foreground mt-1">Tahap sebelumnya harus diselesaikan terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h3 className="text-base font-heading font-bold text-foreground mb-4">Detail — {stage.label}</h3>
      {stageIndex === 0 && <PengajuanDetail submission={submission} />}
      {stageIndex === 1 && <VerifikasiDetail submission={submission} />}
      {stageIndex === 2 && <PeninjauanDetail submission={submission} completed={stage.status === "completed"} />}
      {stageIndex === 3 && <PersetujuanDetail submission={submission} completed={stage.status === "completed"} />}
      {stageIndex === 4 && <IzinTerbitDetail submission={submission} completed={stage.status === "completed"} />}
    </div>
  );
};

const PengajuanDetail = ({ submission }: { submission: AdminSubmission }) => (
  <div className="space-y-3 text-sm">
    <InfoRow label="Tanggal Pengajuan" value={submission.pengajuanDate} />
    <InfoRow label="Nomor Permohonan" value={submission.submissionNumber} />
    <InfoRow label="Nama LPK" value={submission.organizationName} />
    <InfoRow label="Status" value={submission.pengajuanConfirmed ? "Dikonfirmasi" : "Menunggu Konfirmasi"} />
  </div>
);

const VerifikasiDetail = ({ submission }: { submission: AdminSubmission }) => {
  const approvedCount = submission.documents.filter((d) => d.status === "approved").length;
  const total = submission.documents.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-status-completed rounded-full transition-all"
            style={{ width: `${(approvedCount / total) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-foreground">{approvedCount}/{total}</span>
      </div>
      <div className="space-y-2">
        {submission.documents.map((doc, i) => {
          const config = statusConfig[doc.status];
          const Icon = config.icon;
          const isLocked = doc.status === "locked";
          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                isLocked ? "bg-muted/50 border-border opacity-60" : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-muted-foreground text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>{doc.name}</p>
                {doc.note && <p className="text-xs text-status-revision mt-1">⚠ {doc.note}</p>}
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${config.className}`}>
                <Icon className="w-3 h-3" />
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PeninjauanDetail = ({ submission, completed }: { submission: AdminSubmission; completed: boolean }) => (
  <div className="space-y-3 text-sm">
    {completed ? (
      <>
        <InfoRow label="Status" value="Peninjauan Selesai" />
        <div>
          <p className="text-xs text-muted-foreground mb-1">Catatan Peninjauan</p>
          <p className="text-sm text-foreground bg-secondary/50 rounded-lg p-3">{submission.reviewNotes || "-"}</p>
        </div>
      </>
    ) : (
      <p className="text-muted-foreground">Peninjauan dokumen sedang berlangsung.</p>
    )}
  </div>
);

const PersetujuanDetail = ({ submission, completed }: { submission: AdminSubmission; completed: boolean }) => (
  <div className="space-y-3 text-sm">
    {completed ? (
      <>
        <InfoRow label="Status" value="Permohonan Disetujui" />
        <InfoRow label="Tanggal Persetujuan" value={submission.approvalDate} />
      </>
    ) : (
      <p className="text-muted-foreground">Menunggu persetujuan permohonan.</p>
    )}
  </div>
);

const IzinTerbitDetail = ({ submission, completed }: { submission: AdminSubmission; completed: boolean }) => (
  <div className="space-y-3 text-sm">
    {completed ? (
      <>
        <InfoRow label="Nomor Izin" value={submission.licenseNumber} />
        <InfoRow label="Tanggal Terbit" value={submission.licenseDate} />
        <button className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mt-2">
          <Download className="w-3 h-3" />
          Unduh Surat Izin
        </button>
      </>
    ) : (
      <p className="text-muted-foreground">Menunggu penerbitan izin.</p>
    )}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium text-foreground">{value}</p>
  </div>
);

export default StageDetailUser;
