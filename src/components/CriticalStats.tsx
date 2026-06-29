import { Activity, Clock, Users } from "lucide-react";
import type { AffectedPeopleStat } from "@/lib/crisis-stats";

interface CriticalStatsProps {
  affected: AffectedPeopleStat;
}

function formatUpdatedAt(iso: string | null): string | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "actualizado ahora";
  if (mins < 60) return `actualizado hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `actualizado hace ${hrs}h`;
  return `actualizado hace ${Math.floor(hrs / 24)}d`;
}

export default function CriticalStats({ affected }: CriticalStatsProps) {
  const updatedLabel = formatUpdatedAt(affected.updatedAt);

  const stats = [
    {
      icon: Users,
      label: "Personas afectadas",
      value: affected.value,
      sub: affected.sub,
      meta: updatedLabel,
      accent: "text-crisis-alert",
      border: "border-crisis-alert/40",
      bg: "bg-red-950/20",
    },
    {
      icon: Activity,
      label: "Magnitud de los sismos",
      value: "7.2 y 7.5",
      sub: "Dos terremotos muy fuertes",
      meta: null,
      accent: "text-orange-400",
      border: "border-orange-500/40",
      bg: "bg-orange-950/20",
    },
    {
      icon: Clock,
      label: "Tiempo entre sismos",
      value: "39 seg",
      sub: "Ocurrieron casi al mismo tiempo",
      meta: null,
      accent: "text-yellow-400",
      border: "border-yellow-500/40",
      bg: "bg-yellow-950/20",
    },
  ];

  return (
    <section aria-labelledby="stats-heading" className="space-y-4">
      <h2 id="stats-heading" className="text-lg font-bold text-white sm:text-xl">
        Situación actual
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className={`rounded-xl border-2 ${stat.border} ${stat.bg} p-4`}
          >
            <div className="mb-2 flex items-center gap-2">
              <stat.icon className={`h-6 w-6 ${stat.accent}`} aria-hidden="true" />
              <h3 className="text-sm font-semibold text-gray-200">{stat.label}</h3>
            </div>
            <p className={`text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
            <p className="mt-1 text-sm text-crisis-muted">{stat.sub}</p>
            {stat.meta && (
              <p className="mt-1 text-xs text-crisis-muted/80">{stat.meta}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
