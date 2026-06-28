import OpenAI from "openai";
import {
  getUnprocessedReports,
  updateReportsAfterBatch,
  saveBatchResult,
  CitizenReport,
} from "./report-store";

export const VERIFICATION_METHODOLOGY = `
La IA NO confirma hechos en terreno. Solo hace TRIAJE:
- Filtra spam, bots, pánico infundado y duplicados maliciosos
- Clasifica reportes que parecen genuinos según coherencia interna
- Las brigadas DEBEN confirmar en terreno antes de actuar
`.trim();

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

function buildBatchPrompt(reports: CitizenReport[]): string {
  const numbered = reports
    .map(
      (r, i) =>
        `[${i + 1}] ID:${r.id} | Fuente:${r.source} | Ubicación:${r.ubicacion ?? "no indicada"} | "${r.text}"`
    )
    .join("\n");

  return `Eres un sistema de TRIAJE para emergencias sísmicas en Venezuela. IMPORTANTE: NO puedes confirmar hechos reales — solo clasificar si un reporte parece genuino o sospechoso.

CRITERIOS PARA MARCAR COMO LEGÍTIMO (triage, no verdad confirmada):
- Menciona ubicación concreta y situación específica
- Coherencia interna (no contradicciones obvias)
- No parece spam, bot, publicidad ni pánico infundado
- No es copia idéntica repetida de otros reportes

CRITERIOS PARA MARCAR COMO FALSO/RECHAZADO:
- Desinformación evidente o imposible físicamente
- Texto genérico sin ubicación ni detalle
- Patrones de bot (repetición, enlaces, crypto, apuestas)
- Pánico infundado sin datos verificables
- Duplicados maliciosos del mismo mensaje

REPORTES:
${numbered}

Responde ÚNICAMENTE en JSON válido:
{
  "legitimate": ["id1"],
  "falsos": ["id2"],
  "resumenGeneral": "Resumen para brigadistas — incluye que requieren confirmación en terreno",
  "detalles": [
    {
      "id": "id1",
      "categoria": "DAÑO_ESTRUCTURAL",
      "prioridad": "ALTA",
      "resumen": "Breve resumen",
      "triageReason": "Por qué pasó el triaje (no afirmes que es 100% cierto)"
    }
  ]
}`;
}

function mockBatchAnalysis(reports: CitizenReport[]): BatchAnalysisResult {
  return {
    legitimate: reports.map((r) => r.id),
    falsos: [],
    resumenGeneral: `${reports.length} reportes en triaje (modo demo sin API key). Requieren confirmación en terreno.`,
    detalles: reports.map((r) => ({
      id: r.id,
      categoria: "REPORTE_INFORMATIVO",
      prioridad: "MEDIA",
      resumen: r.text.slice(0, 80),
      triageReason: "Modo demo: pasó filtro local de palabras clave.",
    })),
  };
}

export async function processReportBatch(): Promise<BatchAnalysisResult | null> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const reports = await getUnprocessedReports(oneHourAgo);

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
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente de triaje para emergencias. Nunca afirmes que un reporte es factualmente cierto. Solo indica si parece genuino o sospechoso.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    analysis = JSON.parse(content) as BatchAnalysisResult;
  }

  const metadata = new Map<
    string,
    { categoria?: string; prioridad?: string; resumen?: string; triageReason?: string }
  >();
  for (const d of analysis.detalles ?? []) {
    metadata.set(d.id, {
      categoria: d.categoria,
      prioridad: d.prioridad,
      resumen: d.resumen,
      triageReason: d.triageReason,
    });
  }

  await updateReportsAfterBatch(analysis.legitimate, analysis.falsos, metadata);

  await saveBatchResult({
    batchId: `batch_${Date.now()}`,
    processedAt: new Date().toISOString(),
    reportCount: reports.length,
    legitimate: analysis.legitimate,
    falsos: analysis.falsos,
    resumenGeneral: analysis.resumenGeneral,
    methodology: VERIFICATION_METHODOLOGY,
  });

  return analysis;
}
