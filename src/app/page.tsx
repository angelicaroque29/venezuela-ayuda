import { fetchEarthquakeNews, getLatestReplicaAlert } from "@/lib/news-fetcher";
import LiveAlertBanner from "@/components/LiveAlertBanner";
import CriticalStats from "@/components/CriticalStats";
import EducationModule from "@/components/EducationModule";
import ReportForm from "@/components/ReportForm";
import NewsFeed from "@/components/NewsFeed";
import ColorLegend from "@/components/ColorLegend";
import { Heart, Shield } from "lucide-react";
import Link from "next/link";

export const revalidate = 300;

export default async function HomePage() {
  const news = await fetchEarthquakeNews();
  const latestAlert = getLatestReplicaAlert(news);

  return (
    <>
      <LiveAlertBanner alertText={latestAlert} />

      <header className="border-b border-crisis-border px-4 py-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-crisis-alert">
                Emergencia Nacional
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                Alerta Sísmica Venezuela
              </h1>
              <p className="mt-1 text-base text-crisis-muted">
                Información clara y en vivo para todas las familias
              </p>
            </div>
            <Link
              href="/panel"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-crisis-border px-3 py-2 text-sm text-crisis-muted transition-colors hover:border-crisis-alert hover:text-white"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              Brigadas
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <ReportForm prominent />

        <ColorLegend />

        <CriticalStats />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <NewsFeed />
          </div>
          <div className="lg:col-span-2">
            <EducationModule />
          </div>
        </div>
      </main>

      <footer className="mt-8 border-t border-crisis-border px-4 py-6 text-center">
        <p className="flex items-center justify-center gap-1.5 text-sm text-crisis-muted">
          <Heart className="h-4 w-4 text-crisis-alert" aria-hidden="true" />
          Hecho para el pueblo venezolano · Noticias verificadas por IA cada hora
        </p>
      </footer>
    </>
  );
}
