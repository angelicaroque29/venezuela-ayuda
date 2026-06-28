import { NextRequest, NextResponse } from "next/server";
import { processReportBatch } from "@/lib/batch-processor";
import {
  getLegitimateReports,
  getBatchResults,
  getLastBatchTime,
  getUnprocessedReports,
  getPendingReportsList,
  getRejectedReports,
} from "@/lib/report-store";
import { getStorageBackend } from "@/lib/storage";
import { getOpenAIUsageStats } from "@/lib/openai-guard";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.BATCH_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "No autorizado. El procesamiento IA solo corre en el servidor." },
      { status: 401 }
    );
  }

  try {
    const result = await processReportBatch();

    if (result.status === "no_reports") {
      return NextResponse.json({
        message: "No hay reportes pendientes en este lote.",
        processed: 0,
      });
    }

    if (result.status === "rate_limited") {
      return NextResponse.json(
        {
          error: "OpenAI limitado a 1 llamada por hora.",
          nextAllowedAt: result.nextAllowedAt,
        },
        { status: 429 }
      );
    }

    const { data, usedOpenAI } = result;
    return NextResponse.json({
      message: "Lote procesado exitosamente.",
      processed: data.legitimate.length + data.falsos.length,
      legitimate: data.legitimate.length,
      falsos: data.falsos.length,
      resumenGeneral: data.resumenGeneral,
      usedOpenAI,
    });
  } catch (error) {
    console.error("Batch processing error:", error);
    return NextResponse.json(
      { error: "Error en procesamiento por lotes." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const pending = await getUnprocessedReports();
  const legitimate = await getLegitimateReports();
  const batches = await getBatchResults();
  const openaiUsage = await getOpenAIUsageStats(pending.length);

  return NextResponse.json({
    pendingCount: pending.length,
    legitimateReports: legitimate.slice(0, 100),
    pendingReports: (await getPendingReportsList()).slice(0, 50),
    rejectedReports: (await getRejectedReports()).slice(0, 50),
    batches: batches.slice(0, 10),
    lastBatchTime: await getLastBatchTime(),
    storageBackend: getStorageBackend(),
    openaiUsage,
    nextBatchNote:
      "OpenAI: máximo 1 llamada por hora (cron). Sin reportes pendientes = $0 en esa hora.",
  });
}
