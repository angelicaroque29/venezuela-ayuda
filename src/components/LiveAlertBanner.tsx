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
      className="animate-pulse_alert border-b-2 border-crisis-alert bg-crisis-alert/15 px-4 py-3"
    >
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <AlertTriangle
          className="h-5 w-5 shrink-0 text-crisis-alert"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-white sm:text-base">
          <span className="mr-2 inline-block rounded bg-crisis-alert px-2 py-0.5 text-xs uppercase tracking-wider text-white">
            En vivo
          </span>
          {text}
        </p>
      </div>
    </div>
  );
}
