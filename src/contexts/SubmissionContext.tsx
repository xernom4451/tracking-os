import { createContext, useContext, useState, ReactNode } from "react";
import type { SubmissionData, StageStatus, DocumentStatus } from "@/data/mockData";

export interface AdminSubmission extends SubmissionData {
  id: string;
}

const initialSubmissions: AdminSubmission[] = [
  {
    id: "1",
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
      { name: "Surat Permohonan Izin", status: "approved" },
      { name: "Salinan Izin Usaha", status: "approved" },
      { name: "Salinan Akreditasi", status: "revision_required", note: "Sertifikat sudah kadaluarsa, harap unggah yang terbaru." },
      { name: "Perjanjian Kerja Sama Luar Negeri", status: "locked" },
      { name: "Program Pemagangan", status: "locked" },
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
  },
  {
    id: "2",
    submissionNumber: "OSS-2024-PB-00912",
    organizationName: "LPK Nusantara Global",
    currentStatus: "Peninjauan Dokumen",
    currentStatusType: "active",
    currentStage: "Review",
    lastUpdated: "21 Februari 2026, 10:00 WIB",
    stages: [
      { label: "Pengajuan", status: "completed" },
      { label: "Verifikasi Dokumen", status: "completed" },
      { label: "Peninjauan", status: "active" },
      { label: "Persetujuan", status: "pending" },
      { label: "Izin Terbit", status: "pending" },
    ],
    documents: [
      { name: "Surat Permohonan Izin", status: "approved" },
      { name: "Salinan Izin Usaha", status: "approved" },
      { name: "Salinan Akreditasi", status: "approved" },
      { name: "Perjanjian Kerja Sama Luar Negeri", status: "approved" },
      { name: "Program Pemagangan", status: "approved" },
      { name: "Rencana Penempatan Pasca Pemagangan", status: "approved" },
      { name: "Profil LPK", status: "approved" },
      { name: "Draft Perjanjian Pemagangan", status: "approved" },
    ],
    timeline: [
      { date: "21 Feb 2026", time: "10:00", description: "Peninjauan dokumen dimulai", type: "info" },
      { date: "20 Feb 2026", time: "14:00", description: "Semua dokumen disetujui", type: "success" },
      { date: "18 Feb 2026", time: "09:00", description: "Pengajuan berhasil dibuat", type: "info" },
    ],
  },
  {
    id: "3",
    submissionNumber: "OSS-2024-PB-00955",
    organizationName: "LPK Maju Bersama",
    currentStatus: "Izin Terbit",
    currentStatusType: "completed",
    currentStage: "License Issued",
    lastUpdated: "19 Februari 2026, 16:00 WIB",
    stages: [
      { label: "Pengajuan", status: "completed" },
      { label: "Verifikasi Dokumen", status: "completed" },
      { label: "Peninjauan", status: "completed" },
      { label: "Persetujuan", status: "completed" },
      { label: "Izin Terbit", status: "completed" },
    ],
    documents: [
      { name: "Surat Permohonan Izin", status: "approved" },
      { name: "Salinan Izin Usaha", status: "approved" },
      { name: "Salinan Akreditasi", status: "approved" },
      { name: "Perjanjian Kerja Sama Luar Negeri", status: "approved" },
      { name: "Program Pemagangan", status: "approved" },
      { name: "Rencana Penempatan Pasca Pemagangan", status: "approved" },
      { name: "Profil LPK", status: "approved" },
      { name: "Draft Perjanjian Pemagangan", status: "approved" },
    ],
    timeline: [
      { date: "19 Feb 2026", time: "16:00", description: "Izin terbit", type: "success" },
      { date: "18 Feb 2026", time: "11:00", description: "Permohonan disetujui", type: "success" },
      { date: "17 Feb 2026", time: "09:00", description: "Pengajuan berhasil dibuat", type: "info" },
    ],
  },
  {
    id: "4",
    submissionNumber: "OSS-2024-PB-01001",
    organizationName: "LPK Harapan Bangsa",
    currentStatus: "Pengajuan",
    currentStatusType: "pending",
    currentStage: "Submission",
    lastUpdated: "23 Februari 2026, 08:00 WIB",
    stages: [
      { label: "Pengajuan", status: "active" },
      { label: "Verifikasi Dokumen", status: "pending" },
      { label: "Peninjauan", status: "pending" },
      { label: "Persetujuan", status: "pending" },
      { label: "Izin Terbit", status: "pending" },
    ],
    documents: [
      { name: "Surat Permohonan Izin", status: "locked" },
      { name: "Salinan Izin Usaha", status: "locked" },
      { name: "Salinan Akreditasi", status: "locked" },
      { name: "Perjanjian Kerja Sama Luar Negeri", status: "locked" },
      { name: "Program Pemagangan", status: "locked" },
      { name: "Rencana Penempatan Pasca Pemagangan", status: "locked" },
      { name: "Profil LPK", status: "locked" },
      { name: "Draft Perjanjian Pemagangan", status: "locked" },
    ],
    timeline: [
      { date: "23 Feb 2026", time: "08:00", description: "Pengajuan berhasil dibuat", type: "info" },
    ],
  },
];

interface SubmissionContextType {
  submissions: AdminSubmission[];
  updateSubmission: (id: string, data: Partial<AdminSubmission>) => void;
  getSubmission: (id: string) => AdminSubmission | undefined;
  findByNumber: (num: string) => AdminSubmission | undefined;
}

const SubmissionContext = createContext<SubmissionContextType | null>(null);

export const useSubmissions = () => {
  const ctx = useContext(SubmissionContext);
  if (!ctx) throw new Error("useSubmissions must be used within SubmissionProvider");
  return ctx;
};

export const SubmissionProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>(initialSubmissions);

  const updateSubmission = (id: string, data: Partial<AdminSubmission>) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  };

  const getSubmission = (id: string) => submissions.find((s) => s.id === id);
  const findByNumber = (num: string) =>
    submissions.find((s) => s.submissionNumber.toLowerCase() === num.toLowerCase());

  return (
    <SubmissionContext.Provider value={{ submissions, updateSubmission, getSubmission, findByNumber }}>
      {children}
    </SubmissionContext.Provider>
  );
};
