import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSubmissions, type AdminSubmission } from "@/contexts/SubmissionContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Stage, Document } from "@/data/mockData";
import { Check, AlertTriangle, Lock, ArrowLeft, Save, LogOut } from "lucide-react";
import { toast } from "sonner";

const stageLabels = ["Pengajuan", "Verifikasi Dokumen", "Peninjauan", "Persetujuan", "Izin Terbit"];

const stageStatusOptions = [
  { value: "completed", label: "Selesai" },
  { value: "active", label: "Sedang Diproses" },
  { value: "revision", label: "Perlu Perbaikan" },
  { value: "pending", label: "Pending" },
] as const;

const docStatusOptions = [
  { value: "approved", label: "Disetujui" },
  { value: "under_review", label: "Sedang Diverifikasi" },
  { value: "revision_required", label: "Perlu Perbaikan" },
] as const;

const AdminKelola = () => {
  const { id } = useParams<{ id: string }>();
  const { getSubmission, updateSubmission } = useSubmissions();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const original = getSubmission(id || "");
  const [stages, setStages] = useState<Stage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    if (original) {
      setStages([...original.stages]);
      setDocuments([...original.documents]);
      const n: Record<number, string> = {};
      original.documents.forEach((d, i) => {
        if (d.note) n[i] = d.note;
      });
      setNotes(n);
    }
  }, [original]);

  if (!original) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Permohonan tidak ditemukan.</p>
      </div>
    );
  }

  const updateStageStatus = (idx: number, status: Stage["status"]) => {
    setStages((prev) => prev.map((s, i) => (i === idx ? { ...s, status } : s)));
  };

  const updateDocStatus = (idx: number, status: Document["status"]) => {
    setDocuments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], status, note: status === "revision_required" ? (notes[idx] || "") : undefined };
      // enforce sequential: lock everything after a non-approved doc
      let lockRest = false;
      for (let i = 0; i < next.length; i++) {
        if (lockRest) {
          next[i] = { ...next[i], status: "locked", note: undefined };
        } else if (next[i].status !== "approved") {
          // this is the active/revision doc, lock the rest
          if (i < next.length - 1) lockRest = true;
        }
      }
      return next;
    });
  };

  const isDocDisabled = (idx: number) => {
    if (idx === 0) return false;
    return documents[idx - 1]?.status !== "approved";
  };

  const handleSave = () => {
    const now = new Date();
    const formatted = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) +
      ", " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

    // Determine current status from stages
    const activeStage = stages.find((s) => s.status === "active");
    const revisionStage = stages.find((s) => s.status === "revision");
    const allCompleted = stages.every((s) => s.status === "completed");

    let currentStatus = "Pengajuan";
    let currentStatusType: AdminSubmission["currentStatusType"] = "pending";

    if (allCompleted) {
      currentStatus = "Izin Terbit";
      currentStatusType = "completed";
    } else if (revisionStage) {
      currentStatus = revisionStage.label;
      currentStatusType = "revision";
    } else if (activeStage) {
      currentStatus = activeStage.label;
      currentStatusType = "active";
    }

    const finalDocs = documents.map((d, i) => ({
      ...d,
      note: d.status === "revision_required" ? (notes[i] || undefined) : undefined,
    }));

    updateSubmission(original.id, {
      stages,
      documents: finalDocs,
      currentStatus,
      currentStatusType,
      lastUpdated: formatted,
    });

    toast.success("Perubahan berhasil disimpan.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-heading font-bold text-foreground">Kelola Permohonan</h1>
        </div>

        {/* Section A – Info */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-heading font-bold text-foreground mb-4">Informasi Permohonan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Nomor Permohonan</p>
              <p className="font-medium text-foreground">{original.submissionNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nama LPK</p>
              <p className="font-medium text-foreground">{original.organizationName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tahap Saat Ini</p>
              <p className="font-medium text-foreground">{original.currentStatus}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium text-foreground capitalize">{original.currentStatusType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Terakhir Diperbarui</p>
              <p className="font-medium text-foreground">{original.lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* Section B – Stepper */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-heading font-bold text-foreground mb-6">Update Tahapan Proses</h2>
          <div className="flex items-start justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-10" />
            {stages.map((stage, i) => (
              <div key={i} className="relative flex flex-col items-center flex-1">
                <StepIconAdmin status={stage.status} />
                <p className="mt-2 text-xs font-medium text-center text-foreground">{stage.label}</p>
                <select
                  value={stage.status}
                  onChange={(e) => updateStageStatus(i, e.target.value as Stage["status"])}
                  className="mt-2 text-xs border border-input rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full max-w-[120px]"
                >
                  {stageStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Section C – Documents */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-heading font-bold text-foreground mb-1">Verifikasi Dokumen</h2>
          <p className="text-sm text-muted-foreground mb-6">Dokumen diverifikasi secara berurutan. Hanya satu dokumen yang dapat diverifikasi pada satu waktu.</p>
          <div className="space-y-3">
            {documents.map((doc, i) => {
              const disabled = isDocDisabled(i);
              const isLocked = doc.status === "locked" || disabled;

              return (
                <div
                  key={i}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border transition-all ${
                    isLocked ? "bg-muted/50 border-border opacity-60" : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-muted-foreground text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className={`text-sm font-medium ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>{doc.name}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:shrink-0">
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-status-locked bg-status-locked-bg">
                        <Lock className="w-3 h-3" />
                        Terkunci
                      </span>
                    ) : (
                      <select
                        value={doc.status === "locked" ? "under_review" : doc.status}
                        onChange={(e) => updateDocStatus(i, e.target.value as Document["status"])}
                        className="text-xs border border-input rounded-md px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-[160px]"
                      >
                        {docStatusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  {doc.status === "revision_required" && !isLocked && (
                    <div className="w-full mt-2">
                      <textarea
                        placeholder="Catatan Perbaikan"
                        value={notes[i] || ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [i]: e.target.value }))}
                        className="w-full text-xs border border-input rounded-md px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section D – Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm shadow-sm"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </main>
    </div>
  );
};

const StepIconAdmin = ({ status }: { status: Stage["status"] }) => {
  const base = "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all";
  if (status === "completed")
    return <div className={`${base} bg-status-completed border-status-completed`}><Check className="w-4 h-4 text-primary-foreground" /></div>;
  if (status === "active")
    return <div className={`${base} bg-status-active-bg border-status-active animate-pulse-soft`}><span className="w-3 h-3 rounded-full bg-status-active" /></div>;
  if (status === "revision")
    return <div className={`${base} bg-status-revision-bg border-status-revision`}><AlertTriangle className="w-4 h-4 text-status-revision" /></div>;
  return <div className={`${base} bg-status-pending-bg border-status-pending`}><span className="w-3 h-3 rounded-full bg-status-pending/40" /></div>;
};

export default AdminKelola;
