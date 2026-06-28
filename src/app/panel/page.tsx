"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

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
}

interface PanelData {
  pendingCount: number;
  legitimateReports: Report[];
  pendingReports: Report[];
  rejectedReports: Report[];
  batches: BatchInfo[];
  lastBatchTime: string | null;
  nextBatchNote: string;
}

type StatusFilter = "verificados" | "pendientes" | "rechazados" | "todos";
type PriorityFilter = "ALL" | "ALTA" | "MEDIA" | "BAJA";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-VE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function normalizePriority(p?: string): string {
  return (p ?? "").toUpperCase();
}

export default function PanelPage() {
  const [data, setData] = useState<PanelData | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("verificados");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/api/batch");
      setData(await res.json());
    };

    loadData();
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, []);

  const allReports = useMemo(() => {
    if (!data) return [];
    const tagged = [
      ...data.legitimateReports.map((r) => ({ ...r, _status: "verificados" as const })),
      ...data.pendingReports.map((r) => ({ ...r, _status: "pendientes" as const })),
      ...data.rejectedReports.map((r) => ({ ...r, _status: "rechazados" as const })),
    ];
    return tagged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allReports.forEach((r) => {
      if (r.categoria) set.add(r.categoria);
    });
    return Array.from(set).sort();
  }, [allReports]);

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allReports.filter((r) => {
      if (statusFilter !== "todos" && r._status !== statusFilter) return false;

      const prio = normalizePriority(r.prioridad);
      if (priorityFilter !== "ALL" && prio !== priorityFilter) return false;

      if (categoryFilter !== "ALL" && r.categoria !== categoryFilter) return false;

      if (q) {
        const haystack = `${r.text} ${r.ubicacion ?? ""} ${r.resumen ?? ""} ${r.categoria ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [allReports, search, statusFilter, priorityFilter, categoryFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("verificados");
    setPriorityFilter("ALL");
    setCategoryFilter("ALL");
  };

  const hasActiveFilters =
    search !== "" ||
    statusFilter !== "verificados" ||
    priorityFilter !== "ALL" ||
    categoryFilter !== "ALL";

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
          <StatCard label="Pendientes" value={data?.pendingCount ?? "—"} icon={Clock} />
          <StatCard
            label="Triaje favorable"
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
          {data?.nextBatchNote ??
            "Los reportes se verifican automáticamente cada hora. Este panel es solo lectura."}
        </p>

        {data?.batches[0] && (
          <section className="rounded-xl border border-crisis-border bg-crisis-surface p-4">
            <h2 className="mb-2 text-base font-semibold text-white sm:text-lg">Último resumen</h2>
            <p className="text-sm leading-relaxed text-gray-300">
              {data.batches[0].resumenGeneral}
            </p>
            <p className="mt-2 text-xs text-crisis-muted">
              {data.batches[0].reportCount} reportes · {data.batches[0].legitimate.length}{" "}
              legítimos · {data.batches[0].falsos.length} filtrados como falsos
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
                <Search
                  className="absolute left-3 h-4 w-4 text-crisis-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por ubicación, texto..."
                  className="w-full rounded-lg border border-crisis-border bg-crisis-bg py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-crisis-muted focus:border-crisis-alert focus:outline-none"
                />
              </span>
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FilterSelect
                label="Estado"
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as StatusFilter)}
                options={[
                  { value: "verificados", label: "Triaje IA favorable" },
                  { value: "pendientes", label: "Pendientes" },
                  { value: "rechazados", label: "Rechazados" },
                  { value: "todos", label: "Todos" },
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
                  ...categories.map((c) => ({ value: c, label: c.replace(/_/g, " ") })),
                ]}
              />
            </div>
          </div>

          <ul className="space-y-3" role="list">
            {filteredReports.map((r) => (
              <li
                key={r.id}
                className={`rounded-xl border bg-crisis-surface p-4 ${
                  r._status === "rechazados"
                    ? "border-red-900/50 opacity-75"
                    : r._status === "pendientes"
                      ? "border-yellow-800/50"
                      : "border-crisis-border"
                }`}
              >
                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                  <StatusBadge status={r._status} />
                  {r.prioridad && (
                    <span
                      className={`rounded px-2 py-0.5 font-bold ${
                        normalizePriority(r.prioridad) === "ALTA"
                          ? "bg-crisis-alert text-white"
                          : "bg-yellow-900/50 text-yellow-300"
                      }`}
                    >
                      {r.prioridad}
                    </span>
                  )}
                  {r.categoria && (
                    <span className="rounded bg-white/10 px-2 py-0.5 text-crisis-muted">
                      {r.categoria.replace(/_/g, " ")}
                    </span>
                  )}
                  <span className="text-crisis-muted">
                    {r.source} · {formatDate(r.createdAt)}
                  </span>
                </div>
                {r.ubicacion && (
                  <p className="mb-1 text-sm text-crisis-alert">📍 {r.ubicacion}</p>
                )}
                <p className="text-sm leading-relaxed text-gray-300">{r.resumen ?? r.text}</p>
                {r.triageReason && (
                  <p className="mt-2 text-xs text-purple-300">
                    Triaje IA: {r.triageReason}
                  </p>
                )}
              </li>
            ))}
            {filteredReports.length === 0 && (
              <p className="text-sm text-crisis-muted">
                No hay reportes con estos filtros. Prueba cambiar la búsqueda o el estado.
              </p>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: "verificados" | "pendientes" | "rechazados" }) {
  const styles = {
    verificados: "bg-purple-900/50 text-purple-200",
    pendientes: "bg-yellow-900/50 text-yellow-300",
    rechazados: "bg-red-900/50 text-red-300",
  };
  const labels = {
    verificados: "Triaje IA — confirmar",
    pendientes: "Pendiente",
    rechazados: "Rechazado",
  };
  return (
    <span className={`rounded px-2 py-0.5 font-bold ${styles[status]}`}>{labels[status]}</span>
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
