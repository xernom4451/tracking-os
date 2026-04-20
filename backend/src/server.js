import http from "node:http";
import { URL } from "node:url";
import { config } from "./config.js";
import { readDatabase, writeDatabase } from "./storage.js";
import {
  appendTimeline,
  applyDocumentDecisions,
  buildDocuments,
  createSubmission,
  nowStamp,
  updateSubmissionData,
} from "./domain.js";
import {
  createSignedDownloadUrl,
  decodeUploadPayload,
  hasStorageConfig,
  uploadPdfToStorage,
} from "./uploads.js";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
};

function send(res, status, payload, origin) {
  res.writeHead(status, {
    ...jsonHeaders,
    "access-control-allow-origin": origin || config.corsOrigin,
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isAuthorized(req) {
  const header = req.headers.authorization || "";
  return header === `Bearer ${config.authToken}`;
}

function buildFileUrl(storageKey) {
  if (!storageKey) return "";
  return `/api/files?key=${encodeURIComponent(storageKey)}`;
}

function decorateSubmission(submission) {
  const decorateDocs = (docs = []) => docs.map((doc) => ({
    ...doc,
    uploads: (doc.uploads || []).map((upload) => ({
      ...upload,
      fileUrl: upload.storageKey ? buildFileUrl(upload.storageKey) : upload.fileUrl,
    })),
  }));

  return {
    ...submission,
    skFileUrl: submission.skStorageKey ? buildFileUrl(submission.skStorageKey) : submission.skFileUrl,
    documents: decorateDocs(submission.documents),
    reviewDocuments: decorateDocs(submission.reviewDocuments),
  };
}

function decorateSubmissions(submissions) {
  return submissions.map(decorateSubmission);
}

function publicSubmission(submission) {
  return decorateSubmission(submission);
}

function requireAdmin(req, res, origin) {
  if (isAuthorized(req)) return true;
  send(res, 401, { error: "Unauthorized" }, origin);
  return false;
}

async function updateById(id, updater) {
  const db = await readDatabase();
  const index = db.submissions.findIndex((submission) => submission.id === id);
  if (index < 0) return null;
  db.submissions[index] = updater(db.submissions[index], db.submissions);
  await writeDatabase(db);
  return db.submissions[index];
}

async function handler(req, res) {
  const origin = req.headers.origin || config.corsOrigin;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);

  if (req.method === "OPTIONS") {
    send(res, 204, {}, origin);
    return;
  }

  try {
    if (req.method === "GET" && url.pathname === "/") {
      send(res, 200, {
        ok: true,
        service: "tracking-os-backend",
        message: "Backend Tracking OS berjalan. Gunakan endpoint /health, /api/auth/login, /api/submissions, atau /api/public/track/:submissionNumber.",
        storageConfigured: hasStorageConfig(),
        endpoints: {
          health: "/health",
          storageStatus: "/api/storage/status",
          login: "POST /api/auth/login",
          publicTrack: "GET /api/public/track/:submissionNumber",
          publicSubmissions: "GET /api/public/submissions",
        },
      }, origin);
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      send(res, 200, { ok: true, service: "tracking-os-backend" }, origin);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/storage/status") {
      send(res, 200, {
        configured: hasStorageConfig(),
        bucket: config.supabaseBucket,
        hasSupabaseUrl: Boolean(config.supabaseUrl),
        hasServiceRoleKey: Boolean(config.supabaseServiceRoleKey),
      }, origin);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/files") {
      const key = url.searchParams.get("key");
      if (!key) {
        send(res, 400, { error: "Storage key wajib diisi." }, origin);
        return;
      }

      const signedUrl = await createSignedDownloadUrl(key);
      res.writeHead(302, {
        location: signedUrl,
        "access-control-allow-origin": origin || config.corsOrigin,
      });
      res.end();
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readJson(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (email !== config.adminEmail || password !== config.adminPassword) {
        send(res, 401, { error: "Email atau password tidak valid." }, origin);
        return;
      }
      send(res, 200, {
        token: config.authToken,
        user: { email: config.adminEmail, role: "admin" },
      }, origin);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/submissions") {
      if (!requireAdmin(req, res, origin)) return;
      const db = await readDatabase();
      send(res, 200, { data: decorateSubmissions(db.submissions) }, origin);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/public/submissions") {
      const db = await readDatabase();
      send(res, 200, {
        data: decorateSubmissions(db.submissions.filter((submission) => submission.licenseIssued)),
      }, origin);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/submissions") {
      if (!requireAdmin(req, res, origin)) return;
      const body = await readJson(req);
      const submission = createSubmission(body, config.adminEmail);
      if (!submission.submissionNumber || !submission.organizationName) {
        send(res, 422, { error: "Nomor permohonan dan nama lembaga wajib diisi." }, origin);
        return;
      }
      const db = await readDatabase();
      if (db.submissions.some((item) => item.submissionNumber === submission.submissionNumber)) {
        send(res, 409, { error: "Nomor permohonan sudah digunakan." }, origin);
        return;
      }
      db.submissions.unshift(submission);
      await writeDatabase(db);
      send(res, 201, { data: decorateSubmission(submission) }, origin);
      return;
    }

    if (req.method === "GET" && parts[0] === "api" && parts[1] === "submissions" && parts[2]) {
      if (!requireAdmin(req, res, origin)) return;
      const db = await readDatabase();
      const submission = db.submissions.find((item) => item.id === parts[2]);
      if (!submission) {
        send(res, 404, { error: "Permohonan tidak ditemukan." }, origin);
        return;
      }
      send(res, 200, { data: decorateSubmission(submission) }, origin);
      return;
    }

    if (req.method === "PUT" && parts[0] === "api" && parts[1] === "submissions" && parts[2] && parts.length === 3) {
      if (!requireAdmin(req, res, origin)) return;
      const body = await readJson(req);
      const updated = await updateById(parts[2], (submission) => updateSubmissionData(submission, body));
      if (!updated) {
        send(res, 404, { error: "Permohonan tidak ditemukan." }, origin);
        return;
      }
      send(res, 200, { data: decorateSubmission(updated) }, origin);
      return;
    }

    if (req.method === "DELETE" && parts[0] === "api" && parts[1] === "submissions" && parts[2]) {
      if (!requireAdmin(req, res, origin)) return;
      const db = await readDatabase();
      const next = db.submissions.filter((submission) => submission.id !== parts[2]);
      if (next.length === db.submissions.length) {
        send(res, 404, { error: "Permohonan tidak ditemukan." }, origin);
        return;
      }
      await writeDatabase({ submissions: next });
      send(res, 200, { ok: true }, origin);
      return;
    }

    if (req.method === "GET" && parts[0] === "api" && parts[1] === "public" && parts[2] === "track" && parts[3]) {
      const db = await readDatabase();
      const normalized = decodeURIComponent(parts[3]).trim();
      const submission = db.submissions.find((item) => item.submissionNumber === normalized);
      if (!submission) {
        send(res, 404, { error: "Nomor permohonan tidak ditemukan." }, origin);
        return;
      }
      send(res, 200, { data: publicSubmission(submission) }, origin);
      return;
    }

    if (req.method === "POST" && parts[0] === "api" && parts[1] === "submissions" && parts[2] && parts[3] === "confirm-pengajuan") {
      if (!requireAdmin(req, res, origin)) return;
      const updated = await updateById(parts[2], (submission) => ({
        ...appendTimeline(submission, {
          actor: config.adminEmail,
          phase: "PENGAJUAN",
          description: "Pengajuan dikonfirmasi. Tahap Verifikasi Dokumen dimulai.",
          type: "info",
        }),
        pengajuanConfirmed: true,
        documents: buildDocuments("locked"),
      }));
      if (!updated) {
        send(res, 404, { error: "Permohonan tidak ditemukan." }, origin);
        return;
      }
      send(res, 200, { data: decorateSubmission(updated) }, origin);
      return;
    }

    if (req.method === "POST" && parts[0] === "api" && parts[1] === "submissions" && parts[2] && parts[3] === "verification") {
      if (!requireAdmin(req, res, origin)) return;
      const body = await readJson(req);
      const updated = await updateById(parts[2], (submission) =>
        applyDocumentDecisions(submission, "VERIFIKASI", body.decisions, config.adminEmail)
      );
      if (!updated) {
        send(res, 404, { error: "Permohonan tidak ditemukan." }, origin);
        return;
      }
      send(res, 200, { data: decorateSubmission(updated) }, origin);
      return;
    }

    if (req.method === "POST" && parts[0] === "api" && parts[1] === "submissions" && parts[2] && parts[3] === "review") {
      if (!requireAdmin(req, res, origin)) return;
      const body = await readJson(req);
      const updated = await updateById(parts[2], (submission) =>
        applyDocumentDecisions(submission, "PENINJAUAN", body.decisions, config.adminEmail)
      );
      if (!updated) {
        send(res, 404, { error: "Permohonan tidak ditemukan." }, origin);
        return;
      }
      send(res, 200, { data: decorateSubmission(updated) }, origin);
      return;
    }

    if (req.method === "POST" && parts[0] === "api" && parts[1] === "submissions" && parts[2] && parts[3] === "revision-upload") {
      const body = await readJson(req);
      const phase = body.phase === "PENINJAUAN" ? "PENINJAUAN" : "VERIFIKASI";
      const documentNumber = Number(body.documentNumber);
      const upload = decodeUploadPayload(body);
      const storageKey = await uploadPdfToStorage({
        buffer: upload.buffer,
        fileName: upload.fileName,
        submissionId: parts[2],
        category: `${phase.toLowerCase()}-doc-${documentNumber}`,
      });
      const updated = await updateById(parts[2], (submission) => {
        const docsKey = phase === "VERIFIKASI" ? "documents" : "reviewDocuments";
        const docs = submission[docsKey] || [];
        const index = documentNumber - 1;
        if (!docs[index] || docs[index].status !== "revision_required") {
          throw new Error("Dokumen tidak sedang membutuhkan perbaikan.");
        }
        const stamp = nowStamp();
        const nextDocs = docs.map((doc, docIndex) => docIndex === index ? {
          ...doc,
          uploads: [
            ...(doc.uploads || []),
            {
              fileName: upload.fileName,
              fileSizeBytes: upload.fileSizeBytes,
              mimeType: upload.mimeType,
              storageKey: storageKey || undefined,
              date: stamp.date,
              time: stamp.time,
              phase,
            },
          ],
        } : doc);
        return appendTimeline(
          { ...submission, [docsKey]: nextDocs },
          {
            actor: "Pemohon",
            phase,
            documentNumber,
            description: `Dokumen perbaikan untuk ${docs[index].name} diunggah: ${upload.fileName}.`,
            type: "info",
          },
        );
      });
      if (!updated) {
        send(res, 404, { error: "Permohonan tidak ditemukan." }, origin);
        return;
      }
      send(res, 200, { data: decorateSubmission(updated) }, origin);
      return;
    }

    if (req.method === "POST" && parts[0] === "api" && parts[1] === "submissions" && parts[2] && parts[3] === "approval") {
      if (!requireAdmin(req, res, origin)) return;
      const body = await readJson(req);
      const upload = decodeUploadPayload(body);
      const storageKey = await uploadPdfToStorage({
        buffer: upload.buffer,
        fileName: upload.fileName,
        submissionId: parts[2],
        category: "approval",
      });
      const updated = await updateById(parts[2], (submission, all) => {
        const licenseNumber = String(body.pbUmkuNumber || body.licenseNumber || "").trim().toUpperCase();
        if (all.some((item) => item.id !== submission.id && item.licenseNumber === licenseNumber)) {
          throw new Error("Nomor PB UMKU sudah digunakan.");
        }
        return appendTimeline({
          ...submission,
          ossStatus: "Izin Terbit",
          approvalCompleted: true,
          approvalDate: String(body.approvalDate || "").trim(),
          licenseNumber,
          skFileName: upload.fileName || String(body.skFileName || "").trim(),
          skFileSizeBytes: upload.fileSizeBytes || Number(body.skFileSizeBytes || 0),
          skMimeType: upload.mimeType,
          skStorageKey: storageKey || submission.skStorageKey,
        }, {
          actor: config.adminEmail,
          phase: "PERSETUJUAN",
          description: "Data persetujuan disimpan. Lanjut ke Izin Terbit untuk menetapkan status izin.",
          type: "success",
        });
      });
      if (!updated) {
        send(res, 404, { error: "Permohonan tidak ditemukan." }, origin);
        return;
      }
      send(res, 200, { data: decorateSubmission(updated) }, origin);
      return;
    }

    if (req.method === "POST" && parts[0] === "api" && parts[1] === "submissions" && parts[2] && parts[3] === "issue-license") {
      if (!requireAdmin(req, res, origin)) return;
      const body = await readJson(req);
      const stamp = nowStamp();
      const status = body.status === "Tidak Aktif" ? "Tidak Aktif" : "Aktif";
      const updated = await updateById(parts[2], (submission) => appendTimeline({
        ...submission,
        ossStatus: "Izin Terbit",
        licenseIssued: true,
        licenseStatus: status,
        licenseDate: stamp.longDate,
      }, {
        actor: config.adminEmail,
        phase: "IZIN_TERBIT",
        description: `Izin PB UMKU diterbitkan dengan status ${status}.`,
        type: "success",
      }));
      if (!updated) {
        send(res, 404, { error: "Permohonan tidak ditemukan." }, origin);
        return;
      }
      send(res, 200, { data: decorateSubmission(updated) }, origin);
      return;
    }

    send(res, 404, { error: "Route tidak ditemukan." }, origin);
  } catch (error) {
    send(res, 400, { error: error.message || "Request tidak valid." }, origin);
  }
}

http.createServer(handler).listen(config.port, () => {
  console.log(`Tracking OS backend running on http://localhost:${config.port}`);
});
