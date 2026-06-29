export type PeticionTipo =
  | "atrapados"
  | "medicamentos"
  | "alimentos"
  | "buscar_persona"
  | "otros";

export const PETICION_TIPOS: Array<{
  value: PeticionTipo;
  label: string;
  emoji: string;
  urgent?: boolean;
}> = [
  { value: "atrapados", label: "Atrapados", emoji: "🆘", urgent: true },
  { value: "medicamentos", label: "Medicamentos", emoji: "💊" },
  { value: "alimentos", label: "Alimentos", emoji: "🥫" },
  { value: "buscar_persona", label: "Buscar persona", emoji: "🔍" },
  { value: "otros", label: "Otros", emoji: "📋" },
];

export function inferPeticionTipo(text: string, ubicacion?: string): PeticionTipo {
  const lower = `${text} ${ubicacion ?? ""}`.toLowerCase();

  if (
    /(atrapad|bajo escombros|no pueden salir|soterrad|encerrad)/i.test(lower)
  ) {
    return "atrapados";
  }
  if (/(medic|insulin|hospital|ambulancia|herid)/i.test(lower)) {
    return "medicamentos";
  }
  if (/(aliment|comida|agua potable|manta|refugio|hambre)/i.test(lower)) {
    return "alimentos";
  }
  if (/(desaparec|buscar a|busco a|extraviad|no sabemos de)/i.test(lower)) {
    return "buscar_persona";
  }
  return "otros";
}

export function peticionLabel(tipo: PeticionTipo): string {
  return PETICION_TIPOS.find((t) => t.value === tipo)?.label ?? "Otros";
}

export function peticionEmoji(tipo: PeticionTipo): string {
  return PETICION_TIPOS.find((t) => t.value === tipo)?.emoji ?? "📋";
}
