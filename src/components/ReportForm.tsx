"use client";

import { useState } from "react";
import {
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Megaphone,
} from "lucide-react";
import { validateReportLocally } from "@/lib/validate-report";
import {
  PETICION_TIPOS,
  type PeticionTipo,
} from "@/lib/peticion-types";

interface ReportFormProps {
  defaultOpen?: boolean;
  prominent?: boolean;
  defaultTipo?: PeticionTipo;
}

export default function ReportForm({
  defaultOpen = false,
  prominent = false,
  defaultTipo = "otros",
}: ReportFormProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || !prominent);
  const [tipoPeticion, setTipoPeticion] = useState<PeticionTipo>(defaultTipo);
  const [text, setText] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const validation = validateReportLocally(
      ubicacion ? `${ubicacion}. ${text}` : text
    );

    if (!validation.valid) {
      setStatus("error");
      setMessage(validation.reason ?? "Reporte no válido.");
      return;
    }

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, ubicacion, source: "web", tipoPeticion }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Error al enviar.");
        return;
      }

      setStatus("success");
      setMessage(data.message);
      setText("");
      setUbicacion("");
    } catch {
      setStatus("error");
      setMessage("Sin conexión. Intenta de nuevo en unos minutos.");
    }
  };

  if (prominent) {
    return (
      <section aria-labelledby="report-heading" className="space-y-0">
        <button
          type="button"
          id="report-heading"
          aria-expanded={isOpen}
          aria-controls="report-panel"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-crisis-alert bg-crisis-alert/20 px-4 py-4 text-left shadow-lg shadow-crisis-alert/10 transition-all hover:bg-crisis-alert/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-crisis-alert sm:gap-4 sm:px-5 sm:py-5"
        >
          <span className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crisis-alert text-white sm:h-14 sm:w-14">
              <Megaphone className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-bold leading-tight text-white sm:text-xl">
                {defaultTipo === "atrapados"
                  ? "🆘 Estoy atrapado / necesito ayuda urgente"
                  : "¿Necesitas ayuda? Publica tu solicitud"}
              </span>
              <span className="mt-0.5 block text-xs text-red-100 sm:text-sm">
                Toca para abrir · Visible para brigadas y en /peticiones
              </span>
            </span>
          </span>
          <ChevronDown
            className={`h-6 w-6 shrink-0 text-white transition-transform sm:h-7 sm:w-7 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div id="report-panel" className="mt-4">
            <ReportFormContent
              tipoPeticion={tipoPeticion}
              setTipoPeticion={setTipoPeticion}
              text={text}
              setText={setText}
              ubicacion={ubicacion}
              setUbicacion={setUbicacion}
              status={status}
              message={message}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </section>
    );
  }

  return (
    <section aria-labelledby="report-heading-inline" className="space-y-4">
      <h2 id="report-heading-inline" className="text-lg font-bold text-white">
        Publicar petición
      </h2>
      <ReportFormContent
        tipoPeticion={tipoPeticion}
        setTipoPeticion={setTipoPeticion}
        text={text}
        setText={setText}
        ubicacion={ubicacion}
        setUbicacion={setUbicacion}
        status={status}
        message={message}
        onSubmit={handleSubmit}
      />
    </section>
  );
}

function ReportFormContent({
  tipoPeticion,
  setTipoPeticion,
  text,
  setText,
  ubicacion,
  setUbicacion,
  status,
  message,
  onSubmit,
}: {
  tipoPeticion: PeticionTipo;
  setTipoPeticion: (v: PeticionTipo) => void;
  text: string;
  setText: (v: string) => void;
  ubicacion: string;
  setUbicacion: (v: string) => void;
  status: "idle" | "loading" | "success" | "error";
  message: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border-2 border-crisis-border bg-crisis-surface p-4 sm:p-5"
    >
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-white">
          Tipo de solicitud
        </legend>
        <div className="flex flex-wrap gap-2">
          {PETICION_TIPOS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTipoPeticion(t.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                tipoPeticion === t.value
                  ? "border-crisis-alert bg-crisis-alert/20 text-white"
                  : "border-crisis-border bg-crisis-bg text-crisis-muted hover:border-crisis-alert/50"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1.5 flex items-center gap-2 text-base font-medium text-white">
          <MapPin className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          ¿Dónde estás? (ciudad, sector, estado)
        </span>
        <input
          type="text"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          placeholder="Ej: Caracas, Chacao, Miranda"
          className="w-full rounded-lg border-2 border-crisis-border bg-crisis-bg px-4 py-3 text-base text-white placeholder:text-crisis-muted focus:border-yellow-400 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-base font-medium text-white">
          Describe la situación y qué necesitas
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          required
          placeholder={
            tipoPeticion === "atrapados"
              ? "Ej: Estamos atrapados en el piso 3, edificio con derrumbe parcial..."
              : "Ej: Necesitamos medicinas, agua o refugio..."
          }
          className="w-full resize-none rounded-lg border-2 border-crisis-border bg-crisis-bg px-4 py-3 text-base text-white placeholder:text-crisis-muted focus:border-yellow-400 focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-crisis-alert px-4 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Send className="h-6 w-6" aria-hidden="true" />
        {status === "loading" ? "Publicando..." : "Publicar solicitud"}
      </button>

      {status === "success" && (
        <p className="flex items-start gap-2 rounded-lg bg-green-950/50 p-3 text-base text-green-300" role="status">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}
      {status === "error" && (
        <p className="flex items-start gap-2 rounded-lg bg-red-950/50 p-3 text-base text-red-300" role="alert">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}
    </form>
  );
}
