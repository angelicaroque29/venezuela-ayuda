import { Activity, Clock, Users } from "lucide-react";

const stats = [
  {
    icon: Users,
    label: "Cifra de víctimas",
    value: "+1,450",
    sub: "Reportes preliminares en zonas afectadas",
    accent: "text-crisis-alert",
  },
  {
    icon: Activity,
    label: "Doblete sísmico histórico",
    value: "7.2 y 7.5",
    sub: "Magnitudes registradas en evento principal",
    accent: "text-orange-400",
  },
  {
    icon: Clock,
    label: "Tiempo entre eventos",
    value: "39 seg",
    sub: "Intervalo entre los dos sismos principales",
    accent: "text-yellow-400",
  },
];

export default function CriticalStats() {
  return (
    <section aria-labelledby="stats-heading" className="space-y-4">
      <h2 id="stats-heading" className="text-lg font-bold text-white">
        Datos críticos
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-xl border border-crisis-border bg-crisis-surface p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <stat.icon className={`h-5 w-5 ${stat.accent}`} aria-hidden="true" />
              <h3 className="text-xs font-medium uppercase tracking-wide text-crisis-muted">
                {stat.label}
              </h3>
            </div>
            <p className={`text-2xl font-bold ${stat.accent}`}>{stat.value}</p>
            <p className="mt-1 text-xs text-crisis-muted">{stat.sub}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
