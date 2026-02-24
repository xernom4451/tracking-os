export type DocumentStatus = "approved" | "under_review" | "revision_required" | "locked";
export type StageStatus = "completed" | "active" | "locked";
export type DisplayStatusType = "completed" | "active" | "revision" | "pending";

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
  lastUpdated: string;
  pengajuanConfirmed: boolean;
  pengajuanDate: string;
  documents: Document[];
  reviewNotes: string;
  reviewCompleted: boolean;
  approvalCompleted: boolean;
  approvalDate: string;
  licenseIssued: boolean;
  licenseNumber: string;
  licenseDate: string;
  timeline: TimelineEvent[];
}

export const STAGE_LABELS = [
  "Pengajuan",
  "Verifikasi Dokumen",
  "Peninjauan",
  "Persetujuan",
  "Izin Terbit",
];

export function deriveStages(data: SubmissionData): Stage[] {
  const allDocsApproved = data.documents.every((d) => d.status === "approved");
  const stages: Stage[] = STAGE_LABELS.map((label) => ({ label, status: "locked" as StageStatus }));

  if (!data.pengajuanConfirmed) {
    stages[0].status = "active";
    return stages;
  }
  stages[0].status = "completed";

  if (!allDocsApproved) {
    stages[1].status = "active";
    return stages;
  }
  stages[1].status = "completed";

  if (!data.reviewCompleted) {
    stages[2].status = "active";
    return stages;
  }
  stages[2].status = "completed";

  if (!data.approvalCompleted) {
    stages[3].status = "active";
    return stages;
  }
  stages[3].status = "completed";

  if (!data.licenseIssued) {
    stages[4].status = "active";
    return stages;
  }
  stages[4].status = "completed";

  return stages;
}

export function deriveDisplayStatus(data: SubmissionData): { label: string; type: DisplayStatusType } {
  const stages = deriveStages(data);
  if (stages.every((s) => s.status === "completed")) return { label: "Izin Terbit", type: "completed" };
  const hasRevision = data.documents.some((d) => d.status === "revision_required");
  if (hasRevision && stages[1].status === "active") return { label: "Perlu Perbaikan", type: "revision" };
  const active = stages.find((s) => s.status === "active");
  if (active) return { label: active.label, type: "active" };
  return { label: "Pengajuan", type: "pending" };
}

export function getActiveStageIndex(data: SubmissionData): number {
  const stages = deriveStages(data);
  const idx = stages.findIndex((s) => s.status === "active");
  return idx >= 0 ? idx : stages.length - 1;
}

export function formatTimestamp(): string {
  const now = new Date();
  return (
    now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) +
    ", " +
    now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
    " WIB"
  );
}

export function formatTimelineNow(): { date: string; time: string } {
  const now = new Date();
  return {
    date: now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
  };
}
