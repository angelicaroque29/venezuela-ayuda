import fs from "fs";
import path from "path";

type KvCredentials = {
  url: string;
  token: string;
};

function getKvCredentials(): KvCredentials | null {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

  if (url && token) {
    return { url, token };
  }

  return null;
}

function isKvEnabled(): boolean {
  return getKvCredentials() !== null;
}

function getDataDir(): string {
  if (process.env.VERCEL) {
    return path.join("/tmp", "venezuela-sismo-data");
  }
  return path.join(process.cwd(), "data");
}

function filePath(key: string): string {
  const safe = key.replace(/[^a-z0-9_-]/gi, "_");
  return path.join(getDataDir(), `${safe}.json`);
}

function readFile<T>(key: string, fallback: T): T {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
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
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(filePath(key), JSON.stringify(value, null, 2), "utf-8");
}

async function getKvClient() {
  const credentials = getKvCredentials();
  if (!credentials) {
    throw new Error("KV_NOT_CONFIGURED");
  }

  const { createClient } = await import("@vercel/kv");
  return createClient({
    url: credentials.url,
    token: credentials.token,
  });
}

export async function getStorageItem<T>(key: string, fallback: T): Promise<T> {
  if (isKvEnabled()) {
    const kv = await getKvClient();
    const value = await kv.get<T>(key);
    return value ?? fallback;
  }
  return readFile(key, fallback);
}

export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  if (isKvEnabled()) {
    const kv = await getKvClient();
    await kv.set(key, value);
    return;
  }
  writeFile(key, value);
}

export function getStorageBackend(): "kv" | "file" {
  return isKvEnabled() ? "kv" : "file";
}

export function isProductionWithoutKv(): boolean {
  return !!process.env.VERCEL && !isKvEnabled();
}
