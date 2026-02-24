import { useState } from "react";
import { Check, Lock, Save, AlertTriangle } from "lucide-react";
import { useSubmissions, type AdminSubmission } from "@/contexts/SubmissionContext";
import type { Stage, DocumentStatus } from "@/data/mockData";
import { toast } from "sonner";

interface StageDetailAdminProps {
  submission: AdminSubmission;
  stageIndex: number;
  stages: Stage[];
}

const docStatusOptions = [
  { value: "under_review", label: "Sedang Diverifikasi" },
  { value: "approved", label: "Disetujui" },
  { value: "revision_required", label: "Perlu Perbaikan" },
] as const;

const StageDetailAdmin = ({ submission, stageIndex, stages }: StageDetailAdminProps) => {
  const stage = stages[stageIndex];

  if (stage.status === "locked") {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center">
        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Tahap ini belum dapat diakses.</p>
      </div>
    );
  }

  if (stage.status === "completed") {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Check className="w-4 h-4 text-status-completed" />
          <h3 className="text-base font-heading font-bold text-foreground">{stage.label}</h3>
        </div>
        <p className="text-sm text-muted-foreground">Tahap ini sudah selesai (read-only).</p>
      </div>
    );
  }

  // Active stage — editable
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h3 className="text-base font-heading font-bold text-foreground mb-4">Kelola — {stage.label}</h3>
      {stageIndex === 0 && <PengajuanAdmin submission={submission} />}
      {stageIndex === 1 && <VerifikasiAdmin submission={submission} />}
      {stageIndex === 2 && <PeninjauanAdmin submission={submission} />}
      {stageIndex === 3 && <PersetujuanAdmin submission={submission} />}
      {stageIndex === 4 && <IzinTerbitAdmin submission={submission} />}
    </div>
  );
};

const PengajuanAdmin = ({ submission }: { submission: AdminSubmission }) => {
  const { confirmPengajuan } = useSubmissions();
  return (
    <div className="space-y-4">
      <div className="text-sm space-y-2">
        <InfoRow label="Tanggal Pengajuan" value={submission.pengajuanDate} />
        <InfoRow label="Nama LPK" value={submission.organizationName} />
      </div>
      <button
        onClick={() => { confirmPengajuan(submission.id); toast.success("Pengajuan dikonfirmasi."); }}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Check className="w-4 h-4" />
        Konfirmasi Pengajuan
      </button>
    </div>
  );
};

