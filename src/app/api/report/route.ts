import { NextRequest, NextResponse } from "next/server";
import { validateReportLocally } from "@/lib/validate-report";
import { addReport } from "@/lib/report-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, ubicacion, source = "web" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Texto del reporte requerido." },
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
  } catch {
    return NextResponse.json(
      { error: "Error al procesar el reporte." },
      { status: 500 }
    );
  }
}
