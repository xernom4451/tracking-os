import { useEffect, useState, ReactNode } from "react";
import type {
  SubmissionData,
  SubmissionType,
  DocumentUploadEntry,
  DocumentUploadPhase,
  DecisionStatus,
  LicenseStatus,
  TimelineEvent,
} from "@/data/mockData";
import {
  formatTimestamp,
  formatTimelineNow,
  hasUploadedRevisionAfterLatestRequest,
  hasApprovalDraftReadyForIssuance,
  normalizePbUmkuNumber,
} from "@/data/mockData";
import { SubmissionContext } from "@/contexts/submission-context.shared";
import { initialSubmissions } from "@/data/initialSubmissions";
import { buildReviewDocuments } from "@/data/submissionDocuments";
import {
  findSubmissionBySubmissionNumber as findSubmissionBySubmissionNumberHelper,
  getCurrentActor as getCurrentActorHelper,
  normalizeLicenseStatus as normalizeLicenseStatusHelper,
  normalizeNib,
  normalizeSubmissionType as normalizeSubmissionTypeHelper,
} from "@/lib/submission-domain";
import { normalizeKbliCode } from "@/data/kbliOptions";
import {
  createSessionDecisionEvents,
  createSessionSummaryEvent,
  getNextSessionNumber,
  normalizeSessionDecisions,
} from "@/lib/submission-sessions";
import {
  appendHistoryIfChanged as appendHistoryIfChangedHelper,
  loadStoredSubmissions as loadStoredSubmissionsHelper,
  normalizeLegacyDocumentStatus as normalizeLegacyDocumentStatusHelper,
} from "@/lib/submission-storage";
import { api, AUTH_TOKEN_STORAGE_KEY, isApiEnabled } from "@/lib/api";

export interface AdminSubmission extends SubmissionData {
  id: string;
}

const SUBMISSION_STORAGE_KEY = "tracking-os-submissions";
const DEFAULT_OSS_STATUS = "Menunggu Verifikasi K/L";
const AUTH_USER_STORAGE_KEY = "tracking-os-auth-user";
const readStoredSubmissions = () =>
  loadStoredSubmissionsHelper(SUBMISSION_STORAGE_KEY, initialSubmissions, DEFAULT_OSS_STATUS);

export interface NewSubmissionInput {
  submissionNumber: string;
  submissionType: SubmissionType;
  organizationName: string;
  kbli: string;
  nib: string;
  pengajuanDate: string;
}

export interface SessionDecisionInput {
  status: DecisionStatus;
  note?: string;
}

export interface ApprovalFinalizeInput {
  approvalDate: string;
  pbUmkuNumber: string;
  skFileName: string;
  skFileSizeBytes: number;
  file?: File;
}

export interface LicenseIssuanceInput {
  status: LicenseStatus;
}

export interface RevisionUploadInput {
  fileName: string;
  fileSizeBytes: number;
  file?: File;
}

