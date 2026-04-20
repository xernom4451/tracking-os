import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";

const emptyDatabase = { submissions: [] };

export async function readDatabase() {
  try {
    const raw = await fs.readFile(config.dataFile, "utf8");
    const parsed = JSON.parse(raw);
    return {
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return emptyDatabase;
  }
}

export async function writeDatabase(database) {
  await fs.mkdir(path.dirname(config.dataFile), { recursive: true });
  await fs.writeFile(config.dataFile, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}
