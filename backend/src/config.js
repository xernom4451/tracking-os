import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const envFile = path.resolve(backendRoot, ".env");

function loadLocalEnv() {
  if (!fs.existsSync(envFile)) return;

  const lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

loadLocalEnv();

export const config = {
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:8080",
  adminEmail: (process.env.ADMIN_EMAIL || "admin@tracking-os.local").trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  authToken: process.env.AUTH_TOKEN || "dev-tracking-os-token",
  dataFile: path.resolve(backendRoot, process.env.DATA_FILE || "./data/db.json"),
  supabaseUrl: (process.env.SUPABASE_URL || "").replace(/\/+$/, ""),
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  supabaseBucket: process.env.SUPABASE_BUCKET || "tracking-documents",
};