export const SubmissionProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>(() =>
    isApiEnabled ? [] : readStoredSubmissions(),
  );
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(isApiEnabled);

  const replaceSubmission = (submission: AdminSubmission) => {
    setSubmissions((prev) => {
      const exists = prev.some((item) => item.id === submission.id);
      if (!exists) return [submission, ...prev];
      return prev.map((item) => (item.id === submission.id ? submission : item));
    });
  };

  const refreshSubmissionsFromApi = () => {
    if (!isApiEnabled || typeof window === "undefined") return;
    if (!window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) {
      api.listPublicSubmissions()
        .then(setSubmissions)
        .catch((error) => {
          console.error("Gagal memuat data publik dari API.", error);
        })
        .finally(() => {
          setIsLoadingSubmissions(false);
        });
      return;
    }

    setIsLoadingSubmissions(true);
    api.listSubmissions()
      .then(setSubmissions)
      .catch((error) => {
        console.error("Gagal memuat data permohonan dari API.", error);
      })
      .finally(() => {
        setIsLoadingSubmissions(false);
      });
  };

  const mutate = (id: string, updater: (s: AdminSubmission) => AdminSubmission) => {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  };

  const getSubmission = (id: string) => submissions.find((s) => s.id === id);
  const findBySubmissionNumber = (num: string) => {
    if (isApiEnabled) {
      return api.trackSubmission(num)
        .then((submission) => {
          replaceSubmission(submission);
          return submission;
        })
        .catch(() => undefined);
    }

    const fromState = findSubmissionBySubmissionNumberHelper(submissions, num);
    if (fromState) return fromState;

    if (typeof window !== "undefined") {
      const fromStorage = findSubmissionBySubmissionNumberHelper(readStoredSubmissions(), num);
      if (fromStorage) return fromStorage;
    }

    return undefined;
  };

  const addSubmission = (input: NewSubmissionInput) => {
    if (isApiEnabled) {
      api.createSubmission(input)
        .then((submission) => replaceSubmission(submission))
        .catch((error) => console.error("Gagal menambahkan permohonan.", error));
      return;
    }

    const t = formatTimelineNow();
    const actor = getCurrentActorHelper(AUTH_USER_STORAGE_KEY);
    const newId = String(Date.now());
    const newSubmission: AdminSubmission = {
      id: newId,
      submissionNumber: input.submissionNumber.trim(),
      submissionType: normalizeSubmissionTypeHelper(input.submissionType),
      organizationName: input.organizationName.trim(),
      nib: normalizeNib(input.nib),
      kbli: normalizeKbliCode(input.kbli),
      ossStatus: DEFAULT_OSS_STATUS,
      pengajuanDate: input.pengajuanDate,
      lastUpdated: formatTimestamp(),
      pengajuanConfirmed: false,
      verificationCompleted: false,
      documents: buildReviewDocuments("locked"),
      reviewNotes: "",
      reviewCompleted: false,
      approvalCompleted: false,
      approvalDate: "",
      licenseIssued: false,
      licenseStatus: "",
      licenseNumber: "",
      licenseDate: "",
      skFileName: "",
      skFileSizeBytes: 0,
      reviewCycle: 1,
      reviewDocuments: buildReviewDocuments("locked"),
      verificationWorklistDocNumbers: [],
      timeline: [
        {
          date: t.date,
          time: t.time,
          actor,
          phase: "PENGAJUAN",
          description: "Data permohonan berhasil dibuat.",
          type: "info" as const,
        },
      ],
    };
    setSubmissions((prev) => [newSubmission, ...prev]);
  };

  const updatePengajuanData = (id: string, input: NewSubmissionInput) => {
    if (isApiEnabled) {
      api.updateSubmission(id, input)
        .then(replaceSubmission)
        .catch((error) => console.error("Gagal memperbarui data pengajuan.", error));
      return;
    }

    mutate(id, (s) => {
      const cleanInput = {
        submissionNumber: input.submissionNumber.trim(),
        submissionType: normalizeSubmissionTypeHelper(input.submissionType),
        organizationName: input.organizationName.trim(),
        nib: normalizeNib(input.nib),
        kbli: normalizeKbliCode(input.kbli),
        pengajuanDate: input.pengajuanDate.trim(),
      };

      const hasChanges = s.submissionNumber !== cleanInput.submissionNumber
        || s.submissionType !== cleanInput.submissionType
        || s.organizationName !== cleanInput.organizationName
        || s.nib !== cleanInput.nib
        || s.kbli !== cleanInput.kbli
        || s.pengajuanDate !== cleanInput.pengajuanDate;

      if (!hasChanges) return s;

      return {
        ...s,
        submissionNumber: cleanInput.submissionNumber,
        submissionType: cleanInput.submissionType,
        organizationName: cleanInput.organizationName,
        nib: cleanInput.nib,
        kbli: cleanInput.kbli,
        pengajuanDate: cleanInput.pengajuanDate,
        lastUpdated: formatTimestamp(),
      };
    });
  };

  const deleteSubmission = (id: string) => {
    if (isApiEnabled) {
      api.deleteSubmission(id)
        .then(() => setSubmissions((prev) => prev.filter((s) => s.id !== id)))
        .catch((error) => console.error("Gagal menghapus permohonan.", error));
      return;
    }

    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const confirmPengajuan = (id: string) => {
    if (isApiEnabled) {
      api.confirmPengajuan(id)
        .then(replaceSubmission)
        .catch((error) => console.error("Gagal mengonfirmasi pengajuan.", error));
      return;
    }

    const t = formatTimelineNow();
    const actor = getCurrentActorHelper(AUTH_USER_STORAGE_KEY);
    mutate(id, (s) => ({
      ...s,
      pengajuanConfirmed: true,
      verificationCompleted: false,
      lastUpdated: formatTimestamp(),
      timeline: [
        ...s.timeline,
        {
          date: t.date,
          time: t.time,
          actor,
          phase: "PENGAJUAN",
          description: "Pengajuan dikonfirmasi. Tahap Verifikasi Dokumen dimulai.",
          type: "info" as const,
        },
      ],
    }));
  };

  const uploadRevisionDocument = (
    id: string,
    phase: DocumentUploadPhase,
    documentNumber: number,
    input: RevisionUploadInput,
  ) => {
    if (isApiEnabled) {
      api.uploadRevisionDocument(id, phase, documentNumber, input)
        .then(replaceSubmission)
        .catch((error) => console.error("Gagal mengunggah metadata revisi.", error));
      return;
    }

    const cleanName = input.fileName.trim();
    const cleanSize = Number.isFinite(input.fileSizeBytes) && input.fileSizeBytes > 0
      ? input.fileSizeBytes
      : 0;

    if (!cleanName || cleanSize <= 0 || !Number.isInteger(documentNumber)) return;

    const t = formatTimelineNow();
    mutate(id, (s) => {
      const docs = phase === "VERIFIKASI" ? s.documents : s.reviewDocuments;
      const targetDoc = docs[documentNumber - 1];

      if (!targetDoc) return s;
      if (normalizeLegacyDocumentStatusHelper(String(targetDoc.status)) !== "revision_required") return s;

      const nextUpload: DocumentUploadEntry = {
        fileName: cleanName,
        fileSizeBytes: cleanSize,
        date: t.date,
        time: t.time,
        phase,
      };

      const nextDocs = docs.map((doc, index) => {
        if (index !== documentNumber - 1) return doc;
        return {
          ...doc,
          uploads: [...(doc.uploads || []), nextUpload],
        };
      });

      const nextTimelineEvent: TimelineEvent = {
        date: t.date,
        time: t.time,
        actor: "Pemohon",
        phase,
        documentNumber,
        description: `Dokumen perbaikan untuk ${targetDoc.name} diunggah: ${cleanName}.`,
        type: "info",
      };

      if (phase === "VERIFIKASI") {
        return {
          ...s,
          documents: nextDocs,
          lastUpdated: formatTimestamp(),
          timeline: [...s.timeline, nextTimelineEvent],
        };
      }

      return {
        ...s,
        reviewDocuments: nextDocs,
        lastUpdated: formatTimestamp(),
        timeline: [...s.timeline, nextTimelineEvent],
      };
    });
  };

  const submitVerificationSession = (id: string, decisions: SessionDecisionInput[]) => {
    if (isApiEnabled) {
      api.submitVerificationSession(id, decisions)
        .then(replaceSubmission)
        .catch((error) => console.error("Gagal menyimpan sesi verifikasi.", error));
      return;
    }

    const t = formatTimelineNow();
    const actor = getCurrentActorHelper(AUTH_USER_STORAGE_KEY);
    mutate(id, (s) => {
      if (!s.pengajuanConfirmed || s.verificationCompleted) return s;
      const reuploadedDocNumbers = s.documents
        .map((doc, index) => ({
          doc,
          docNumber: index + 1,
        }))
        .filter(({ doc, docNumber }) => doc.status === "revision_required"
          && hasUploadedRevisionAfterLatestRequest(s.timeline, docNumber, "VERIFIKASI"))
        .map(({ docNumber }) => docNumber);
      const normalized = normalizeSessionDecisions(decisions, s.documents.length, {
        requireRevisionNote: true,
        requireRevisionNoteForDocNumbers: reuploadedDocNumbers,
      });
      if (!normalized) return s;

      const effectiveDecisions = normalized;

      const nextDocuments = s.documents.map((doc, index) =>
        appendHistoryIfChangedHelper(
          doc,
          effectiveDecisions[index].status,
          effectiveDecisions[index].note,
          t,
          true,
        ),
      );
      const hasRevision = effectiveDecisions.some((decision) => decision.status === "revision_required");
      const nextRevisionDocNumbers = effectiveDecisions
        .map((decision, index) => ({ decision, docNumber: index + 1 }))
        .filter(({ decision }) => decision.status === "revision_required")
        .map(({ docNumber }) => docNumber);
      const sessionNumber = getNextSessionNumber(s.timeline, "VERIFIKASI");

      const decisionEvents = createSessionDecisionEvents(
        "VERIFIKASI",
        sessionNumber,
        effectiveDecisions,
        nextDocuments,
        t,
        actor,
      );
      const movesToNextPhase = !hasRevision;

      return {
        ...s,
        documents: nextDocuments,
        verificationCompleted: movesToNextPhase,
        reviewCompleted: false,
        approvalCompleted: false,
        approvalDate: "",
        licenseIssued: false,
        licenseStatus: "",
        licenseNumber: "",
        licenseDate: "",
        skFileName: "",
        skFileSizeBytes: 0,
        verificationWorklistDocNumbers: hasRevision ? nextRevisionDocNumbers : [],
        lastRevisionCarryover: undefined,
        lastUpdated: formatTimestamp(),
        timeline: [
          ...s.timeline,
          ...decisionEvents,
          createSessionSummaryEvent(
            "VERIFIKASI",
            sessionNumber,
            effectiveDecisions,
            nextDocuments,
            t,
            actor,
            hasRevision,
          ),
        ],
      };
    });
  };

  const submitReviewSession = (id: string, decisions: SessionDecisionInput[]) => {
    if (isApiEnabled) {
      api.submitReviewSession(id, decisions)
        .then(replaceSubmission)
        .catch((error) => console.error("Gagal menyimpan sesi peninjauan.", error));
      return;
    }

    const t = formatTimelineNow();
    const actor = getCurrentActorHelper(AUTH_USER_STORAGE_KEY);
    mutate(id, (s) => {
      if (!s.verificationCompleted || s.reviewCompleted) return s;
      const reuploadedDocNumbers = s.reviewDocuments
        .map((doc, index) => ({
          doc,
          docNumber: index + 1,
        }))
        .filter(({ doc, docNumber }) => doc.status === "revision_required"
          && hasUploadedRevisionAfterLatestRequest(s.timeline, docNumber, "PENINJAUAN"))
        .map(({ docNumber }) => docNumber);
      const normalized = normalizeSessionDecisions(decisions, s.reviewDocuments.length, {
        requireRevisionNote: false,
        requireRevisionNoteForDocNumbers: reuploadedDocNumbers,
      });
      if (!normalized) return s;

      const effectiveDecisions = normalized;

      const nextReviewDocuments = s.reviewDocuments.map((doc, index) =>
        appendHistoryIfChangedHelper(
          doc,
          effectiveDecisions[index].status,
          effectiveDecisions[index].note,
          t,
          true,
        ),
      );
      const hasRevision = effectiveDecisions.some((decision) => decision.status === "revision_required");
      const sessionNumber = getNextSessionNumber(s.timeline, "PENINJAUAN");
      const revisionDocNumbers = effectiveDecisions
        .map((decision, index) => ({ decision, docNumber: index + 1 }))
        .filter(({ decision }) => decision.status === "revision_required")
        .map(({ docNumber }) => docNumber);

      const decisionEvents = createSessionDecisionEvents(
        "PENINJAUAN",
        sessionNumber,
        effectiveDecisions,
        nextReviewDocuments,
        t,
        actor,
      );
      const movesToNextPhase = !hasRevision;

      return {
        ...s,
        reviewDocuments: nextReviewDocuments,
        reviewCompleted: movesToNextPhase,
        reviewNotes: hasRevision
          ? `Masih terdapat dokumen yang memerlukan perbaikan: ${revisionDocNumbers.join(", ")}.`
          : "Seluruh dokumen pada tahap peninjauan dinyatakan sesuai persyaratan.",
        approvalCompleted: false,
        approvalDate: "",
        licenseIssued: false,
        licenseStatus: "",
        licenseNumber: "",
        licenseDate: "",
        skFileName: "",
        skFileSizeBytes: 0,
        lastUpdated: formatTimestamp(),
        timeline: [
          ...s.timeline,
          ...decisionEvents,
          createSessionSummaryEvent(
            "PENINJAUAN",
            sessionNumber,
            effectiveDecisions,
            nextReviewDocuments,
            t,
            actor,
            hasRevision,
          ),
        ],
      };
    });
  };

  const finalizeApproval = (id: string, input: ApprovalFinalizeInput) => {
    if (isApiEnabled) {
      api.finalizeApproval(id, input)
        .then(replaceSubmission)
        .catch((error) => console.error("Gagal menyimpan persetujuan.", error));
      return;
    }

    const cleanApprovalDate = input.approvalDate.trim();
    const cleanNumber = normalizePbUmkuNumber(input.pbUmkuNumber);
    const cleanFileName = input.skFileName.trim();
    const cleanSize = Number.isFinite(input.skFileSizeBytes) && input.skFileSizeBytes > 0
      ? input.skFileSizeBytes
      : 0;
    const hasDuplicateNumber = submissions.some(
      (submission) => submission.id !== id && normalizePbUmkuNumber(submission.licenseNumber || "") === cleanNumber,
    );

    if (!cleanApprovalDate || !cleanNumber || !cleanFileName || cleanSize <= 0) return;
    if (!cleanFileName.toLowerCase().endsWith(".pdf")) return;
    if (hasDuplicateNumber) return;

    const t = formatTimelineNow();
    const actor = getCurrentActorHelper(AUTH_USER_STORAGE_KEY);
    mutate(id, (s) => {
      if (!s.reviewCompleted || s.licenseIssued) return s;
      return {
        ...s,
        ossStatus: "Izin Terbit",
        approvalCompleted: true,
        approvalDate: cleanApprovalDate,
        licenseIssued: false,
        licenseStatus: "",
        licenseNumber: cleanNumber,
        licenseDate: "",
        skFileName: cleanFileName,
        skFileSizeBytes: cleanSize,
        lastUpdated: formatTimestamp(),
        timeline: [
          ...s.timeline,
          {
            date: t.date,
            time: t.time,
            actor,
            phase: "PERSETUJUAN",
            description: "Data persetujuan disimpan. Lanjut ke Izin Terbit untuk menetapkan status izin.",
            type: "success" as const,
          },
        ],
      };
    });
  };

  const issueLicense = (id: string, input: LicenseIssuanceInput) => {
    if (isApiEnabled) {
      api.issueLicense(id, input)
        .then(replaceSubmission)
        .catch((error) => console.error("Gagal menerbitkan izin.", error));
      return;
    }

    const cleanStatus = normalizeLicenseStatusHelper(input.status);
    if (!cleanStatus) return;

    const t = formatTimelineNow();
    const actor = getCurrentActorHelper(AUTH_USER_STORAGE_KEY);
    const issuedAt = formatTimestamp();
    mutate(id, (s) => {
      if (!s.approvalCompleted || s.licenseIssued) return s;
      if (!hasApprovalDraftReadyForIssuance(s)) return s;

      return {
        ...s,
        ossStatus: "Izin Terbit",
        licenseIssued: true,
        licenseStatus: cleanStatus,
        licenseDate: issuedAt,
        lastUpdated: issuedAt,
        timeline: [
          ...s.timeline,
          {
            date: t.date,
            time: t.time,
            actor,
            phase: "IZIN_TERBIT",
            description: `Izin PB UMKU diterbitkan dengan status ${cleanStatus}.`,
            type: "success" as const,
          },
        ],
      };
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isApiEnabled) return;
    window.localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isApiEnabled) {
      refreshSubmissionsFromApi();
      window.addEventListener("tracking-os-auth-changed", refreshSubmissionsFromApi);
      window.addEventListener("focus", refreshSubmissionsFromApi);
      return () => {
        window.removeEventListener("tracking-os-auth-changed", refreshSubmissionsFromApi);
        window.removeEventListener("focus", refreshSubmissionsFromApi);
      };
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== SUBMISSION_STORAGE_KEY) return;
      setSubmissions(readStoredSubmissions());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <SubmissionContext.Provider value={{
      submissions,
      isLoadingSubmissions,
      getSubmission,
      findBySubmissionNumber,
      addSubmission,
      updatePengajuanData,
      deleteSubmission,
      confirmPengajuan,
      uploadRevisionDocument,
      submitVerificationSession,
      submitReviewSession,
      finalizeApproval,
      issueLicense,
    }}>
      {children}
    </SubmissionContext.Provider>
  );
};
