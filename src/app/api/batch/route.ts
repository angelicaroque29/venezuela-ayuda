import { NextRequest, NextResponse } from "next/server";
import { processReportBatch } from "@/lib/batch-processor";
import {
  getLegitimateReports,
  getBatchResults,
  getLastBatchTime,
  getUnprocessedReports,
} from "@/lib/report-store";

export async function POST(request: NextRequest) {
  const secret = process.env.BATCH_CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "El procesamiento por IA solo está disponible en el servidor." },
      { status: 403 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await processReportBatch();

    if (!result) {
      return NextResponse.json({
        message: "No hay reportes pendientes en este lote.",
        processed: 0,
      });
    }

    return NextResponse.json({
      message: "Lote procesado exitosamente.",
      processed: result.legitimate.length + result.falsos.length,
      legitimate: result.legitimate.length,
      falsos: result.falsos.length,
      resumenGeneral: result.resumenGeneral,
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
  const pending = getUnprocessedReports();
  const legitimate = getLegitimateReports();
  const batches = getBatchResults();

  return NextResponse.json({
    pendingCount: pending.length,
    legitimateReports: legitimate.slice(0, 50),
    batches: batches.slice(0, 10),
    lastBatchTime: getLastBatchTime(),
    nextBatchNote:
      "Los reportes se verifican automáticamente cada hora. Solo lectura.",
  });
}
