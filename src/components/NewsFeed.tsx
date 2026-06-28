"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  RefreshCw,
  Newspaper,
  Radio,
  ChevronDown,
} from "lucide-react";
import type { NewsItem } from "@/lib/news-fetcher";

const VISIBLE_COUNT = 3;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article
      className={`rounded-xl border-2 bg-crisis-surface p-4 ${
        item.priority === "critical"
          ? "border-crisis-alert/60"
          : item.priority === "high"
            ? "border-orange-500/40"
            : "border-crisis-border"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {item.priority === "critical" && (
          <span className="rounded-md bg-crisis-alert px-2.5 py-1 text-xs font-bold uppercase text-white">
            Urgente
          </span>
        )}
        {item.priority === "high" && (
          <span className="rounded-md bg-orange-500 px-2.5 py-1 text-xs font-bold uppercase text-white">
            Importante
          </span>
        )}
        {item.verified && (
          <span className="flex items-center gap-1 rounded-md bg-blue-900/50 px-2.5 py-1 text-xs font-semibold text-blue-300">
            <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
            Medio verificado
          </span>
        )}
        <span className="text-xs text-crisis-muted">
          {item.source} · {timeAgo(item.publishedAt)}
        </span>
      </div>
      <h3 className="text-base font-bold leading-snug text-white">{item.title}</h3>
      {item.summary && (
        <p className="mt-1.5 text-sm leading-relaxed text-gray-300 line-clamp-2">
          {item.summary}
        </p>
      )}
      {item.link !== "#" && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-crisis-alert hover:underline"
        >
          Leer noticia completa
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data.news ?? []);
      setUpdatedAt(data.updatedAt);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const hasMore = news.length > VISIBLE_COUNT;
  const visibleNews = expanded ? news : news.slice(0, VISIBLE_COUNT);
  const hiddenCount = news.length - VISIBLE_COUNT;

  return (
    <section aria-labelledby="news-heading" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="news-heading"
            className="text-base font-bold leading-snug text-white sm:text-xl"
          >
            <span className="flex items-start gap-2 sm:items-center">
              <Radio className="mt-0.5 h-5 w-5 shrink-0 text-crisis-alert sm:mt-0 sm:h-6 sm:w-6" aria-hidden="true" />
              Noticias filtradas por relevancia sísmica
            </span>
          </h2>
          <p className="mt-1 text-sm text-crisis-muted">
            Desde medios venezolanos · filtro automático por palabras clave
            <span className="text-crisis-muted/80"> (sin IA)</span>
            {updatedAt && ` · Actualizado ${timeAgo(updatedAt)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchNews}
          disabled={loading}
          aria-label="Actualizar noticias"
          className="shrink-0 rounded-lg p-2.5 text-crisis-muted transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && news.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-crisis-surface"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : (
        <>
          <ul className="space-y-3" role="list">
            {visibleNews.map((item) => (
              <li key={item.id}>
                <NewsCard item={item} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-crisis-border bg-crisis-surface/50 px-4 py-3 text-base font-semibold text-white transition-colors hover:border-purple-500/50 hover:bg-crisis-surface"
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
              {expanded
                ? "Ver menos noticias"
                : `Ver ${hiddenCount} noticia${hiddenCount > 1 ? "s" : ""} más`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
