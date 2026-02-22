import { Check, Clock, AlertTriangle, Lock } from "lucide-react";
import type { Document } from "@/data/mockData";

interface DocumentListProps {
  documents: Document[];
}

const statusConfig = {
  approved: { icon: Check, label: "Disetujui", className: "text-status-completed bg-status-completed-bg" },
  under_review: { icon: Clock, label: "Sedang Ditinjau", className: "text-status-active bg-status-active-bg" },
  revision_required: { icon: AlertTriangle, label: "Revisi Diperlukan", className: "text-status-revision bg-status-revision-bg" },
  locked: { icon: Lock, label: "Terkunci", className: "text-status-locked bg-status-locked-bg" },
};

const DocumentList = ({ documents }: DocumentListProps) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-heading font-bold text-foreground mb-1">Verifikasi Dokumen</h2>
      <p className="text-sm text-muted-foreground mb-6">Dokumen diverifikasi secara berurutan. Dokumen berikutnya baru dapat diproses setelah dokumen sebelumnya disetujui.</p>
      <div className="space-y-3">
        {documents.map((doc, i) => {
          const config = statusConfig[doc.status];
          const Icon = config.icon;
          const isLocked = doc.status === "locked";

          return (
            <div
              key={i}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                isLocked ? "bg-muted/50 border-border opacity-60" : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-muted-foreground text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>{doc.name}</p>
                {doc.note && (
                  <p className="text-xs text-status-revision mt-1">⚠ {doc.note}</p>
                )}
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${config.className}`}>
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

export default DocumentList;
