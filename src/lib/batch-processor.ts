import OpenAI from "openai";
import {
  getUnprocessedReports,
  updateReportsAfterBatch,
  saveBatchResult,
  CitizenReport,
} from "./report-store";

export interface BatchAnalysisResult {
  legitimate: string[];
  falsos: string[];
  resumenGeneral: string;
  detalles: Array<{
    id: string;
    categoria?: string;
    prioridad?: string;
    resumen?: string;
  }>;
}

function buildBatchPrompt(reports: CitizenReport[]): string {
  const numbered = reports
    .map((r, i) => `[${i + 1}] ID:${r.id} | Fuente:${r.source} | "${r.text}"`)
    .join("\n");

  return `Analiza los siguientes reportes ciudadanos acumulados esta hora en Venezuela. Identifica cuáles presentan patrones claros de desinformación, reportes duplicados de forma maliciosa o pánico infundado creados por bots. Devuelve una lista con los IDs de los reportes legítimos calificados y marca con un flag de 'falso' los detectados como desinformación.

Para cada reporte legítimo, asigna categoría (EMERGENCIA_MEDICA, DAÑO_ESTRUCTURAL, NECESIDAD_INSUMOS, REPORTE_INFORMATIVO), prioridad (ALTA/MEDIA/BAJA) y resumen breve.

REPORTES:
${numbered}

Responde ÚNICAMENTE en JSON válido con este formato:
{
  "legitimate": ["id1", "id2"],
  "falsos": ["id3"],
  "resumenGeneral": "Breve resumen del lote para brigadistas",
  "detalles": [
    {"id": "id1", "categoria": "DAÑO_ESTRUCTURAL", "prioridad": "ALTA", "resumen": "..."}
  ]
}`;
}

function mockBatchAnalysis(reports: CitizenReport[]): BatchAnalysisResult {
  return {
    legitimate: reports.map((r) => r.id),
    falsos: [],
    resumenGeneral: `${reports.length} reportes procesados (modo demo sin API key).`,
    detalles: reports.map((r) => ({
      id: r.id,
      categoria: "REPORTE_INFORMATIVO",
      prioridad: "MEDIA",
      resumen: r.text.slice(0, 80),
    })),
  };
}

export async function processReportBatch(): Promise<BatchAnalysisResult | null> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const reports = getUnprocessedReports(oneHourAgo);

  if (reports.length === 0) {
    return null;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  let analysis: BatchAnalysisResult;

  if (!apiKey) {
    analysis = mockBatchAnalysis(reports);
  } else {
    const openai = new OpenAI({ apiKey });
    const prompt = buildBatchPrompt(reports);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    analysis = JSON.parse(content) as BatchAnalysisResult;
  }

  const metadata = new Map<
    string,
    { categoria?: string; prioridad?: string; resumen?: string }
  >();
  for (const d of analysis.detalles ?? []) {
    metadata.set(d.id, {
      categoria: d.categoria,
      prioridad: d.prioridad,
      resumen: d.resumen,
    });
  }

  updateReportsAfterBatch(analysis.legitimate, analysis.falsos, metadata);

  saveBatchResult({
    batchId: `batch_${Date.now()}`,
    processedAt: new Date().toISOString(),
    reportCount: reports.length,
    legitimate: analysis.legitimate,
    falsos: analysis.falsos,
    resumenGeneral: analysis.resumenGeneral,
  });

  return analysis;
}
