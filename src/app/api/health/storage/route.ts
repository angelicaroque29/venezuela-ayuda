import { NextResponse } from "next/server";
import { getStorageBackend, isProductionWithoutKv } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const backend = getStorageBackend();
  const hasUpstash = !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  const hasKv = !!(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  );

  let kvPing: "ok" | "error" | "skipped" = "skipped";
  if (backend === "kv") {
    try {
      const { getStorageItem, setStorageItem } = await import("@/lib/storage");
      const testKey = "__health_ping__";
      await setStorageItem(testKey, { ts: Date.now() });
      const read = await getStorageItem(testKey, null);
      kvPing = read ? "ok" : "error";
    } catch {
      kvPing = "error";
    }
  }

  return NextResponse.json({
    backend,
    hasUpstash,
    hasKv,
    kvPing,
    warning: isProductionWithoutKv()
      ? "Sin Redis en producción — reportes no persisten entre instancias"
      : null,
  });
}
