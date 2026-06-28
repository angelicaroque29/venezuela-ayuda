"use client";

import { AlertTriangle } from "lucide-react";

interface LiveAlertBannerProps {
  alertText: string | null;
}

export default function LiveAlertBanner({ alertText }: LiveAlertBannerProps) {
  const text =
    alertText ?? "Réplica detectada: Magnitud 5.5 - Región Central";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-pulse_alert border-b-2 border-crisis-alert bg-crisis-alert/15 px-3 py-3 sm:px-4"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-2.5 sm:items-center sm:gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-crisis-alert sm:mt-0"
          aria-hidden="true"
        />
        <p className="min-w-0 text-sm font-semibold leading-snug text-white sm:text-base">
          <span className="mb-1 mr-2 inline-block rounded bg-crisis-alert px-2 py-0.5 text-[10px] uppercase tracking-wider text-white sm:text-xs">
            En vivo
          </span>
          <span className="block sm:inline">{text}</span>
        </p>
      </div>
    </div>
  );
}
