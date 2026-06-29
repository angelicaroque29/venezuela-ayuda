import type { NewsItem } from "./news-fetcher";

export interface AffectedPeopleStat {
  value: string;
  sub: string;
  source: string | null;
  updatedAt: string | null;
}

interface ExtractedFigure {
  count: number;
  kind: "afectadas" | "heridos" | "victimas" | "evacuados";
  isMinimum: boolean;
  source: string;
  publishedAt: string;
  excerpt: string;
}

const KIND_PRIORITY: Record<ExtractedFigure["kind"], number> = {
  afectadas: 4,
  evacuados: 3,
  heridos: 2,
  victimas: 1,
};

const PATTERNS: Array<{
  kind: ExtractedFigure["kind"];
  regex: RegExp;
}> = [
  {
    kind: "afectadas",
    regex:
      /(?:más de|mas de|al menos|superan(?:\s+los)?|cerca de|aproximadamente|unos?)\s+([\d.,]+)\s*(?:mil\s+)?(?:personas?\s+)?(afectad[oa]s?|damnificad[oa]s?)/gi,
  },
  {
    kind: "afectadas",
    regex: /([\d.,]+)\s*(?:mil\s+)?personas?\s+(afectad[oa]s?|damnificad[oa]s?)/gi,
  },
  {
    kind: "evacuados",
    regex: /([\d.,]+)\s*(?:personas?\s+)?(evacuad[oa]s?)/gi,
  },
  {
    kind: "heridos",
    regex:
      /(?:más de|mas de|al menos)\s+([\d.,]+)\s*(?:personas?\s+)?(herid[oa]s?)/gi,
  },
  {
    kind: "heridos",
    regex: /([\d.,]+)\s*(?:personas?\s+)?(herid[oa]s?)/gi,
  },
  {
    kind: "victimas",
    regex: /([\d.,]+)\s*(?:personas?\s+)?(víctimas?|victimas?|fallecid[oa]s?|muertos?)/gi,
  },
];

function parseSpanishNumber(raw: string): number | null {
  const cleaned = raw.trim().toLowerCase();
  if (!cleaned) return null;

  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return Number.parseInt(cleaned.replace(/\./g, ""), 10);
  }
  if (/^\d{1,3}(,\d{3})+$/.test(cleaned)) {
    return Number.parseInt(cleaned.replace(/,/g, ""), 10);
  }

  const normalized = cleaned.replace(",", ".");
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value <= 0 || value > 50_000_000) return null;
  return Math.round(value);
}

function formatCount(count: number, isMinimum: boolean): string {
  const formatted = count.toLocaleString("es-VE");
  return isMinimum ? `+${formatted}` : formatted;
}

function kindLabel(kind: ExtractedFigure["kind"], count: number): string {
  const labels: Record<ExtractedFigure["kind"], [string, string]> = {
    afectadas: ["persona afectada", "personas afectadas"],
    heridos: ["herido reportado", "heridos reportados"],
    victimas: ["víctima reportada", "víctimas reportadas"],
    evacuados: ["persona evacuada", "personas evacuadas"],
  };
  const [one, many] = labels[kind];
  return count === 1 ? one : many;
}

function extractFromText(
  text: string,
  source: string,
  publishedAt: string
): ExtractedFigure[] {
  const figures: ExtractedFigure[] = [];

  for (const { kind, regex } of PATTERNS) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const count = parseSpanishNumber(match[1]);
      if (!count) continue;

      const prefix = text.slice(Math.max(0, match.index - 30), match.index).toLowerCase();
      const isMinimum =
        /(?:más de|mas de|al menos|superan|cerca de|aproximadamente|unos?)/i.test(
          match[0]
        ) ||
        /(?:más de|mas de|al menos|superan|cerca de|aproximadamente|unos?)\s*$/i.test(
          prefix
        );

      figures.push({
        count,
        kind,
        isMinimum,
        source,
        publishedAt,
        excerpt: match[0].trim(),
      });
    }
  }

  return figures;
}

function pickBestFigure(figures: ExtractedFigure[]): ExtractedFigure | null {
  if (figures.length === 0) return null;

  return figures.sort((a, b) => {
    const dateDiff =
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    if (Math.abs(dateDiff) > 6 * 60 * 60 * 1000) return dateDiff;

    const kindDiff = KIND_PRIORITY[b.kind] - KIND_PRIORITY[a.kind];
    if (kindDiff !== 0) return kindDiff;

    return b.count - a.count;
  })[0];
}

export function extractAffectedPeopleStat(news: NewsItem[]): AffectedPeopleStat {
  const figures: ExtractedFigure[] = [];

  for (const item of news) {
    const text = `${item.title} ${item.summary}`;
    figures.push(...extractFromText(text, item.source, item.publishedAt));
  }

  const best = pickBestFigure(figures);

  if (!best) {
    return {
      value: "—",
      sub: "Sin cifra en medios recientes — verifica noticias abajo",
      source: null,
      updatedAt: news[0]?.publishedAt ?? null,
    };
  }

  return {
    value: formatCount(best.count, best.isMinimum),
    sub: `${kindLabel(best.kind, best.count)} · según ${best.source}`,
    source: best.source,
    updatedAt: best.publishedAt,
  };
}
