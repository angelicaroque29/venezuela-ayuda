import type { CitizenReport } from "./report-store";
import { inferCategory, inferPriority } from "./report-enrichment";

export interface BatchAnalysisResult {
  legitimate: string[];
  falsos: string[];
  resumenGeneral: string;
  detalles: Array<{
    id: string;
    categoria?: string;
    prioridad?: string;
    resumen?: string;
    triageReason?: string;
  }>;
}

export function localBatchAnalysis(reports: CitizenReport[]): BatchAnalysisResult {
  const legitimate: string[] = [];
  const falsos: string[] = [];
  const detalles: BatchAnalysisResult["detalles"] = [];

  for (const report of reports) {
    const text = `${report.text} ${report.ubicacion ?? ""}`.toLowerCase();
    const isSpam =
      text.length < 20 ||
      /(bitcoin|crypto|casino|apuesta|ganar dinero)/i.test(text);

    if (isSpam) {
      falsos.push(report.id);
      detalles.push({
        id: report.id,
        categoria: "REPORTE_INFORMATIVO",
        prioridad: "BAJA",
        resumen: report.text.slice(0, 100),
        triageReason: "Filtrado local: posible spam o texto insuficiente.",
      });
      continue;
    }

    legitimate.push(report.id);
    detalles.push({
      id: report.id,
      categoria: inferCategory(report),
      prioridad: inferPriority(report),
      resumen: report.text.slice(0, 120),
      triageReason: "Triaje local: reporte coherente con emergencia sísmica.",
    });
  }

  return {
    legitimate,
    falsos,
    resumenGeneral: `${legitimate.length} reportes revisados localmente. Las brigadas deben confirmar en terreno.`,
    detalles,
  };
}

export function normalizeBatchResult(
  raw: Partial<BatchAnalysisResult>,
  reports: CitizenReport[]
): BatchAnalysisResult {
  const reportIds = new Set(reports.map((r) => r.id));
  const legitimate = (raw.legitimate ?? []).filter((id) => reportIds.has(id));
  const falsos = (raw.falsos ?? []).filter((id) => reportIds.has(id));
  const classified = new Set([...legitimate, ...falsos]);

  const detallesMap = new Map(
    (raw.detalles ?? []).filter((d) => reportIds.has(d.id)).map((d) => [d.id, d])
  );

  for (const report of reports) {
    if (classified.has(report.id)) continue;
    legitimate.push(report.id);
    detallesMap.set(report.id, {
      id: report.id,
      categoria: inferCategory(report),
      prioridad: inferPriority(report),
      resumen: report.text.slice(0, 120),
      triageReason: "Incluido por defecto: no clasificado por IA.",
    });
  }

  const detalles = Array.from(detallesMap.values());

  return {
    legitimate,
    falsos,
    resumenGeneral:
      raw.resumenGeneral ??
      `${legitimate.length} reportes en triaje. Requieren confirmación en terreno.`,
    detalles,
  };
}
