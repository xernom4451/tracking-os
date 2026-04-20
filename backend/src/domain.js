const documentNames = [
  "Surat Permohonan Izin",
  "Salinan Izin Usaha",
  "Salinan Akreditasi",
  "Perjanjian Kerja Sama Luar Negeri",
  "Program Pemagangan",
  "Rencana Penempatan Pasca Pemagangan",
  "Profil LPK",
  "Draft Perjanjian Pemagangan",
];

export function nowStamp() {
  const now = new Date();
  return {
    date: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(now),
    time: new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).format(now),
    longDate: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(now),
  };
}

export function buildDocuments(status = "locked") {
  return documentNames.map((name) => ({ name, status }));
}

export function createSubmission(input, actor = "Admin") {
  const stamp = nowStamp();
  return {
    id: String(Date.now()),
    submissionNumber: String(input.submissionNumber || "").trim(),
    submissionType: input.submissionType === "Perpanjangan" ? "Perpanjangan" : "Baru",
    organizationName: String(input.organizationName || "").trim(),
    nib: String(input.nib || "").trim(),
    kbli: String(input.kbli || "").trim(),
    ossStatus: "Menunggu Verifikasi K/L",
    lastUpdated: stamp.longDate,
    pengajuanConfirmed: false,
    verificationCompleted: false,
    pengajuanDate: String(input.pengajuanDate || stamp.longDate).trim(),
    documents: buildDocuments("locked"),
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
    reviewDocuments: buildDocuments("locked"),
    verificationWorklistDocNumbers: [],
    timeline: [
      {
        date: stamp.date,
        time: stamp.time,
        actor,
        phase: "PENGAJUAN",
        description: "Data permohonan berhasil dibuat.",
        type: "info",
      },
    ],
  };
}

export function updateSubmissionData(submission, input) {
  const stamp = nowStamp();
  return {
    ...submission,
    submissionNumber: String(input.submissionNumber || submission.submissionNumber).trim(),
    submissionType: input.submissionType === "Perpanjangan" ? "Perpanjangan" : "Baru",
    organizationName: String(input.organizationName || submission.organizationName).trim(),
    nib: String(input.nib || submission.nib).trim(),
    kbli: String(input.kbli || submission.kbli).trim(),
    pengajuanDate: String(input.pengajuanDate || submission.pengajuanDate).trim(),
    lastUpdated: stamp.longDate,
  };
}

export function appendTimeline(submission, event) {
  const stamp = nowStamp();
  return {
    ...submission,
    lastUpdated: stamp.longDate,
    timeline: [
      ...(submission.timeline || []),
      {
        date: stamp.date,
        time: stamp.time,
        actor: event.actor || "Admin",
        ...event,
      },
    ],
  };
}

export function applyDocumentDecisions(submission, phase, decisions, actor = "Admin") {
  const isVerification = phase === "VERIFIKASI";
  const sourceDocs = isVerification ? submission.documents : submission.reviewDocuments;
  if (!Array.isArray(decisions) || decisions.length !== sourceDocs.length) {
    throw new Error("Jumlah keputusan dokumen tidak sesuai.");
  }

  const stamp = nowStamp();
  const nextDocs = sourceDocs.map((doc, index) => {
    const decision = decisions[index] || {};
    const status = decision.status === "revision_required" ? "revision_required" : "approved";
    return {
      ...doc,
      status,
      note: status === "revision_required" ? String(decision.note || "").trim() : "",
      history: [
        ...(doc.history || []),
        {
          date: stamp.date,
          time: stamp.time,
          status,
          note: String(decision.note || "").trim(),
        },
      ],
    };
  });
  const hasRevision = nextDocs.some((doc) => doc.status === "revision_required");
  const events = nextDocs.map((doc, index) => ({
    date: stamp.date,
    time: stamp.time,
    actor,
    phase,
    documentNumber: index + 1,
    decisionStatus: doc.status,
    note: doc.note,
    description: `${doc.name}: ${doc.status === "approved" ? "sesuai persyaratan" : "memerlukan perbaikan"}.`,
    type: doc.status === "approved" ? "success" : "error",
  }));

  const summary = {
    date: stamp.date,
    time: stamp.time,
    actor,
    phase,
    description: hasRevision
      ? `${phase === "VERIFIKASI" ? "Verifikasi" : "Peninjauan"} selesai dengan dokumen yang memerlukan perbaikan.`
      : `${phase === "VERIFIKASI" ? "Verifikasi" : "Peninjauan"} selesai. Seluruh dokumen sesuai persyaratan.`,
    type: hasRevision ? "warning" : "success",
  };

  if (isVerification) {
    return {
      ...submission,
      documents: nextDocs,
      verificationCompleted: !hasRevision,
      reviewDocuments: hasRevision ? submission.reviewDocuments : buildDocuments("locked"),
      verificationWorklistDocNumbers: nextDocs
        .map((doc, index) => (doc.status === "revision_required" ? index + 1 : null))
        .filter(Boolean),
      lastUpdated: stamp.longDate,
      timeline: [...(submission.timeline || []), ...events, summary],
    };
  }

  return {
    ...submission,
    reviewDocuments: nextDocs,
    reviewCompleted: !hasRevision,
    reviewNotes: hasRevision
      ? "Masih terdapat dokumen yang memerlukan perbaikan."
      : "Seluruh dokumen pada tahap peninjauan dinyatakan sesuai persyaratan.",
    lastUpdated: stamp.longDate,
    timeline: [...(submission.timeline || []), ...events, summary],
  };
}