const VerifikasiAdmin = ({ submission }: { submission: AdminSubmission }) => {
  const { updateDocStatus } = useSubmissions();
  const [notes, setNotes] = useState<Record<number, string>>(() => {
    const n: Record<number, string> = {};
    submission.documents.forEach((d, i) => { if (d.note) n[i] = d.note; });
    return n;
  });
  const [errors, setErrors] = useState<Record<number, boolean>>({});

  const approvedCount = submission.documents.filter((d) => d.status === "approved").length;

  // Find the first non-approved doc index (the editable one)
  const editableIndex = submission.documents.findIndex((d) => d.status !== "approved");

  const handleStatusChange = (idx: number, status: DocumentStatus) => {
    if (status === "revision_required" && !notes[idx]?.trim()) {
      setErrors((prev) => ({ ...prev, [idx]: true }));
      toast.error("Catatan perbaikan wajib diisi.");
      return;
    }
    setErrors((prev) => ({ ...prev, [idx]: false }));
    updateDocStatus(submission.id, idx, status, notes[idx]?.trim() || undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-status-completed rounded-full transition-all" style={{ width: `${(approvedCount / 8) * 100}%` }} />
        </div>
        <span className="text-sm font-medium text-foreground">{approvedCount}/8 disetujui</span>
      </div>

      <div className="space-y-2">
        {submission.documents.map((doc, i) => {
          const isEditable = i === editableIndex;
          const isApproved = doc.status === "approved";
          const isLocked = !isEditable && !isApproved;
          const currentNote = notes[i] || "";
          const currentStatus = doc.status === "locked" ? "under_review" : doc.status;

          return (
            <div
              key={i}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border ${
                isLocked ? "bg-muted/50 border-border opacity-60" : "bg-card border-border"
              }`}
            >
              {/* Number + Name */}
              <div className="flex items-center gap-2 min-w-0 sm:w-[240px] shrink-0">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-muted-foreground text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <p className={`text-sm font-medium truncate ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>{doc.name}</p>
              </div>

              {/* Status dropdown */}
              <div className="shrink-0 w-[180px]">
                {isLocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-status-locked bg-status-locked-bg">
                    <Lock className="w-3 h-3" />
                    Terkunci
                  </span>
                ) : isApproved ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-status-completed bg-status-completed-bg">
                    <Check className="w-3 h-3" />
                    Disetujui
                  </span>
                ) : (
                  <select
                    value={currentStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value as DocumentStatus;
                      if (newStatus === "revision_required" && !currentNote.trim()) {
                        // Just set the dropdown visually, don't commit yet
                        // We need a local state for this... let's commit directly
                        setErrors((prev) => ({ ...prev, [i]: true }));
                        // Still update so user sees the dropdown change - but use updateDocStatus only if note present
                        // Actually let's just update it directly and show error
                        updateDocStatus(submission.id, i, newStatus, currentNote.trim() || undefined);
                        return;
                      }
                      handleStatusChange(i, newStatus);
                    }}
                    className="w-full text-xs border border-input rounded-md px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {docStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Catatan - always visible */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <input
                    type="text"
                    value={currentNote}
                    onChange={(e) => {
                      setNotes((prev) => ({ ...prev, [i]: e.target.value }));
                      if (e.target.value.trim()) setErrors((prev) => ({ ...prev, [i]: false }));
                    }}
                    onBlur={() => {
                      if (doc.status === "revision_required" && currentNote.trim()) {
                        updateDocStatus(submission.id, i, "revision_required", currentNote.trim());
                      }
                    }}
                    disabled={isLocked || isApproved}
                    placeholder={
                      doc.status === "revision_required"
                        ? "Wajib diisi: jelaskan perbaikan yang diminta"
                        : "Tulis catatan (opsional)"
                    }
                    className={`w-full text-xs border rounded-md px-2.5 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors[i] ? "border-status-revision" : "border-input"
                    }`}
                  />
                  {errors[i] && (
                    <p className="text-xs text-status-revision mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Catatan wajib diisi
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PeninjauanAdmin = ({ submission }: { submission: AdminSubmission }) => {
  const { completeReview } = useSubmissions();
  const [notes, setNotes] = useState(submission.reviewNotes || "");

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Catatan Peninjauan</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tulis catatan hasil peninjauan dokumen..."
          className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          rows={4}
        />
      </div>
      <button
        onClick={() => { completeReview(submission.id, notes); toast.success("Peninjauan selesai."); }}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Check className="w-4 h-4" />
        Selesaikan Peninjauan
      </button>
    </div>
  );
};

const PersetujuanAdmin = ({ submission }: { submission: AdminSubmission }) => {
  const { approveApplication } = useSubmissions();
  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground">Semua tahap sebelumnya telah selesai. Klik tombol di bawah untuk menyetujui permohonan ini.</p>
      <button
        onClick={() => { approveApplication(submission.id); toast.success("Permohonan disetujui."); }}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Check className="w-4 h-4" />
        Setujui Permohonan
      </button>
    </div>
  );
};

const IzinTerbitAdmin = ({ submission }: { submission: AdminSubmission }) => {
  const { issueLicense } = useSubmissions();
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseDate, setLicenseDate] = useState("");

  const handleIssue = () => {
    if (!licenseNumber.trim() || !licenseDate.trim()) {
      toast.error("Nomor izin dan tanggal terbit wajib diisi.");
      return;
    }
    issueLicense(submission.id, licenseNumber.trim(), licenseDate.trim());
    toast.success("Izin berhasil diterbitkan.");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Nomor Izin</label>
          <input
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="IMT-2026-XXXXX"
            className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Tanggal Terbit</label>
          <input
            type="date"
            value={licenseDate}
            onChange={(e) => setLicenseDate(e.target.value)}
            className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <button
        onClick={handleIssue}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Check className="w-4 h-4" />
        Terbitkan Izin
      </button>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium text-foreground text-sm">{value}</p>
  </div>
);

export default StageDetailAdmin;
