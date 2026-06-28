import {
  getStorageItem,
  setStorageItem,
} from "./storage";

export type ReportSource = "web" | "telegram" | "whatsapp";

/** triage_ia = pasó filtro IA, NO confirmado en terreno */
export type VerificationLevel = "pendiente" | "triage_ia" | "rechazado";

export interface CitizenReport {
  id: string;
  text: string;
  ubicacion?: string;
  source: ReportSource;
  createdAt: string;
  processed: boolean;
  legitimate?: boolean;
  verificationLevel: VerificationLevel;
  categoria?: string;
  prioridad?: string;
  resumen?: string;
  triageReason?: string;
}

export interface BatchResult {
  batchId: string;
  processedAt: string;
  reportCount: number;
  legitimate: string[];
  falsos: string[];
  resumenGeneral: string;
  methodology: string;
}

const REPORTS_KEY = "reports";
const BATCH_KEY = "batch-results";

export async function getAllReports(): Promise<CitizenReport[]> {
  const reports = await getStorageItem<CitizenReport[]>(REPORTS_KEY, []);
  return reports.map((r) => ({
    ...r,
    verificationLevel:
      r.verificationLevel ??
      (r.processed ? (r.legitimate ? "triage_ia" : "rechazado") : "pendiente"),
  }));
}

export async function getUnprocessedReports(since?: Date): Promise<CitizenReport[]> {
  const reports = (await getAllReports()).filter((r) => !r.processed);
  if (!since) return reports;
  return reports.filter((r) => new Date(r.createdAt) >= since);
}

export async function addReport(
  text: string,
  source: ReportSource,
  ubicacion?: string
): Promise<CitizenReport> {
  const reports = await getAllReports();
  const report: CitizenReport = {
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text: text.trim(),
    ubicacion,
    source,
    createdAt: new Date().toISOString(),
    processed: false,
    verificationLevel: "pendiente",
  };
  reports.push(report);
  await setStorageItem(REPORTS_KEY, reports);
  return report;
}

export async function updateReportsAfterBatch(
  legitimate: string[],
  falsos: string[],
  metadata: Map<
    string,
    { categoria?: string; prioridad?: string; resumen?: string; triageReason?: string }
  >
) {
  const reports = await getAllReports();
  const legitSet = new Set(legitimate);
  const falseSet = new Set(falsos);

  for (const report of reports) {
    if (legitSet.has(report.id) || falseSet.has(report.id)) {
      report.processed = true;
      report.legitimate = legitSet.has(report.id);
      report.verificationLevel = legitSet.has(report.id) ? "triage_ia" : "rechazado";
      const meta = metadata.get(report.id);
      if (meta) {
        report.categoria = meta.categoria;
        report.prioridad = meta.prioridad;
        report.resumen = meta.resumen;
        report.triageReason = meta.triageReason;
      }
    }
  }

  await setStorageItem(REPORTS_KEY, reports);
}

export async function getBatchResults(): Promise<BatchResult[]> {
  return getStorageItem<BatchResult[]>(BATCH_KEY, []);
}

export async function saveBatchResult(result: BatchResult) {
  const results = await getBatchResults();
  results.unshift(result);
  await setStorageItem(BATCH_KEY, results.slice(0, 48));
}

export async function getLegitimateReports(): Promise<CitizenReport[]> {
  return (await getAllReports()).filter((r) => r.processed && r.legitimate);
}

export async function getPendingReportsList(): Promise<CitizenReport[]> {
  return (await getAllReports()).filter((r) => !r.processed);
}

export async function getRejectedReports(): Promise<CitizenReport[]> {
  return (await getAllReports()).filter((r) => r.processed && r.legitimate === false);
}

export async function getLastBatchTime(): Promise<string | null> {
  const results = await getBatchResults();
  return results[0]?.processedAt ?? null;
}
