import crypto from "node:crypto";
import { config } from "./config.js";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const sanitizeFileName = (fileName) =>
  String(fileName || "document.pdf")
    .trim()
    .replace(/[^\w.\-() ]+/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 140);

const encodeStoragePath = (storageKey) =>
  storageKey.split("/").map(encodeURIComponent).join("/");

export function hasStorageConfig() {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey && config.supabaseBucket);
}

export function decodeUploadPayload(body) {
  const fileName = sanitizeFileName(body.fileName || body.skFileName);
  const fileSizeBytes = Number(body.fileSizeBytes || body.skFileSizeBytes || 0);
  const mimeType = String(body.mimeType || "application/pdf").trim() || "application/pdf";
  const fileBase64 = String(body.fileBase64 || "");

  if (!fileBase64) {
    return { fileName, fileSizeBytes, mimeType, buffer: null };
  }

  if (!fileName.toLowerCase().endsWith(".pdf") || mimeType !== "application/pdf") {
    throw new Error("File wajib berformat PDF.");
  }

  const buffer = Buffer.from(fileBase64, "base64");
  if (buffer.length <= 0 || buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error("Ukuran file wajib lebih dari 0 dan maksimal 5 MB.");
  }

  const pdfSignature = buffer.subarray(0, 4).toString("utf8");
  if (pdfSignature !== "%PDF") {
    throw new Error("Konten file tidak valid sebagai PDF.");
  }

  return {
    fileName,
    fileSizeBytes: fileSizeBytes || buffer.length,
    mimeType,
    buffer,
  };
}

export async function uploadPdfToStorage({ buffer, fileName, submissionId, category }) {
  if (!buffer || !hasStorageConfig()) return null;

  const safeName = sanitizeFileName(fileName);
  const uniquePart = `${Date.now()}-${crypto.randomUUID()}`;
  const storageKey = `submissions/${submissionId}/${category}/${uniquePart}-${safeName}`;
  const uploadUrl = `${config.supabaseUrl}/storage/v1/object/${config.supabaseBucket}/${encodeStoragePath(storageKey)}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      apikey: config.supabaseServiceRoleKey,
      "content-type": "application/pdf",
      "x-upsert": "false",
    },
    body: buffer,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Upload ke Supabase Storage gagal. ${detail}`);
  }

  return storageKey;
}

export async function createSignedDownloadUrl(storageKey) {
  if (!hasStorageConfig()) {
    throw new Error("Konfigurasi Supabase Storage belum tersedia.");
  }

  const signUrl = `${config.supabaseUrl}/storage/v1/object/sign/${config.supabaseBucket}/${encodeStoragePath(storageKey)}`;
  const response = await fetch(signUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      apikey: config.supabaseServiceRoleKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ expiresIn: 300 }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.signedURL) {
    throw new Error(payload.message || "Gagal membuat signed URL dokumen.");
  }

  return `${config.supabaseUrl}/storage/v1${payload.signedURL}`;
}
