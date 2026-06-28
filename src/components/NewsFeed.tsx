"use client";

import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw, ShieldCheck, Radio } from "lucide-react";
import type { NewsItem } from "@/lib/news-fetcher";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

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

  return (
    <section aria-labelledby="news-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="news-heading" className="flex items-center gap-2 text-lg font-bold text-white">
          <Radio className="h-5 w-5 text-crisis-alert" aria-hidden="true" />
          Noticias verificadas
        </h2>
        <button
          type="button"
          onClick={fetchNews}
          disabled={loading}
          aria-label="Actualizar noticias"
          className="rounded-lg p-2 text-crisis-muted transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <p className="text-xs text-crisis-muted">
        Fuentes RSS filtradas por relevancia sísmica
        {updatedAt && ` · Actualizado ${timeAgo(updatedAt)}`}
      </p>

      {loading && news.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-crisis-surface"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {news.map((item) => (
            <li key={item.id}>
              <article
                className={`rounded-xl border bg-crisis-surface p-4 transition-colors ${
                  item.priority === "critical"
                    ? "border-crisis-alert/50"
                    : "border-crisis-border"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {item.priority === "critical" && (
                    <span className="rounded bg-crisis-alert px-2 py-0.5 text-xs font-bold uppercase text-white">
                      Crítico
                    </span>
                  )}
                  {item.verified && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                      Verificado
                    </span>
                  )}
                  <span className="text-xs text-crisis-muted">
                    {item.source} · {timeAgo(item.publishedAt)}
                  </span>
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                {item.summary && (
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">{item.summary}</p>
                )}
                {item.link !== "#" && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-crisis-alert hover:underline"
                  >
                    Leer más
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
