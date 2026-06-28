"use client";

import { ChevronDown, ArrowRight, Database, Shield, Filter, Sparkles } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const STEPS = [
  {
    icon: Filter,
    color: "text-blue-400",
    title: "1. Filtro instantáneo (tu teléfono)",
    detail:
      "Al enviar, el sitio revisa que el mensaje hable de sismo, ubicación o ayuda. Spam y texto irrelevante se bloquea al instante — no se guarda.",
  },
  {
    icon: Database,
    color: "text-yellow-400",
    title: "2. Se guarda en el servidor",
    detail:
      "Los reportes válidos se almacenan en la base de datos del servidor (Vercel KV en producción). Quedan en cola esperando triaje.",
  },
  {
    icon: Sparkles,
    color: "text-purple-400",
    title: "3. Triaje por IA (cada hora)",
    detail:
      "La IA detecta spam, bots y pánico infundado. NO confirma hechos — solo indica si el reporte parece genuino.",
  },
  {
    icon: Shield,
    color: "text-green-400",
    title: "4. Panel de brigadas (confirmar en terreno)",
    detail:
      "Reportes con triaje favorable aparecen en /panel. Las brigadas deben confirmar antes de actuar.",
  },
];

export default function ReportFlowInfo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-xl border border-crisis-border bg-crisis-surface/60">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="report-flow-panel"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5 sm:py-4"
      >
        <span className="text-sm font-semibold text-white sm:text-base">
          ¿A dónde va mi reporte?
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-crisis-muted transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div id="report-flow-panel" className="border-t border-crisis-border px-4 pb-4 pt-3 sm:px-5">
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-3">
                <step.icon className={`mt-0.5 h-5 w-5 shrink-0 ${step.color}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{step.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-gray-300">{step.detail}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight
                    className="hidden h-4 w-4 shrink-0 text-crisis-muted sm:block"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-crisis-muted">
            WhatsApp abre un chat directo — ese mensaje{" "}
            <strong className="text-gray-300">no pasa por este sistema</strong> hasta que alguien
            lo registre manualmente. El formulario web sí entra al flujo automático.
          </p>

          <Link
            href="/panel"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-crisis-alert hover:underline"
          >
            Ver panel de brigadas
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
