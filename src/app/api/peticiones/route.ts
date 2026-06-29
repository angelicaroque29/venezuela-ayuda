import { NextResponse } from "next/server";
import { getPublicPetitions } from "@/lib/report-store";
import { enrichReport } from "@/lib/report-enrichment";
import {
  inferPeticionTipo,
  peticionEmoji,
  peticionLabel,
  type PeticionTipo,
} from "@/lib/peticion-types";

export const dynamic = "force-dynamic";

function publicStatus(brigadeStatus?: string): string {
  switch (brigadeStatus) {
    case "confirmado":
      return "Atendido";
    case "en_revision":
      return "En atención";
    case "descartado":
      return "Cerrado";
    default:
      return "Activo";
  }
}

export async function GET() {
  try {
    const reports = await getPublicPetitions();

    const peticiones = reports.map((r) => {
      const enriched = enrichReport(r);
      const tipo =
        r.tipoPeticion ?? inferPeticionTipo(r.text, r.ubicacion);

      return {
        id: r.id,
        tipo,
        tipoLabel: peticionLabel(tipo),
        tipoEmoji: peticionEmoji(tipo),
        zona: enriched.zona,
        resumen: (r.resumen ?? r.text).slice(0, 160),
        prioridad: enriched.prioridad,
        estado: publicStatus(r.brigadeStatus),
        createdAt: r.createdAt,
      };
    });

    const counts: Record<PeticionTipo | "todas", number> = {
      todas: peticiones.length,
      atrapados: 0,
      medicamentos: 0,
      alimentos: 0,
      buscar_persona: 0,
      otros: 0,
    };

    for (const p of peticiones) {
      counts[p.tipo]++;
    }

    return NextResponse.json({
      peticiones,
      counts,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[peticiones]", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las peticiones." },
      { status: 500 }
    );
  }
}
