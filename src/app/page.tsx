import { fetchEarthquakeNews, getLatestReplicaAlert } from "@/lib/news-fetcher";
import LiveAlertBanner from "@/components/LiveAlertBanner";
import CriticalStats from "@/components/CriticalStats";
import EducationModule from "@/components/EducationModule";
import ReportForm from "@/components/ReportForm";
import NewsFeed from "@/components/NewsFeed";
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
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-crisis-alert">
                Emergencia Nacional
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                Alerta Sísmica Venezuela
              </h1>
              <p className="mt-1 text-sm text-crisis-muted">
                Información en vivo para comunidades afectadas
              </p>
            </div>
            <Link
              href="/panel"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-crisis-border px-3 py-2 text-xs text-crisis-muted transition-colors hover:border-crisis-alert hover:text-white"
            >
              <Shield className="h-4 w-4" aria-hidden="true" />
              Panel brigadas
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-6">
        <CriticalStats />
        <NewsFeed />
        <EducationModule />
        <ReportForm />
      </main>

      <footer className="mt-8 border-t border-crisis-border px-4 py-6 text-center">
        <p className="flex items-center justify-center gap-1.5 text-xs text-crisis-muted">
          <Heart className="h-3 w-3 text-crisis-alert" aria-hidden="true" />
          Hecho para el pueblo venezolano · Validación IA por lotes cada hora
        </p>
      </footer>
    </>
  );
}
