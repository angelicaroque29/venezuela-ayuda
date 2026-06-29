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

    if (result.status === "no_reports") {
      return NextResponse.json({
        ok: true,
        processed: 0,
        usedOpenAI: false,
        message: "Sin reportes — no se llamó a OpenAI",
      });
    }

    const { data, usedOpenAI } = result;
    return NextResponse.json({
      ok: true,
      processed: data.legitimate.length + data.falsos.length,
      legitimate: data.legitimate.length,
      falsos: data.falsos.length,
      usedOpenAI,
      triageMode: usedOpenAI ? "openai" : "local",
    });
  } catch (error) {
    console.error("Cron batch error:", error);
    return NextResponse.json({ error: "Error en cron" }, { status: 500 });
  }
}
