"use client";

import { ChevronDown, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";
import { useState } from "react";

const LAYERS = [
  {
    icon: CheckCircle,
    color: "text-blue-400",
    title: "Capa 1 — Filtro local (instantáneo)",
    does: "Bloquea spam, textos cortos y mensajes sin palabras clave de emergencia.",
    doesNot: "No confirma que el reporte sea cierto.",
  },
  {
    icon: Eye,
    color: "text-purple-400",
    title: "Capa 2 — Revisión automática de reportes",
    does: "Analiza reportes ciudadanos para detectar spam, bots y contenido sospechoso.",
    doesNot: "NO verifica hechos en terreno. NO sustituye a Defensa Civil ni medios oficiales.",
  },
  {
    icon: AlertTriangle,
    color: "text-yellow-400",
    title: "Capa 3 — Confirmación humana (obligatoria)",
    does: "Brigadas deben corroborar con fuentes oficiales, llamadas o visita en sitio.",
    doesNot: "Un reporte en el panel NO significa que el daño exista hasta confirmarlo.",
  },
];

export default function VerificationMethodology() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-xl border border-yellow-800/40 bg-yellow-950/20">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="verification-methodology"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5 sm:py-4"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-yellow-200 sm:text-base">
          <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" aria-hidden="true" />
          ¿Cómo se revisan los reportes?
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-yellow-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div id="verification-methodology" className="border-t border-yellow-800/30 px-4 pb-4 pt-3 sm:px-5">
          <p className="mb-4 text-sm leading-relaxed text-yellow-100/90">
            <strong className="text-yellow-100">Importante:</strong> Un reporte aprobado significa
            que <em>parece genuino</em>, no que esté confirmado. Las noticias se filtran por
            palabras clave, sin IA.
          </p>

          <div className="space-y-3">
            {LAYERS.map((layer) => (
              <div
                key={layer.title}
                className="rounded-lg border border-crisis-border bg-crisis-surface/80 p-3"
              >
                <p className="flex items-center gap-2 font-semibold text-white">
                  <layer.icon className={`h-4 w-4 ${layer.color}`} aria-hidden="true" />
                  {layer.title}
                </p>
                <p className="mt-1.5 text-sm text-green-300">
                  <span className="font-medium text-green-200">Sí hace:</span> {layer.does}
                </p>
                <p className="mt-1 text-sm text-red-300">
                  <XCircle className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                  <span className="font-medium text-red-200">No hace:</span> {layer.doesNot}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 rounded-lg border border-crisis-border bg-crisis-bg/60 p-3 text-xs text-crisis-muted">
            Para afirmar que algo es cierto, cruza con: medios oficiales, Defensa Civil, FUNVISIS
            o confirmación directa en el lugar. La IA solo revisa reportes ciudadanos — no estas
            noticias.
          </p>
        </div>
      )}
    </section>
  );
}
