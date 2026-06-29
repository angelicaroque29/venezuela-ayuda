"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Search,
  X,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  BRIGADE_STATUS_LABELS,
  CATEGORY_LABELS,
  enrichReport,
} from "@/lib/report-enrichment";
import { peticionEmoji, peticionLabel, PETICION_TIPOS, type PeticionTipo } from "@/lib/peticion-types";
import type { BrigadeStatus } from "@/lib/report-store";

interface BatchInfo {
  batchId: string;
  processedAt: string;
  reportCount: number;
  legitimate: string[];
  falsos: string[];
  resumenGeneral: string;
}

interface Report {
  id: string;
  text: string;
  ubicacion?: string;
  source: string;
  createdAt: string;
  categoria?: string;
  prioridad?: string;
  resumen?: string;
  triageReason?: string;
  brigadeStatus?: BrigadeStatus;
  brigadeNotes?: string;
  brigadeUpdatedAt?: string;
  zona?: string;
  tipoPeticion?: PeticionTipo;
}

interface PanelData {
  pendingCount: number;
  legitimateReports: Report[];
  pendingReports: Report[];
  rejectedReports: Report[];
  batches: BatchInfo[];
  lastBatchTime: string | null;
}

type TriageFilter = "verificados" | "pendientes" | "rechazados" | "todos";
type BrigadeFilter = BrigadeStatus | "todos";
type PriorityFilter = "ALL" | "ALTA" | "MEDIA" | "BAJA";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-VE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function PanelPage() {
  const [data, setData] = useState<PanelData | null>(null);
  const [search, setSearch] = useState("");
  const [triageFilter, setTriageFilter] = useState<TriageFilter>("todos");
  const [brigadeFilter, setBrigadeFilter] = useState<BrigadeFilter>("todos");
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [tipoFilter, setTipoFilter] = useState<PeticionTipo | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/batch");
    setData(await res.json());
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, [loadData]);

  const allReports = useMemo(() => {
    if (!data) return [];
    const tagged = [
      ...data.legitimateReports.map((r) => ({ ...r, _triage: "verificados" as const })),
      ...data.pendingReports.map((r) => ({ ...r, _triage: "pendientes" as const })),
      ...data.rejectedReports.map((r) => ({ ...r, _triage: "rechazados" as const })),
    ];
    return tagged
      .map((r) => enrichReport({ ...r, brigadeStatus: r.brigadeStatus ?? "nuevo" }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data]);

  const zones = useMemo(() => {
    const set = new Set<string>();
    allReports.forEach((r) => {
      if (r.zona) set.add(r.zona);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [allReports]);

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allReports.filter((r) => {
      if (triageFilter !== "todos" && r._triage !== triageFilter) return false;
      if (brigadeFilter !== "todos" && r.brigadeStatus !== brigadeFilter) return false;
      if (zoneFilter !== "ALL" && r.zona !== zoneFilter) return false;

      const prio = (r.prioridad ?? "BAJA").toUpperCase();
      if (priorityFilter !== "ALL" && prio !== priorityFilter) return false;

      if (categoryFilter !== "ALL" && r.categoria !== categoryFilter) return false;

      const tipo = r.tipoPeticion ?? "otros";
      if (tipoFilter !== "ALL" && tipo !== tipoFilter) return false;

      if (q) {
        const haystack = `${r.text} ${r.ubicacion ?? ""} ${r.zona ?? ""} ${r.resumen ?? ""} ${r.categoria ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [allReports, search, triageFilter, brigadeFilter, zoneFilter, priorityFilter, categoryFilter, tipoFilter]);

  const updateBrigadeStatus = async (reportId: string, brigadeStatus: BrigadeStatus) => {
    setUpdatingId(reportId);
    try {
      const res = await fetch(`/api/report/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brigadeStatus }),
      });
      if (!res.ok) throw new Error("update failed");
      await loadData();
    } catch {
      alert("No se pudo actualizar el estado. Intenta de nuevo.");
    } finally {
      setUpdatingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTriageFilter("todos");
    setBrigadeFilter("todos");
    setZoneFilter("ALL");
    setPriorityFilter("ALL");
    setCategoryFilter("ALL");
    setTipoFilter("ALL");
  };

  const hasActiveFilters =
    search !== "" ||
    triageFilter !== "todos" ||
    brigadeFilter !== "todos" ||
    zoneFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    tipoFilter !== "ALL";

  return (
    <div className="min-h-screen bg-crisis-bg">
      <header className="border-b border-crisis-border px-4 py-4">
        <div className="mx-auto max-w-4xl space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-crisis-muted hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
            <Shield className="h-5 w-5 shrink-0 text-crisis-alert" />
            Panel de Brigadistas
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-5 pb-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Pendientes triaje" value={data?.pendingCount ?? "—"} icon={Clock} />
          <StatCard
            label="Revisados"
            value={data?.legitimateReports.length ?? "—"}
            icon={CheckCircle}
          />
          <StatCard
            label="Último lote"
            value={data?.lastBatchTime ? formatDate(data.lastBatchTime) : "Sin datos"}
            icon={AlertTriangle}
            small
          />
        </div>

        <p className="flex items-start gap-2 rounded-xl border border-crisis-border bg-crisis-surface px-4 py-3 text-sm text-crisis-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
          Actualiza el estado de cada reporte después de verificar en terreno.
        </p>

        {data?.batches[0] && (
          <section className="rounded-xl border border-crisis-border bg-crisis-surface p-4">
            <h2 className="mb-2 text-base font-semibold text-white sm:text-lg">Último resumen</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              {data.batches[0].resumenGeneral}
            </p>
            <p className="mt-2 text-xs text-crisis-muted">
              {data.batches[0].reportCount} reportes · {data.batches[0].legitimate.length}{" "}
              legítimos · {data.batches[0].falsos.length} filtrados
            </p>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Reportes ({filteredReports.length})
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-crisis-alert hover:underline"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-crisis-border bg-crisis-surface p-4">
            <label className="block">
              <span className="sr-only">Buscar reportes</span>
              <span className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-crisis-muted" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por zona, texto, categoría..."
                  className="w-full rounded-lg border border-crisis-border bg-crisis-bg py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-crisis-muted focus:border-crisis-alert focus:outline-none"
                />
              </span>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FilterSelect
                label="Triaje IA"
                value={triageFilter}
                onChange={(v) => setTriageFilter(v as TriageFilter)}
                options={[
                  { value: "todos", label: "Todos" },
                  { value: "pendientes", label: "Pendiente triaje" },
                  { value: "verificados", label: "Revisado IA" },
                  { value: "rechazados", label: "Rechazado IA" },
                ]}
              />
              <FilterSelect
                label="Estado brigada"
                value={brigadeFilter}
                onChange={(v) => setBrigadeFilter(v as BrigadeFilter)}
                options={[
                  { value: "todos", label: "Todos" },
                  ...Object.entries(BRIGADE_STATUS_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
              />
              <FilterSelect
                label="Zona"
                value={zoneFilter}
                onChange={setZoneFilter}
                options={[
                  { value: "ALL", label: "Todas las zonas" },
                  ...zones.map((z) => ({ value: z, label: z })),
                ]}
              />
              <FilterSelect
                label="Prioridad"
                value={priorityFilter}
                onChange={(v) => setPriorityFilter(v as PriorityFilter)}
                options={[
                  { value: "ALL", label: "Todas" },
                  { value: "ALTA", label: "Alta" },
                  { value: "MEDIA", label: "Media" },
                  { value: "BAJA", label: "Baja" },
                ]}
              />
              <FilterSelect
                label="Categoría"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: "ALL", label: "Todas" },
                  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
              />
              <FilterSelect
                label="Tipo petición"
                value={tipoFilter}
                onChange={(v) => setTipoFilter(v as PeticionTipo | "ALL")}
                options={[
                  { value: "ALL", label: "Todos" },
                  ...PETICION_TIPOS.map((t) => ({
                    value: t.value,
                    label: `${t.emoji} ${t.label}`,
                  })),
                ]}
              />
            </div>
          </div>

          <ul className="space-y-3" role="list">
            {filteredReports.map((r) => (
              <li
                key={r.id}
                className={`rounded-xl border bg-crisis-surface p-4 ${
                  r._triage === "rechazados"
                    ? "border-red-900/50 opacity-80"
                    : r._triage === "pendientes"
                      ? "border-yellow-800/50"
                      : r.brigadeStatus === "confirmado"
                        ? "border-green-800/50"
                        : "border-crisis-border"
                }`}
              >
                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                  <TriageBadge status={r._triage} />
                  <BrigadeBadge status={r.brigadeStatus ?? "nuevo"} />
                  {r.tipoPeticion && (
                    <span className="rounded bg-crisis-alert/20 px-2 py-0.5 font-bold text-crisis-alert">
                      {peticionEmoji(r.tipoPeticion)} {peticionLabel(r.tipoPeticion)}
                    </span>
                  )}
                  <span
                    className={`rounded px-2 py-0.5 font-bold ${
                      r.prioridad === "ALTA"
                        ? "bg-crisis-alert text-white"
                        : r.prioridad === "MEDIA"
                          ? "bg-yellow-900/50 text-yellow-300"
                          : "bg-white/10 text-crisis-muted"
                    }`}
                  >
                    {r.prioridad}
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-crisis-muted">
                    {CATEGORY_LABELS[r.categoria ?? ""] ?? r.categoria?.replace(/_/g, " ")}
                  </span>
                  <span className="text-crisis-muted">
                    {r.source} · {formatDate(r.createdAt)}
                  </span>
                </div>

                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-crisis-alert">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {r.zona}
                  {r.ubicacion && r.ubicacion !== r.zona && (
                    <span className="font-normal text-crisis-muted">· {r.ubicacion}</span>
                  )}
                </p>

                <p className="text-sm leading-relaxed text-gray-300">{r.resumen ?? r.text}</p>

                {r.triageReason && (
                  <p className="mt-2 text-xs text-crisis-muted">Triaje: {r.triageReason}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-crisis-border pt-3">
                  <label className="flex flex-1 min-w-[180px] items-center gap-2 text-xs text-crisis-muted">
                    Estado brigada:
                    <select
                      value={r.brigadeStatus ?? "nuevo"}
                      disabled={updatingId === r.id}
                      onChange={(e) =>
                        updateBrigadeStatus(r.id, e.target.value as BrigadeStatus)
                      }
                      className="flex-1 rounded-lg border border-crisis-border bg-crisis-bg px-2 py-1.5 text-sm text-white focus:border-crisis-alert focus:outline-none disabled:opacity-50"
                    >
                      {Object.entries(BRIGADE_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {updatingId === r.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-crisis-muted" />
                  )}
                </div>
              </li>
            ))}
            {filteredReports.length === 0 && (
              <p className="text-sm text-crisis-muted">
                No hay reportes con estos filtros. Prueba otra zona o limpia los filtros.
              </p>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

function TriageBadge({ status }: { status: "verificados" | "pendientes" | "rechazados" }) {
  const styles = {
    verificados: "bg-purple-900/50 text-purple-200",
    pendientes: "bg-yellow-900/50 text-yellow-300",
    rechazados: "bg-red-900/50 text-red-300",
  };
  const labels = {
    verificados: "Revisado IA",
    pendientes: "Pendiente triaje",
    rechazados: "Rechazado IA",
  };
  return (
    <span className={`rounded px-2 py-0.5 font-bold ${styles[status]}`}>{labels[status]}</span>
  );
}

function BrigadeBadge({ status }: { status: BrigadeStatus }) {
  const styles: Record<BrigadeStatus, string> = {
    nuevo: "bg-blue-900/40 text-blue-200",
    en_revision: "bg-orange-900/40 text-orange-200",
    confirmado: "bg-green-900/50 text-green-200",
    descartado: "bg-gray-800 text-gray-400",
  };
  return (
    <span className={`rounded px-2 py-0.5 font-bold ${styles[status]}`}>
      {BRIGADE_STATUS_LABELS[status]}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-crisis-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-crisis-border bg-crisis-bg px-3 py-2.5 text-sm text-white focus:border-crisis-alert focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  small,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-crisis-border bg-crisis-surface p-3 sm:p-4">
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-crisis-alert" />
        <span className="text-xs text-crisis-muted">{label}</span>
      </div>
      <p
        className={`break-words font-bold text-white ${small ? "text-xs sm:text-sm" : "text-xl sm:text-2xl"}`}
      >
        {value}
      </p>
    </div>
  );
}
