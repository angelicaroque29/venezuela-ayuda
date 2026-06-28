import { NextRequest, NextResponse } from "next/server";
import { processReportBatch } from "@/lib/batch-processor";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await processReportBatch();

    if (!result) {
      return NextResponse.json({ ok: true, processed: 0, message: "Sin reportes pendientes" });
    }

    return NextResponse.json({
      ok: true,
      processed: result.legitimate.length + result.falsos.length,
      legitimate: result.legitimate.length,
      falsos: result.falsos.length,
    });
  } catch (error) {
    console.error("Cron batch error:", error);
    return NextResponse.json({ error: "Error en cron" }, { status: 500 });
  }
}
