import { createContext, useContext, useState, ReactNode } from "react";
import type { SubmissionData, DocumentStatus } from "@/data/mockData";
import { formatTimestamp, formatTimelineNow } from "@/data/mockData";

export interface AdminSubmission extends SubmissionData {
  id: string;
}

const initialSubmissions: AdminSubmission[] = [
  {
    id: "1",
    submissionNumber: "OSS-2024-PB-00847",
    organizationName: "LPK Karya Mandiri Internasional",
    lastUpdated: "22 Februari 2026, 14:35 WIB",
    pengajuanConfirmed: true,
    pengajuanDate: "20 Februari 2026",
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
    reviewNotes: "",
    reviewCompleted: false,
    approvalCompleted: false,
    approvalDate: "",
    licenseIssued: false,
    licenseNumber: "",
    licenseDate: "",
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
    lastUpdated: "21 Februari 2026, 10:00 WIB",
    pengajuanConfirmed: true,
    pengajuanDate: "18 Februari 2026",
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
    reviewNotes: "",
    reviewCompleted: false,
    approvalCompleted: false,
    approvalDate: "",
    licenseIssued: false,
    licenseNumber: "",
    licenseDate: "",
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
    lastUpdated: "19 Februari 2026, 16:00 WIB",
    pengajuanConfirmed: true,
    pengajuanDate: "15 Februari 2026",
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
    reviewNotes: "Semua dokumen telah ditinjau dan sesuai persyaratan.",
    reviewCompleted: true,
    approvalCompleted: true,
    approvalDate: "18 Februari 2026",
    licenseIssued: true,
    licenseNumber: "IMT-2026-00123",
    licenseDate: "19 Februari 2026",
    timeline: [
      { date: "19 Feb 2026", time: "16:00", description: "Izin terbit: IMT-2026-00123", type: "success" },
      { date: "18 Feb 2026", time: "11:00", description: "Permohonan disetujui", type: "success" },
      { date: "17 Feb 2026", time: "14:00", description: "Peninjauan selesai", type: "success" },
      { date: "17 Feb 2026", time: "09:00", description: "Pengajuan berhasil dibuat", type: "info" },
    ],
  },
  {
    id: "4",
    submissionNumber: "OSS-2024-PB-01001",
    organizationName: "LPK Harapan Bangsa",
    lastUpdated: "23 Februari 2026, 08:00 WIB",
    pengajuanConfirmed: false,
    pengajuanDate: "23 Februari 2026",
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
    reviewNotes: "",
    reviewCompleted: false,
    approvalCompleted: false,
    approvalDate: "",
    licenseIssued: false,
    licenseNumber: "",
    licenseDate: "",
    timeline: [
      { date: "23 Feb 2026", time: "08:00", description: "Pengajuan berhasil dibuat", type: "info" },
    ],
  },
];

interface SubmissionContextType {
  submissions: AdminSubmission[];
  getSubmission: (id: string) => AdminSubmission | undefined;
  findByNumber: (num: string) => AdminSubmission | undefined;
  confirmPengajuan: (id: string) => void;
  updateDocStatus: (id: string, docIndex: number, status: DocumentStatus, note?: string) => void;
  completeReview: (id: string, notes: string) => void;
  approveApplication: (id: string) => void;
  issueLicense: (id: string, licenseNumber: string, licenseDate: string) => void;
}

const SubmissionContext = createContext<SubmissionContextType | null>(null);

export const useSubmissions = () => {
  const ctx = useContext(SubmissionContext);
  if (!ctx) throw new Error("useSubmissions must be used within SubmissionProvider");
  return ctx;
};

export const SubmissionProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>(initialSubmissions);

  const mutate = (id: string, updater: (s: AdminSubmission) => AdminSubmission) => {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  };

  const getSubmission = (id: string) => submissions.find((s) => s.id === id);
  const findByNumber = (num: string) =>
    submissions.find((s) => s.submissionNumber.toLowerCase() === num.toLowerCase());

  const confirmPengajuan = (id: string) => {
    const t = formatTimelineNow();
    mutate(id, (s) => ({
      ...s,
      pengajuanConfirmed: true,
      lastUpdated: formatTimestamp(),
      documents: s.documents.map((d, i) =>
        i === 0 ? { ...d, status: "under_review" as DocumentStatus } : d
      ),
      timeline: [{ date: t.date, time: t.time, description: "Pengajuan dikonfirmasi, verifikasi dokumen dimulai", type: "info" as const }, ...s.timeline],
    }));
  };

  const updateDocStatus = (id: string, docIndex: number, status: DocumentStatus, note?: string) => {
    const t = formatTimelineNow();
    mutate(id, (s) => {
      const docs = [...s.documents];
      docs[docIndex] = { ...docs[docIndex], status, note: status === "revision_required" ? note : undefined };

      // Enforce sequential: lock everything after a non-approved doc
      let lockRest = false;
      for (let i = 0; i < docs.length; i++) {
        if (lockRest) {
          docs[i] = { ...docs[i], status: "locked", note: undefined };
        } else if (docs[i].status !== "approved") {
          lockRest = true;
        }
      }

      const docName = s.documents[docIndex].name;
      let desc = "";
      if (status === "approved") desc = `${docName} disetujui`;
      else if (status === "under_review") desc = `${docName} sedang diverifikasi`;
      else if (status === "revision_required") desc = `Permintaan revisi: ${docName}`;

      return {
        ...s,
        documents: docs,
        lastUpdated: formatTimestamp(),
        timeline: desc ? [{ date: t.date, time: t.time, description: desc, type: status === "revision_required" ? "error" as const : status === "approved" ? "success" as const : "info" as const }, ...s.timeline] : s.timeline,
      };
    });
  };

  const completeReview = (id: string, notes: string) => {
    const t = formatTimelineNow();
    mutate(id, (s) => ({
      ...s,
      reviewNotes: notes,
      reviewCompleted: true,
      lastUpdated: formatTimestamp(),
      timeline: [{ date: t.date, time: t.time, description: "Peninjauan dokumen selesai", type: "success" as const }, ...s.timeline],
    }));
  };

  const approveApplication = (id: string) => {
    const t = formatTimelineNow();
    const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    mutate(id, (s) => ({
      ...s,
      approvalCompleted: true,
      approvalDate: dateStr,
      lastUpdated: formatTimestamp(),
      timeline: [{ date: t.date, time: t.time, description: "Permohonan disetujui", type: "success" as const }, ...s.timeline],
    }));
  };

  const issueLicense = (id: string, licenseNumber: string, licenseDate: string) => {
    const t = formatTimelineNow();
    mutate(id, (s) => ({
      ...s,
      licenseIssued: true,
      licenseNumber,
      licenseDate,
      lastUpdated: formatTimestamp(),
      timeline: [{ date: t.date, time: t.time, description: `Izin terbit: ${licenseNumber}`, type: "success" as const }, ...s.timeline],
    }));
  };

  return (
    <SubmissionContext.Provider value={{ submissions, getSubmission, findByNumber, confirmPengajuan, updateDocStatus, completeReview, approveApplication, issueLicense }}>
      {children}
    </SubmissionContext.Provider>
  );
};
