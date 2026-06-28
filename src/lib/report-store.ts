import fs from "fs";
import path from "path";

export type ReportSource = "web" | "telegram" | "whatsapp";

export interface CitizenReport {
  id: string;
  text: string;
  ubicacion?: string;
  source: ReportSource;
  createdAt: string;
  processed: boolean;
  legitimate?: boolean;
  categoria?: string;
  prioridad?: string;
  resumen?: string;
}

export interface BatchResult {
  batchId: string;
  processedAt: string;
  reportCount: number;
  legitimate: string[];
  falsos: string[];
  resumenGeneral: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");
const BATCH_FILE = path.join(DATA_DIR, "batch-results.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(file: string, fallback: T): T {
  ensureDataDir();
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(file: string, data: T) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

export function getAllReports(): CitizenReport[] {
  return readJson<CitizenReport[]>(REPORTS_FILE, []);
}

export function getUnprocessedReports(since?: Date): CitizenReport[] {
  const reports = getAllReports().filter((r) => !r.processed);
  if (!since) return reports;
  return reports.filter((r) => new Date(r.createdAt) >= since);
}

export function addReport(
  text: string,
  source: ReportSource,
  ubicacion?: string
): CitizenReport {
  const reports = getAllReports();
  const report: CitizenReport = {
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text: text.trim(),
    ubicacion,
    source,
    createdAt: new Date().toISOString(),
    processed: false,
  };
  reports.push(report);
  writeJson(REPORTS_FILE, reports);
  return report;
}

export function updateReportsAfterBatch(
  legitimate: string[],
  falsos: string[],
  metadata: Map<string, { categoria?: string; prioridad?: string; resumen?: string }>
) {
  const reports = getAllReports();
  const legitSet = new Set(legitimate);
  const falseSet = new Set(falsos);

  for (const report of reports) {
    if (legitSet.has(report.id) || falseSet.has(report.id)) {
      report.processed = true;
      report.legitimate = legitSet.has(report.id);
      const meta = metadata.get(report.id);
      if (meta) {
        report.categoria = meta.categoria;
        report.prioridad = meta.prioridad;
        report.resumen = meta.resumen;
      }
    }
  }

  writeJson(REPORTS_FILE, reports);
}

export function getBatchResults(): BatchResult[] {
  return readJson<BatchResult[]>(BATCH_FILE, []);
}

export function saveBatchResult(result: BatchResult) {
  const results = getBatchResults();
  results.unshift(result);
  writeJson(BATCH_FILE, results.slice(0, 48));
}

export function getLegitimateReports(): CitizenReport[] {
  return getAllReports().filter((r) => r.processed && r.legitimate);
}

export function getPendingReportsList(): CitizenReport[] {
  return getAllReports().filter((r) => !r.processed);
}

export function getRejectedReports(): CitizenReport[] {
  return getAllReports().filter((r) => r.processed && r.legitimate === false);
}

export function getLastBatchTime(): string | null {
  const results = getBatchResults();
  return results[0]?.processedAt ?? null;
}
