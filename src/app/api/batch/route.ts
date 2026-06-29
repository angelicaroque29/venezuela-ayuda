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
import { enrichReport } from "@/lib/report-enrichment";

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
    const message =
      error instanceof Error ? error.message : "Error en procesamiento por lotes.";
    return NextResponse.json(
      { error: "Error en procesamiento por lotes.", detail: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const pending = await getUnprocessedReports();
  const legitimate = (await getLegitimateReports()).map(enrichReport);
  const pendingReports = (await getPendingReportsList()).map(enrichReport);
  const rejectedReports = (await getRejectedReports()).map(enrichReport);
  const batches = await getBatchResults();

  return NextResponse.json({
    pendingCount: pending.length,
    legitimateReports: legitimate.slice(0, 100),
    pendingReports: pendingReports.slice(0, 50),
    rejectedReports: rejectedReports.slice(0, 50),
    batches: batches.slice(0, 10),
    lastBatchTime: await getLastBatchTime(),
  });
}
