"use client";

import { useState } from "react";
import { Smartphone, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";

const MAIN_STEPS = [
  {
    step: 1,
    title: "Abre Ajustes",
    detail: "Busca el ícono de engranaje ⚙️ en tu teléfono Android.",
  },
  {
    step: 2,
    title: "Entra en Seguridad y emergencia",
    detail:
      "Si no lo ves, prueba Ubicación → Servicios de ubicación. En algunos teléfonos está dentro de Google.",
  },
  {
    step: 3,
    title: "Activa Alertas de terremotos",
    detail:
      "Busca «Alertas de terremotos» o «Earthquake alerts» (Sistema de alertas sísmicas de Android).",
  },
  {
    step: 4,
    title: "Acepta los permisos",
    detail:
      "Permite ubicación y notificaciones. Sin esto, el teléfono no puede avisarte a tiempo.",
  },
];

const ALTERNATIVE_PATHS = [
  {
    brand: "Google Pixel / Android puro",
    path: "Ajustes → Seguridad y emergencia → Alertas de terremotos",
  },
  {
    brand: "Samsung",
    path: "Ajustes → Seguridad y emergencia → Alertas inalámbricas → Alertas de terremotos",
  },
  {
    brand: "Xiaomi / Redmi / POCO",
    path: "Ajustes → Contraseñas y seguridad → Emergencia → Alertas de terremotos",
  },
  {
    brand: "Motorola",
    path: "Ajustes → Ubicación → Servicios de ubicación → Alertas de terremotos",
  },
  {
    brand: "Cualquier Android",
    path: "Abre Ajustes y usa el buscador 🔍 escribiendo «terremoto» o «earthquake»",
  },
];

export default function AndroidAlertGuide({ compact = false }: { compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <section
        aria-labelledby="android-alert-compact"
        className="rounded-2xl border-2 border-green-600/50 bg-green-950/30 p-3 sm:p-4"
      >
        <button
          type="button"
          id="android-alert-compact"
          aria-expanded={expanded}
          aria-controls="android-alert-panel"
          onClick={() => setExpanded((p) => !p)}
          className="flex w-full items-center justify-between gap-2 text-left sm:gap-3"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/20">
              <Smartphone className="h-6 w-6 text-green-400" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-bold text-white">
                Activa alertas de terremoto en tu Android
              </span>
              <span className="text-sm text-green-200">
                Gratis · Te avisa segundos antes del temblor
              </span>
            </span>
          </span>
          <ChevronDown
            className={`h-6 w-6 shrink-0 text-green-300 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        {expanded && (
          <div id="android-alert-panel" className="mt-4">
            <AndroidAlertContent />
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      aria-labelledby="android-alert-heading"
      className="rounded-2xl border-2 border-green-600/50 bg-green-950/30 p-5"
    >
      <div className="mb-4 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-500/20">
          <Smartphone className="h-7 w-7 text-green-400" aria-hidden="true" />
        </span>
        <div>
          <h2 id="android-alert-heading" className="text-lg font-bold text-white sm:text-xl">
            Activa alertas de terremoto en Android
          </h2>
          <p className="mt-1 text-sm text-green-200">
            Sistema gratuito de Google · Funciona sin internet en muchos casos
          </p>
        </div>
      </div>
      <AndroidAlertContent />
    </section>
  );
}

function AndroidAlertContent() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {MAIN_STEPS.map((s) => (
          <div
            key={s.step}
            className="flex gap-3 rounded-xl border border-green-800/40 bg-crisis-surface/80 p-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
              {s.step}
            </span>
            <div>
              <p className="font-semibold text-white">{s.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-gray-300">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-green-300">
          ¿No encuentras la opción? Prueba según tu marca:
        </p>
        <ul className="space-y-2" role="list">
          {ALTERNATIVE_PATHS.map((item) => (
            <li
              key={item.brand}
              className="rounded-lg border border-crisis-border bg-crisis-bg/60 px-3 py-2 text-sm"
            >
              <span className="font-semibold text-white">{item.brand}:</span>{" "}
              <span className="text-gray-300">{item.path}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <p className="flex items-start gap-2 rounded-lg border border-green-700/50 bg-green-900/30 p-3 text-sm text-green-200">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-400" aria-hidden="true" />
          <span>
            <strong className="text-green-100">Requisitos:</strong> Android 5 o superior,
            Google Play Services actualizado, y ubicación activada.
          </span>
        </p>
        <p className="flex items-start gap-2 rounded-lg border border-yellow-700/50 bg-yellow-900/20 p-3 text-sm text-yellow-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" aria-hidden="true" />
          <span>
            <strong className="text-yellow-100">Importante:</strong> No sustituye las alertas
            oficiales del gobierno. Actívalo en todos los teléfonos de tu familia.
          </span>
        </p>
      </div>
    </div>
  );
}
