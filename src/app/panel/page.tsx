"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Shield, AlertTriangle, CheckCircle } from "lucide-react";

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
  const [processing, setProcessing] = useState(false);

  const loadData = async () => {
    const res = await fetch("/api/batch");
    setData(await res.json());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, []);

  const runBatchNow = async () => {
    setProcessing(true);
    try {
      await fetch("/api/batch", { method: "POST" });
      await loadData();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-crisis-bg">
      <header className="border-b border-crisis-border px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-crisis-muted hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="flex items-center gap-2 font-bold text-white">
            <Shield className="h-5 w-5 text-crisis-alert" />
            Panel de Brigadistas
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Pendientes de IA"
            value={data?.pendingCount ?? "—"}
            icon={Clock}
          />
          <StatCard
            label="Reportes legítimos"
            value={data?.legitimateReports.length ?? "—"}
            icon={CheckCircle}
          />
          <StatCard
            label="Último lote"
            value={
              data?.lastBatchTime ? formatDate(data.lastBatchTime) : "Sin procesar"
            }
            icon={AlertTriangle}
            small
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={runBatchNow}
            disabled={processing}
            className="rounded-xl bg-crisis-alert px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {processing ? "Procesando lote..." : "Ejecutar lote ahora"}
          </button>
          <p className="text-xs text-crisis-muted">{data?.nextBatchNote}</p>
        </div>

        {data?.batches[0] && (
          <section className="rounded-xl border border-crisis-border bg-crisis-surface p-4">
            <h2 className="mb-2 font-semibold text-white">Último resumen de lote</h2>
            <p className="text-sm text-gray-300">{data.batches[0].resumenGeneral}</p>
            <p className="mt-2 text-xs text-crisis-muted">
              {data.batches[0].reportCount} reportes ·{" "}
              {data.batches[0].legitimate.length} legítimos ·{" "}
              {data.batches[0].falsos.length} falsos
            </p>
          </section>
        )}

        <section>
          <h2 className="mb-3 font-semibold text-white">Reportes verificados</h2>
          <ul className="space-y-2" role="list">
            {(data?.legitimateReports ?? []).map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-crisis-border bg-crisis-surface p-3"
              >
                <div className="mb-1 flex flex-wrap gap-2 text-xs">
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
                  <p className="text-xs text-crisis-alert">📍 {r.ubicacion}</p>
                )}
                <p className="text-sm text-gray-300">{r.resumen ?? r.text}</p>
              </li>
            ))}
            {data?.legitimateReports.length === 0 && (
              <p className="text-sm text-crisis-muted">
                Aún no hay reportes verificados. Se actualizarán tras el próximo lote horario.
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
    <div className="rounded-xl border border-crisis-border bg-crisis-surface p-4">
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4 text-crisis-alert" />
        <span className="text-xs text-crisis-muted">{label}</span>
      </div>
      <p className={`font-bold text-white ${small ? "text-sm" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
