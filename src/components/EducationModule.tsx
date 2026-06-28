"use client";

import { useState } from "react";
import { ChevronDown, Shield, Smartphone, Triangle } from "lucide-react";

export default function EducationModule() {
  const [openSection, setOpenSection] = useState<string | null>("alertas");

  const toggle = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <section aria-labelledby="education-heading" className="space-y-3">
      <h2 id="education-heading" className="text-lg font-bold text-white">
        Guía de supervivencia
      </h2>

      <div className="space-y-2">
        <AccordionItem
          id="alertas"
          icon={Smartphone}
          title="Activar Alertas de Terremoto en Android"
          isOpen={openSection === "alertas"}
          onToggle={() => toggle("alertas")}
        >
          <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-300">
            <li>Abre <strong className="text-white">Ajustes</strong> en tu teléfono Android.</li>
            <li>Entra en <strong className="text-white">Seguridad y emergencia</strong> o <strong className="text-white">Ubicación</strong>.</li>
            <li>Busca <strong className="text-white">Alertas de terremotos</strong> (Android Earthquake Alerts System).</li>
            <li>Activa la opción y confirma permisos de ubicación.</li>
          </ol>
          <p className="mt-3 rounded-lg border border-green-800/50 bg-green-900/20 p-3 text-xs text-green-300">
            Este sistema de Google puede avisarte segundos antes de sentir el temblor, usando la red de sensores del teléfono.
          </p>
        </AccordionItem>

        <AccordionItem
          id="triangulo"
          icon={Triangle}
          title="Mito de la Puerta vs. Triángulo de la Vida"
          isOpen={openSection === "triangulo"}
          onToggle={() => toggle("triangulo")}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3">
              <p className="mb-1 text-xs font-bold uppercase text-crisis-alert">
                Mito de la puerta
              </p>
              <p className="text-sm text-gray-300">
                Refugiarse bajo el marco de una puerta <strong className="text-white">no es seguro</strong> en edificios de concreto venezolanos. Los marcos suelen ser débiles y no protegen de escombros laterales.
              </p>
            </div>
            <div className="rounded-lg border border-green-900/50 bg-green-950/30 p-3">
              <p className="mb-1 text-xs font-bold uppercase text-green-400">
                Método recomendado
              </p>
              <p className="text-sm text-gray-300">
                Agáchate junto a <strong className="text-white">muebles sólidos</strong> (camas, escritorios), cubre cabeza y cuello, y mantente lejos de ventanas y paredes exteriores. En espacios abiertos, aléjate de edificios y postes.
              </p>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          id="kit"
          icon={Shield}
          title="Kit básico de emergencia"
          isOpen={openSection === "kit"}
          onToggle={() => toggle("kit")}
        >
          <ul className="grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="text-crisis-alert">•</span> Agua potable (mín. 3 litros/persona)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-crisis-alert">•</span> Documentos en bolsa impermeable
            </li>
            <li className="flex items-start gap-2">
              <span className="text-crisis-alert">•</span> Linterna y baterías
            </li>
            <li className="flex items-start gap-2">
              <span className="text-crisis-alert">•</span> Botiquín de primeros auxilios
            </li>
            <li className="flex items-start gap-2">
              <span className="text-crisis-alert">•</span> Silbato para señalización
            </li>
            <li className="flex items-start gap-2">
              <span className="text-crisis-alert">•</span> Radio a pilas o cargador portátil
            </li>
          </ul>
        </AccordionItem>
      </div>
    </section>
  );
}

function AccordionItem({
  id,
  icon: Icon,
  title,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-crisis-border bg-crisis-surface">
      <button
        type="button"
        id={`accordion-${id}`}
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/5"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-5 w-5 shrink-0 text-crisis-alert" aria-hidden="true" />
          <span className="font-medium text-white">{title}</span>
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
          className="border-t border-crisis-border px-4 pb-4 pt-2"
        >
          {children}
        </div>
      )}
    </div>
  );
}
