export default function ColorLegend() {
  const items = [
    { color: "bg-crisis-alert", label: "Rojo = Urgente o peligro" },
    { color: "bg-orange-500", label: "Naranja = Importante" },
    { color: "bg-green-500", label: "Verde = Seguro o verificado" },
    { color: "bg-yellow-400", label: "Amarillo = Datos y ubicación" },
    { color: "bg-purple-500", label: "Morado = Inteligencia Artificial" },
  ];

  return (
    <div
      className="flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-crisis-border bg-crisis-surface/60 px-4 py-3"
      aria-label="Guía de colores"
    >
      <span className="w-full text-xs font-semibold uppercase tracking-wide text-crisis-muted sm:w-auto sm:mr-2">
        Colores:
      </span>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2 text-sm text-gray-300">
          <span
            className={`h-3 w-3 shrink-0 rounded-full ${item.color}`}
            aria-hidden="true"
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
