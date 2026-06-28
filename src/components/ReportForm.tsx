"use client";

import { useState } from "react";
import { MapPin, Send, MessageCircle, CheckCircle, AlertCircle } from "lucide-react";
import { validateReportLocally } from "@/lib/validate-report";

const TELEGRAM_LINK =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_LINK ?? "https://t.me/venezuela_sismo_bot";
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "584121234567";

export default function ReportForm() {
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
        body: JSON.stringify({ text, ubicacion, source: "web" }),
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
      setMessage("Sin conexión. Intenta por Telegram o WhatsApp.");
    }
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "🚨 REPORTE SÍSMICO VE\nUbicación: \nSituación: "
  )}`;

  return (
    <section aria-labelledby="report-heading" className="space-y-4">
      <h2 id="report-heading" className="text-lg font-bold text-white">
        Reporte ciudadano
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0088cc] px-4 py-4 text-center font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
          Reportar por Telegram
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-4 text-center font-semibold text-white transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Reportar por WhatsApp
        </a>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-xl border border-crisis-border bg-crisis-surface p-4"
      >
        <p className="text-xs text-crisis-muted">
          Validación local instantánea · Verificación IA cada hora en lote
        </p>

        <label className="block">
          <span className="mb-1 flex items-center gap-1 text-sm text-gray-300">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Ubicación (ciudad, sector, estado)
          </span>
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej: Caracas, Chacao, Miranda"
            className="w-full rounded-lg border border-crisis-border bg-crisis-bg px-3 py-2.5 text-white placeholder:text-crisis-muted focus:border-crisis-alert focus:outline-none focus:ring-1 focus:ring-crisis-alert"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-gray-300">
            Describe daño, heridos o insumos necesarios
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            required
            placeholder="Ej: Edificio con grietas en fachada, necesitamos agua y mantas para 15 familias..."
            className="w-full resize-none rounded-lg border border-crisis-border bg-crisis-bg px-3 py-2.5 text-white placeholder:text-crisis-muted focus:border-crisis-alert focus:outline-none focus:ring-1 focus:ring-crisis-alert"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-crisis-alert px-4 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
          {status === "loading" ? "Enviando..." : "Enviar reporte"}
        </button>

        {status === "success" && (
          <p className="flex items-start gap-2 text-sm text-green-400" role="status">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {message}
          </p>
        )}
        {status === "error" && (
          <p className="flex items-start gap-2 text-sm text-crisis-alert" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
