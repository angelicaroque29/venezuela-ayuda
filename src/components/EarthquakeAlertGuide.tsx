"use client";

import { useState } from "react";
import { Smartphone, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";

type PhoneTab = "android" | "iphone";

const ANDROID_STEPS = [
  { step: 1, title: "Abre Ajustes", detail: "Ícono de engranaje ⚙️ en tu Android." },
  {
    step: 2,
    title: "Seguridad y emergencia",
    detail: "Si no aparece: Ajustes → Ubicación → Servicios de ubicación.",
  },
  {
    step: 3,
    title: "Alertas de terremotos",
    detail: "Activa «Alertas de terremotos» o «Earthquake alerts» (sistema de Google).",
  },
  {
    step: 4,
    title: "Permisos",
    detail: "Acepta ubicación y notificaciones para recibir avisos a tiempo.",
  },
];

const IPHONE_STEPS = [
  { step: 1, title: "Abre Ajustes", detail: "Ícono de engranaje ⚙️ en tu iPhone." },
  {
    step: 2,
    title: "Notificaciones",
    detail: "Desplázate hasta el final de la lista.",
  },
  {
    step: 3,
    title: "Alertas gubernamentales",
    detail: "Activa «Alertas de emergencia» y «Alertas de seguridad pública».",
  },
  {
    step: 4,
    title: "Ubicación activa",
    detail: "Ajustes → Privacidad → Localización → Servicios de localización: Activado.",
  },
];

const ANDROID_PATHS = [
  { brand: "Samsung", path: "Seguridad y emergencia → Alertas inalámbricas → Terremotos" },
  { brand: "Xiaomi / Redmi", path: "Contraseñas y seguridad → Emergencia → Terremotos" },
  { brand: "Motorola / Pixel", path: "Seguridad y emergencia → Alertas de terremotos" },
  { brand: "Cualquier Android", path: "Busca «terremoto» en Ajustes 🔍" },
];

const IPHONE_TIPS = [
  {
    title: "App MyShake (recomendada)",
    detail:
      "Descárgala gratis en App Store. Envía alertas sísmicas usando la red de teléfonos.",
  },
  {
    title: "Modo No molestar",
    detail:
      "Las alertas de emergencia suenan aunque tengas el silencio activado. No las bloquees.",
  },
  {
    title: "Actualiza iOS",
    detail: "Ve a Ajustes → General → Actualización de software para tener las últimas alertas.",
  },
];

export default function EarthquakeAlertGuide({ compact = false }: { compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<PhoneTab>("android");

  const header = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/20">
        <Smartphone className="h-6 w-6 text-green-400" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-base font-bold text-white">
          Activa alertas de terremoto en tu teléfono
        </span>
        <span className="text-sm text-green-200">
          Android o iPhone · Gratis · Te avisa antes del temblor
        </span>
      </span>
    </>
  );

  const content = (
    <div className="space-y-4">
      <div className="flex gap-2">
        <TabButton active={tab === "android"} onClick={() => setTab("android")}>
          Android
        </TabButton>
        <TabButton active={tab === "iphone"} onClick={() => setTab("iphone")}>
          iPhone
        </TabButton>
      </div>

      {tab === "android" ? <AndroidContent /> : <IphoneContent />}
    </div>
  );

  if (compact) {
    return (
      <section
        aria-labelledby="alert-guide-compact"
        className="rounded-2xl border-2 border-green-600/50 bg-green-950/30 p-3 sm:p-4"
      >
        <button
          type="button"
          id="alert-guide-compact"
          aria-expanded={expanded}
          aria-controls="alert-guide-panel"
          onClick={() => setExpanded((p) => !p)}
          className="flex w-full items-center justify-between gap-2 text-left sm:gap-3"
        >
          <span className="flex items-center gap-3">{header}</span>
          <ChevronDown
            className={`h-6 w-6 shrink-0 text-green-300 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        {expanded && (
          <div id="alert-guide-panel" className="mt-4">
            {content}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border-2 border-green-600/50 bg-green-950/30 p-5">
      <div className="mb-4 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-500/20">
          <Smartphone className="h-7 w-7 text-green-400" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Activa alertas de terremoto
          </h2>
          <p className="mt-1 text-sm text-green-200">Android e iPhone</p>
        </div>
      </div>
      {content}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${
        active
          ? "bg-green-500 text-white"
          : "border border-green-800/50 bg-crisis-surface text-green-200 hover:bg-green-900/30"
      }`}
    >
      {children}
    </button>
  );
}

function StepGrid({ steps }: { steps: typeof ANDROID_STEPS }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {steps.map((s) => (
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
  );
}

function AndroidContent() {
  return (
    <div className="space-y-4">
      <StepGrid steps={ANDROID_STEPS} />
      <div>
        <p className="mb-2 text-sm font-semibold text-green-300">Rutas por marca:</p>
        <ul className="space-y-2" role="list">
          {ANDROID_PATHS.map((item) => (
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
      <NoticeBox
        type="ok"
        text="Requisitos: Android 5+, Google Play Services, ubicación activada."
      />
    </div>
  );
}

function IphoneContent() {
  return (
    <div className="space-y-4">
      <StepGrid steps={IPHONE_STEPS} />
      <div>
        <p className="mb-2 text-sm font-semibold text-green-300">Consejos extra para iPhone:</p>
        <ul className="space-y-2" role="list">
          {IPHONE_TIPS.map((tip) => (
            <li
              key={tip.title}
              className="rounded-lg border border-crisis-border bg-crisis-bg/60 px-3 py-2 text-sm"
            >
              <span className="font-semibold text-white">{tip.title}:</span>{" "}
              <span className="text-gray-300">{tip.detail}</span>
            </li>
          ))}
        </ul>
      </div>
      <NoticeBox
        type="warn"
        text="En iPhone las alertas oficiales dependen de tu operador y región. MyShake complementa las alertas del sistema."
      />
    </div>
  );
}

function NoticeBox({ type, text }: { type: "ok" | "warn"; text: string }) {
  const Icon = type === "ok" ? CheckCircle : AlertCircle;
  const styles =
    type === "ok"
      ? "border-green-700/50 bg-green-900/30 text-green-200"
      : "border-yellow-700/50 bg-yellow-900/20 text-yellow-200";

  return (
    <p className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${styles}`}>
      <Icon
        className={`mt-0.5 h-5 w-5 shrink-0 ${type === "ok" ? "text-green-400" : "text-yellow-400"}`}
        aria-hidden="true"
      />
      {text}
    </p>
  );
}
