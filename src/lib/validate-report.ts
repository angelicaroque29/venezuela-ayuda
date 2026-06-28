export const EARTHQUAKE_KEYWORDS = [
  "sismo",
  "temblor",
  "réplica",
  "replica",
  "terremoto",
  "colapso",
  "derrumbe",
  "ayuda",
  "heridos",
  "herido",
  "víctimas",
  "victimas",
  "daño",
  "daños",
  "emergencia",
  "rescate",
  "caracas",
  "la guaira",
  "guaira",
  "miranda",
  "aragua",
  "valencia",
  "maracay",
  "barquisimeto",
  "mérida",
  "merida",
  "venezuela",
  "magnitud",
  "epicentro",
  "evacuación",
  "evacuacion",
  "hospital",
  "medicina",
  "agua",
  "alimentos",
  "refugio",
  "estructural",
  "grieta",
  "edificio",
  "defensa civil",
  "protección civil",
  "proteccion civil",
  "bomberos",
  "ambulancia",
  "inundación",
  "inundacion",
  "tsunami",
  "alerta",
  "réplicas",
  "replicas",
  "panico",
  "pánico",
  "reporte",
  "ubicación",
  "ubicacion",
  "sector",
  "parroquia",
  "municipio",
  "estado",
];

const SPAM_PATTERNS = [
  /https?:\/\/\S+/i,
  /(ganar|premio|bitcoin|crypto|casino|apuesta)/i,
  /(click aquí|haz clic|suscríbete gratis)/i,
];

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateReportLocally(text: string): ValidationResult {
  const trimmed = text.trim();

  if (trimmed.length < 15) {
    return {
      valid: false,
      reason: "El reporte es demasiado corto. Describe ubicación y situación.",
    };
  }

  if (trimmed.length > 2000) {
    return {
      valid: false,
      reason: "El reporte excede el límite de 2000 caracteres.",
    };
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        reason: "Contenido bloqueado: posible spam o enlace no permitido.",
      };
    }
  }

  const lower = trimmed.toLowerCase();
  const hasKeyword = EARTHQUAKE_KEYWORDS.some((kw) => lower.includes(kw));

  if (!hasKeyword) {
    return {
      valid: false,
      reason:
        "Tu mensaje no parece relacionado con la emergencia sísmica. Incluye ubicación y tipo de daño o necesidad.",
    };
  }

  return { valid: true };
}
