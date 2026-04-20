import type {
  AdminSubmission,
  ApprovalFinalizeInput,
  LicenseIssuanceInput,
  NewSubmissionInput,
  RevisionUploadInput,
  SessionDecisionInput,
} from "@/contexts/SubmissionContext";
import type { DocumentUploadPhase } from "@/data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";

export const isApiEnabled = Boolean(API_BASE_URL) && import.meta.env.MODE !== "test";

export const AUTH_TOKEN_STORAGE_KEY = "tracking-os-auth-token";

type ApiResponse<T> = {
  data?: T;
  token?: string;
  user?: {
    email: string;
    role: string;
  };
  error?: string;
};

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";
};

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",").pop() || "" : result);
    };
    reader.onerror = () => reject(reader.error || new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });

const withUploadPayload = async <
  T extends {
    file?: File;
    fileName?: string;
    skFileName?: string;
    fileSizeBytes?: number;
    skFileSizeBytes?: number;
  },
>(input: T) => {
  if (!input.file) return input;

  return {
    ...input,
    fileName: input.fileName || input.skFileName || input.file.name,
    fileSizeBytes: input.fileSizeBytes || input.skFileSizeBytes || input.file.size,
    mimeType: input.file.type || "application/pdf",
    fileBase64: await fileToBase64(input.file),
    file: undefined,
  };
};

const absolutizeFileUrls = <T,>(value: T): T => {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(absolutizeFileUrls) as T;

  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  Object.entries(record).forEach(([key, entry]) => {
    if ((key === "fileUrl" || key === "skFileUrl") && typeof entry === "string" && entry.startsWith("/")) {
      next[key] = `${API_BASE_URL}${entry}`;
      return;
    }
    next[key] = absolutizeFileUrls(entry);
  });
  return next as T;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("content-type", "application/json");

  const token = getAuthToken();
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(payload.error || "Permintaan ke server gagal.");
  }

  return absolutizeFileUrls((payload.data ?? payload) as T);
}

export const api = {
  async login(email: string, password: string) {
    const response = await request<ApiResponse<never>>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  listSubmissions() {
    return request<AdminSubmission[]>("/api/submissions");
  },

  listPublicSubmissions() {
    return request<AdminSubmission[]>("/api/public/submissions");
  },

  createSubmission(input: NewSubmissionInput) {
    return request<AdminSubmission>("/api/submissions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateSubmission(id: string, input: NewSubmissionInput) {
    return request<AdminSubmission>(`/api/submissions/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  deleteSubmission(id: string) {
    return request<{ ok: boolean }>(`/api/submissions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  trackSubmission(submissionNumber: string) {
    return request<AdminSubmission>(`/api/public/track/${encodeURIComponent(submissionNumber)}`);
  },

  confirmPengajuan(id: string) {
    return request<AdminSubmission>(`/api/submissions/${encodeURIComponent(id)}/confirm-pengajuan`, {
      method: "POST",
    });
  },

  submitVerificationSession(id: string, decisions: SessionDecisionInput[]) {
    return request<AdminSubmission>(`/api/submissions/${encodeURIComponent(id)}/verification`, {
      method: "POST",
      body: JSON.stringify({ decisions }),
    });
  },

  submitReviewSession(id: string, decisions: SessionDecisionInput[]) {
    return request<AdminSubmission>(`/api/submissions/${encodeURIComponent(id)}/review`, {
      method: "POST",
      body: JSON.stringify({ decisions }),
    });
  },

  async uploadRevisionDocument(
    id: string,
    phase: DocumentUploadPhase,
    documentNumber: number,
    input: RevisionUploadInput,
  ) {
    const uploadPayload = await withUploadPayload(input);
    return request<AdminSubmission>(`/api/submissions/${encodeURIComponent(id)}/revision-upload`, {
      method: "POST",
      body: JSON.stringify({
        phase,
        documentNumber,
        ...uploadPayload,
      }),
    });
  },

  async finalizeApproval(id: string, input: ApprovalFinalizeInput) {
    const uploadPayload = await withUploadPayload(input);
    return request<AdminSubmission>(`/api/submissions/${encodeURIComponent(id)}/approval`, {
      method: "POST",
      body: JSON.stringify(uploadPayload),
    });
  },

  issueLicense(id: string, input: LicenseIssuanceInput) {
    return request<AdminSubmission>(`/api/submissions/${encodeURIComponent(id)}/issue-license`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
