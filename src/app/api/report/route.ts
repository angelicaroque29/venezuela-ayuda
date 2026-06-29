import { NextRequest, NextResponse } from "next/server";
import { validateReportLocally } from "@/lib/validate-report";
import { addReport, type ReportSource } from "@/lib/report-store";
import { isProductionWithoutKv } from "@/lib/storage";

const VALID_SOURCES: ReportSource[] = ["web", "telegram", "whatsapp"];

function storageErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "KV_NOT_CONFIGURED") {
      return "Almacenamiento no configurado en el servidor. Contacta al administrador.";
    }
    if (error.message.includes("KV_REST_API") || error.message.includes("UPSTASH")) {
      return "Error de conexión con la base de datos. Intenta de nuevo en unos minutos.";
    }
    if (error.message.includes("EROFS") || error.message.includes("read-only")) {
      return "El servidor no puede guardar reportes. Falta configurar Vercel KV.";
    }
  }
  return "Error al procesar el reporte.";
}

export async function POST(request: NextRequest) {
  try {
    if (isProductionWithoutKv()) {
      console.warn(
        "[report] Vercel sin KV: usando almacenamiento temporal en /tmp (no persistente entre instancias)"
      );
    }

    const body = await request.json();
    const { text, ubicacion, source = "web" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Texto del reporte requerido." },
        { status: 400 }
      );
    }

    if (!VALID_SOURCES.includes(source)) {
      return NextResponse.json(
        { error: "Fuente de reporte no válida." },
        { status: 400 }
      );
    }

    const validation = validateReportLocally(text);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason, blocked: true },
        { status: 422 }
      );
    }

    const report = await addReport(text, source, ubicacion);

    return NextResponse.json({
      success: true,
      message:
        "Reporte enviado al panel de brigadas. Será revisado y priorizado.",
      reportId: report.id,
    });
  } catch (error) {
    console.error("[report] Error al guardar reporte:", error);
    return NextResponse.json(
      { error: storageErrorMessage(error) },
      { status: 500 }
    );
  }
}
