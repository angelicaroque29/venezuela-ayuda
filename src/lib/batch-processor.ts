import OpenAI from "openai";
import {
  getUnprocessedReports,
  updateReportsAfterBatch,
  saveBatchResult,
  CitizenReport,
} from "./report-store";
import { canCallOpenAI, recordOpenAICall } from "./openai-guard";
import { localBatchAnalysis, normalizeBatchResult } from "./local-triage";
import type { BatchAnalysisResult } from "./local-triage";

export type { BatchAnalysisResult };

export const VERIFICATION_METHODOLOGY = `
La IA NO confirma hechos en terreno. Solo hace TRIAJE:
- Filtra spam, bots, pánico infundado y duplicados maliciosos
- Clasifica reportes que parecen genuinos según coherencia interna
- Las brigadas DEBEN confirmar en terreno antes de actuar
`.trim();

/** Máximo de reportes por lote para controlar tokens */
const MAX_REPORTS_PER_BATCH = Number(process.env.MAX_REPORTS_PER_BATCH ?? 50);

export type BatchProcessResult =
  | { status: "processed"; data: BatchAnalysisResult; usedOpenAI: boolean }
  | { status: "no_reports" };

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

async function callOpenAITriage(reports: CitizenReport[]): Promise<BatchAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return localBatchAnalysis(reports);
  }

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
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as Partial<BatchAnalysisResult>;
  return normalizeBatchResult(parsed, reports);
}

export async function processReportBatch(): Promise<BatchProcessResult> {
  const allPending = await getUnprocessedReports();
  const reports = allPending.slice(0, MAX_REPORTS_PER_BATCH);

  if (reports.length === 0) {
    return { status: "no_reports" };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  let analysis: BatchAnalysisResult;
  let usedOpenAI = false;

  if (!apiKey) {
    analysis = localBatchAnalysis(reports);
  } else {
    const guard = await canCallOpenAI();
    if (guard.allowed) {
      try {
        analysis = await callOpenAITriage(reports);
        await recordOpenAICall(reports.length);
        usedOpenAI = true;
      } catch (error) {
        console.error("OpenAI triage failed, using local fallback:", error);
        analysis = localBatchAnalysis(reports);
      }
    } else {
      analysis = localBatchAnalysis(reports);
    }
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
    methodology: usedOpenAI
      ? VERIFICATION_METHODOLOGY
      : `${VERIFICATION_METHODOLOGY}\n\n(Triaje local — OpenAI no disponible o en espera)`,
  });

  return { status: "processed", data: analysis, usedOpenAI };
}

/** Compatibilidad con scripts locales */
export async function processReportBatchLegacy(): Promise<BatchAnalysisResult | null> {
  const result = await processReportBatch();
  if (result.status === "processed") return result.data;
  return null;
}
