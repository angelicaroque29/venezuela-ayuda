import { NextRequest, NextResponse } from "next/server";
import {
  type BrigadeStatus,
  updateBrigadeStatus,
} from "@/lib/report-store";

const VALID_STATUSES: BrigadeStatus[] = [
  "nuevo",
  "en_revision",
  "confirmado",
  "descartado",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { brigadeStatus, brigadeNotes } = body;

    if (!brigadeStatus || !VALID_STATUSES.includes(brigadeStatus)) {
      return NextResponse.json(
        { error: "Estado de brigada no válido." },
        { status: 400 }
      );
    }

    const report = await updateBrigadeStatus(
      params.id,
      brigadeStatus,
      typeof brigadeNotes === "string" ? brigadeNotes : undefined
    );

    return NextResponse.json({ success: true, report });
  } catch (error) {
    if (error instanceof Error && error.message === "REPORT_NOT_FOUND") {
      return NextResponse.json({ error: "Reporte no encontrado." }, { status: 404 });
    }
    console.error("[report status]", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el estado." },
      { status: 500 }
    );
  }
}
