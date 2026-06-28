import { Activity, Clock, Users } from "lucide-react";

const stats = [
  {
    icon: Users,
    label: "Personas afectadas",
    value: "+1,450",
    sub: "Cifra preliminar en zonas dañadas",
    accent: "text-crisis-alert",
    border: "border-crisis-alert/40",
    bg: "bg-red-950/20",
  },
  {
    icon: Activity,
    label: "Magnitud de los sismos",
    value: "7.2 y 7.5",
    sub: "Dos terremotos muy fuertes",
    accent: "text-orange-400",
    border: "border-orange-500/40",
    bg: "bg-orange-950/20",
  },
  {
    icon: Clock,
    label: "Tiempo entre sismos",
    value: "39 seg",
    sub: "Ocurrieron casi al mismo tiempo",
    accent: "text-yellow-400",
    border: "border-yellow-500/40",
    bg: "bg-yellow-950/20",
  },
];

export default function CriticalStats() {
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
          </article>
        ))}
      </div>
    </section>
  );
}
