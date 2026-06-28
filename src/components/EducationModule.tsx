"use client";

import { useState } from "react";
import { ChevronDown, Shield, Smartphone, Triangle, BookOpen } from "lucide-react";

export default function EducationModule() {
  const [openSection, setOpenSection] = useState<string | null>("alertas");

  const toggle = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <section aria-labelledby="education-heading" className="space-y-3">
      <div>
        <h2
          id="education-heading"
          className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl"
        >
          <BookOpen className="h-6 w-6 text-green-400" aria-hidden="true" />
          Guías de supervivencia
        </h2>
        <p className="mt-1 text-sm text-crisis-muted">
          Pasos simples para protegerte y a tu familia
        </p>
      </div>

      <div className="space-y-2">
        <AccordionItem
          id="alertas"
          icon={Smartphone}
          iconColor="text-green-400"
          borderColor="border-green-800/50"
          title="Activar alertas de terremoto (Android e iPhone)"
          isOpen={openSection === "alertas"}
          onToggle={() => toggle("alertas")}
        >
          <div className="space-y-4">
            <p className="text-base text-gray-200">
              Activa las alertas en tu teléfono. Arriba en la página hay una guía completa con
              pestañas para <strong className="text-white">Android</strong> e{" "}
              <strong className="text-white">iPhone</strong>.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border-2 border-green-700/50 bg-green-950/30 p-3">
                <p className="mb-2 text-sm font-bold text-green-400">Android</p>
                <ol className="list-decimal space-y-1.5 pl-4 text-sm text-gray-200">
                  <li>Ajustes → Seguridad y emergencia</li>
                  <li>Alertas de terremotos → Activar</li>
                </ol>
              </div>
              <div className="rounded-lg border-2 border-blue-700/50 bg-blue-950/30 p-3">
                <p className="mb-2 text-sm font-bold text-blue-400">iPhone</p>
                <ol className="list-decimal space-y-1.5 pl-4 text-sm text-gray-200">
                  <li>Ajustes → Notificaciones</li>
                  <li>Alertas gubernamentales → Activar emergencia</li>
                  <li>App Store: instala <strong className="text-white">MyShake</strong></li>
                </ol>
              </div>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          id="triangulo"
          icon={Triangle}
          iconColor="text-yellow-400"
          borderColor="border-yellow-800/50"
          title="¿Dónde protegerme durante un sismo?"
          isOpen={openSection === "triangulo"}
          onToggle={() => toggle("triangulo")}
        >
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-red-800/60 bg-red-950/40 p-4">
              <p className="mb-1 flex items-center gap-2 text-sm font-bold uppercase text-crisis-alert">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-crisis-alert text-xs text-white">
                  ✕
                </span>
                No hagas esto
              </p>
              <p className="text-base leading-relaxed text-gray-200">
                <strong className="text-white">No te refugies bajo la puerta.</strong> En
                edificios de concreto en Venezuela, el marco de la puerta no es seguro.
              </p>
            </div>
            <div className="rounded-lg border-2 border-green-700/60 bg-green-950/40 p-4">
              <p className="mb-1 flex items-center gap-2 text-sm font-bold uppercase text-green-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                  ✓
                </span>
                Haz esto
              </p>
              <p className="text-base leading-relaxed text-gray-200">
                Agáchate junto a <strong className="text-white">muebles fuertes</strong>{" "}
                (cama, escritorio). Cubre tu cabeza y cuello. Aléjate de ventanas.
              </p>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          id="kit"
          icon={Shield}
          iconColor="text-blue-400"
          borderColor="border-blue-800/50"
          title="Qué llevar en tu kit de emergencia"
          isOpen={openSection === "kit"}
          onToggle={() => toggle("kit")}
        >
          <ul className="space-y-2.5 text-base text-gray-200">
            {[
              "Agua potable (3 litros por persona)",
              "Documentos en bolsa impermeable",
              "Linterna y pilas",
              "Botiquín de primeros auxilios",
              "Silbato para pedir ayuda",
              "Cargador portátil o radio",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/30 text-xs font-bold text-blue-300">
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </AccordionItem>
      </div>
    </section>
  );
}

function AccordionItem({
  id,
  icon: Icon,
  iconColor,
  borderColor,
  title,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  borderColor: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border-2 ${borderColor} bg-crisis-surface`}>
      <button
        type="button"
        id={`accordion-${id}`}
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/5"
      >
        <span className="flex items-center gap-3">
          <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} aria-hidden="true" />
          <span className="text-base font-semibold text-white">{title}</span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-crisis-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div
          id={`panel-${id}`}
          role="region"
          aria-labelledby={`accordion-${id}`}
          className="border-t border-crisis-border px-4 pb-4 pt-3"
        >
          {children}
        </div>
      )}
    </div>
  );
}
