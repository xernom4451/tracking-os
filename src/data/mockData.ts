export type DocumentStatus = "approved" | "under_review" | "revision_required" | "locked";
export type StageStatus = "completed" | "active" | "pending" | "revision";

export interface Document {
  name: string;
  status: DocumentStatus;
  note?: string;
}

export interface Stage {
  label: string;
  status: StageStatus;
}

export interface TimelineEvent {
  date: string;
  time: string;
  description: string;
  type: "info" | "warning" | "success" | "error";
}

export interface SubmissionData {
  submissionNumber: string;
  organizationName: string;
  currentStatus: string;
  currentStatusType: StageStatus;
  currentStage: string;
  lastUpdated: string;
  stages: Stage[];
  documents: Document[];
  timeline: TimelineEvent[];
}

export const mockSubmission: SubmissionData = {
  submissionNumber: "OSS-2024-PB-00847",
  organizationName: "LPK Karya Mandiri Internasional",
  currentStatus: "Verifikasi Dokumen",
  currentStatusType: "active",
  currentStage: "Document Verification",
  lastUpdated: "22 Februari 2026, 14:35 WIB",
  stages: [
    { label: "Pengajuan", status: "completed" },
    { label: "Verifikasi Dokumen", status: "active" },
    { label: "Peninjauan", status: "pending" },
    { label: "Persetujuan", status: "pending" },
    { label: "Izin Terbit", status: "pending" },
  ],
  documents: [
    { name: "Surat Permohonan", status: "approved" },
    { name: "Salinan Izin Usaha", status: "approved" },
    { name: "Sertifikat Akreditasi", status: "revision_required", note: "Sertifikat sudah kadaluarsa, harap unggah yang terbaru." },
    { name: "Dokumen Perjanjian Internasional", status: "locked" },
    { name: "Rencana Program Pemagangan", status: "locked" },
    { name: "Rencana Penempatan Pasca Pemagangan", status: "locked" },
    { name: "Profil LPK", status: "locked" },
    { name: "Draft Perjanjian Pemagangan", status: "locked" },
  ],
  timeline: [
    { date: "22 Feb 2026", time: "14:35", description: "Permintaan revisi: Sertifikat Akreditasi kadaluarsa", type: "error" },
    { date: "22 Feb 2026", time: "10:12", description: "Salinan Izin Usaha disetujui", type: "success" },
    { date: "21 Feb 2026", time: "16:40", description: "Surat Permohonan disetujui", type: "success" },
    { date: "21 Feb 2026", time: "09:00", description: "Verifikasi dokumen dimulai", type: "info" },
    { date: "20 Feb 2026", time: "15:22", description: "Pengajuan berhasil dibuat", type: "info" },
  ],
};
