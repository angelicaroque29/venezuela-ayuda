"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface BatchInfo {
  batchId: string;
  processedAt: string;
  reportCount: number;
  legitimate: string[];
  falsos: string[];
  resumenGeneral: string;
}

interface LegitimateReport {
  id: string;
  text: string;
  ubicacion?: string;
  source: string;
  createdAt: string;
  categoria?: string;
  prioridad?: string;
  resumen?: string;
}

interface PanelData {
  pendingCount: number;
  legitimateReports: LegitimateReport[];
  batches: BatchInfo[];
  lastBatchTime: string | null;
  nextBatchNote: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-VE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function PanelPage() {
  const [data, setData] = useState<PanelData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/api/batch");
      setData(await res.json());
    };

    loadData();
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, []);

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
          <StatCard
            label="Pendientes"
            value={data?.pendingCount ?? "—"}
            icon={Clock}
          />
          <StatCard
            label="Verificados"
            value={data?.legitimateReports.length ?? "—"}
            icon={CheckCircle}
          />
          <StatCard
            label="Último lote"
            value={
              data?.lastBatchTime ? formatDate(data.lastBatchTime) : "Sin datos"
            }
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
            <h2 className="mb-2 text-base font-semibold text-white sm:text-lg">
              Último resumen
            </h2>
            <p className="text-sm leading-relaxed text-gray-300">
              {data.batches[0].resumenGeneral}
            </p>
            <p className="mt-2 text-xs text-crisis-muted">
              {data.batches[0].reportCount} reportes ·{" "}
              {data.batches[0].legitimate.length} legítimos ·{" "}
              {data.batches[0].falsos.length} filtrados
            </p>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-base font-semibold text-white sm:text-lg">
            Reportes verificados
          </h2>
          <ul className="space-y-3" role="list">
            {(data?.legitimateReports ?? []).map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-crisis-border bg-crisis-surface p-4"
              >
                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                  {r.prioridad && (
                    <span
                      className={`rounded px-2 py-0.5 font-bold ${
                        r.prioridad === "ALTA"
                          ? "bg-crisis-alert text-white"
                          : "bg-yellow-900/50 text-yellow-300"
                      }`}
                    >
                      {r.prioridad}
                    </span>
                  )}
                  {r.categoria && (
                    <span className="rounded bg-white/10 px-2 py-0.5 text-crisis-muted">
                      {r.categoria}
                    </span>
                  )}
                  <span className="text-crisis-muted">
                    {r.source} · {formatDate(r.createdAt)}
                  </span>
                </div>
                {r.ubicacion && (
                  <p className="mb-1 text-sm text-crisis-alert">📍 {r.ubicacion}</p>
                )}
                <p className="text-sm leading-relaxed text-gray-300">
                  {r.resumen ?? r.text}
                </p>
              </li>
            ))}
            {data?.legitimateReports.length === 0 && (
              <p className="text-sm text-crisis-muted">
                Aún no hay reportes verificados. Se actualizarán en el próximo ciclo
                automático.
              </p>
            )}
          </ul>
        </section>
      </main>
    </div>
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
