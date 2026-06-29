"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, RefreshCw, MapPin } from "lucide-react";
import { PETICION_TIPOS, type PeticionTipo } from "@/lib/peticion-types";

interface PublicPeticion {
  id: string;
  tipo: PeticionTipo;
  tipoLabel: string;
  tipoEmoji: string;
  zona: string;
  resumen: string;
  prioridad?: string;
  estado: string;
  createdAt: string;
}

type FilterTipo = PeticionTipo | "todas";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

export default function PeticionesPage() {
  const [peticiones, setPeticiones] = useState<PublicPeticion[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<FilterTipo>("todas");
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/peticiones");
      const data = await res.json();
      setPeticiones(data.peticiones ?? []);
      setCounts(data.counts ?? {});
      setUpdatedAt(data.updatedAt ?? null);
    } catch {
      setPeticiones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "todas") return peticiones;
    return peticiones.filter((p) => p.tipo === filter);
  }, [peticiones, filter]);

  return (
    <div className="min-h-screen bg-crisis-bg">
      <header className="border-b border-crisis-border px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-crisis-muted hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            Peticiones de ayuda
          </h1>
          <p className="text-sm text-crisis-muted">
            Solicitudes de personas afectadas. Las brigadas las revisan en{" "}
            <Link href="/panel" className="text-crisis-alert hover:underline">
              /panel
            </Link>
            .
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-5 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/?publicar=urgente"
            className="inline-flex items-center gap-2 rounded-xl bg-crisis-alert px-4 py-3 text-sm font-bold text-white hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            Publicar una solicitud
          </Link>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-crisis-border px-3 py-2 text-sm text-crisis-muted hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {updatedAt && (
          <p className="text-xs text-crisis-muted">
            Actualizado {timeAgo(updatedAt)}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "todas"}
            onClick={() => setFilter("todas")}
            label={`Todas (${counts.todas ?? 0})`}
          />
          {PETICION_TIPOS.map((t) => (
            <FilterChip
              key={t.value}
              active={filter === t.value}
              onClick={() => setFilter(t.value)}
              label={`${t.emoji} ${t.label} (${counts[t.value] ?? 0})`}
            />
          ))}
        </div>

        {loading && peticiones.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-crisis-surface" />
            ))}
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {filtered.map((p) => (
              <li
                key={p.id}
                className={`rounded-xl border bg-crisis-surface p-4 ${
                  p.tipo === "atrapados"
                    ? "border-crisis-alert/60"
                    : "border-crisis-border"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded bg-crisis-alert/20 px-2 py-0.5 font-bold text-crisis-alert">
                    {p.tipoEmoji} {p.tipoLabel}
                  </span>
                  {p.prioridad === "ALTA" && (
                    <span className="rounded bg-crisis-alert px-2 py-0.5 font-bold text-white">
                      Urgente
                    </span>
                  )}
                  <span className="rounded bg-white/10 px-2 py-0.5 text-crisis-muted">
                    {p.estado}
                  </span>
                  <span className="text-crisis-muted">{timeAgo(p.createdAt)}</span>
                </div>
                <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-crisis-alert">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {p.zona}
                </p>
                <p className="text-sm leading-relaxed text-gray-300">{p.resumen}</p>
              </li>
            ))}
            {filtered.length === 0 && (
              <p className="rounded-xl border border-dashed border-crisis-border p-6 text-center text-sm text-crisis-muted">
                No hay peticiones en esta categoría.{" "}
                <Link href="/?publicar=1" className="text-crisis-alert hover:underline">
                  Publica la primera
                </Link>
                .
              </p>
            )}
          </ul>
        )}

        <section className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4 text-sm text-blue-200">
          <p className="font-semibold text-blue-100">¿Buscas a alguien desaparecido?</p>
          <p className="mt-1 text-blue-200/90">
            Publica una petición tipo &quot;Buscar persona&quot; o llama al{" "}
            <strong>0800-RESCATE (0800-7372283)</strong>.
          </p>
        </section>
      </main>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
        active
          ? "border-crisis-alert bg-crisis-alert/20 text-white"
          : "border-crisis-border bg-crisis-surface text-crisis-muted hover:border-crisis-alert/50 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
