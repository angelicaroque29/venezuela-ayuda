import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function isKvEnabled(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function filePath(key: string): string {
  const safe = key.replace(/[^a-z0-9_-]/gi, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

function readFile<T>(key: string, fallback: T): T {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const fp = filePath(key);
  if (!fs.existsSync(fp)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeFile<T>(key: string, value: T): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(filePath(key), JSON.stringify(value, null, 2), "utf-8");
}

export async function getStorageItem<T>(key: string, fallback: T): Promise<T> {
  if (isKvEnabled()) {
    const { kv } = await import("@vercel/kv");
    const value = await kv.get<T>(key);
    return value ?? fallback;
  }
  return readFile(key, fallback);
}

export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  if (isKvEnabled()) {
    const { kv } = await import("@vercel/kv");
    await kv.set(key, value);
    return;
  }
  writeFile(key, value);
}

export function getStorageBackend(): "kv" | "file" {
  return isKvEnabled() ? "kv" : "file";
}
