import type { BrigadeStatus } from "./report-store";

export const CATEGORY_LABELS: Record<string, string> = {
  DAÑO_ESTRUCTURAL: "Daño estructural",
  HERIDOS_RESCATE: "Heridos / rescate",
  NECESIDADES: "Necesidades básicas",
  REPORTE_INFORMATIVO: "Reporte informativo",
};

export const BRIGADE_STATUS_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  en_revision: "En revisión",
  confirmado: "Confirmado en terreno",
  descartado: "Descartado",
};

const HIGH_PRIORITY = [
  "herid",
  "atrapad",
  "rescate",
  "urgent",
  "colaps",
  "derrumb",
  "sin vida",
  "ambulancia",
  "sangre",
];

const MEDIUM_PRIORITY = [
  "daño",
  "daños",
  "grieta",
  "necesit",
  "refugio",
  "evacu",
  "agua",
  "medic",
  "aliment",
];

const CATEGORY_RULES: Array<{ key: string; terms: string[] }> = [
  { key: "HERIDOS_RESCATE", terms: ["herid", "atrapad", "rescate", "ambulancia", "sin vida"] },
  { key: "DAÑO_ESTRUCTURAL", terms: ["edificio", "grieta", "colaps", "derrumb", "estructural"] },
  { key: "NECESIDADES", terms: ["agua", "comida", "medic", "manta", "refugio", "aliment"] },
];

const ZONE_ALIASES: Array<{ key: string; terms: string[] }> = [
  { key: "Caracas", terms: ["caracas", "chacao", "petare", "catia", "libertador"] },
  { key: "La Guaira", terms: ["guaira", "guaire", "vargas", "maiquetia", "macuto"] },
  { key: "Miranda", terms: ["miranda", "los teques", "guarenas", "guatire"] },
  { key: "Valencia", terms: ["valencia", "carabobo"] },
  { key: "Maracaibo", terms: ["maracaibo", "zulia"] },
  { key: "Maracay", terms: ["maracay", "aragua"] },
];

export function inferPriority(report: {
  text: string;
  ubicacion?: string;
  prioridad?: string;
}): string {
  if (report.prioridad) return report.prioridad.toUpperCase();

  const text = `${report.text} ${report.ubicacion ?? ""}`.toLowerCase();
  if (HIGH_PRIORITY.some((t) => text.includes(t))) return "ALTA";
  if (MEDIUM_PRIORITY.some((t) => text.includes(t))) return "MEDIA";
  return "BAJA";
}

export function inferCategory(report: {
  text: string;
  ubicacion?: string;
  categoria?: string;
}): string {
  if (report.categoria) return report.categoria;

  const text = `${report.text} ${report.ubicacion ?? ""}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.terms.some((t) => text.includes(t))) return rule.key;
  }
  return "REPORTE_INFORMATIVO";
}

export function normalizeZone(ubicacion?: string): string {
  if (!ubicacion?.trim()) return "Sin zona";

  const lower = ubicacion.toLowerCase();
  for (const zone of ZONE_ALIASES) {
    if (zone.terms.some((t) => lower.includes(t))) return zone.key;
  }

  const first = ubicacion.split(",")[0]?.trim();
  if (!first) return "Sin zona";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function enrichReport<
  T extends {
    text: string;
    ubicacion?: string;
    prioridad?: string;
    categoria?: string;
    brigadeStatus?: BrigadeStatus;
  },
>(report: T) {
  return {
    ...report,
    prioridad: inferPriority(report),
    categoria: inferCategory(report),
    zona: normalizeZone(report.ubicacion),
    brigadeStatus: report.brigadeStatus ?? "nuevo",
  };
}
