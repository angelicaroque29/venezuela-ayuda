import { fetchEarthquakeNews, getLatestReplicaAlert } from "@/lib/news-fetcher";
import { extractAffectedPeopleStat } from "@/lib/crisis-stats";
import LiveAlertBanner from "@/components/LiveAlertBanner";
import CriticalStats from "@/components/CriticalStats";
import EducationModule from "@/components/EducationModule";
import ReportForm from "@/components/ReportForm";
import NewsFeed from "@/components/NewsFeed";
import EarthquakeAlertGuide from "@/components/EarthquakeAlertGuide";
import ReportFlowInfo from "@/components/ReportFlowInfo";
import VerificationMethodology from "@/components/VerificationMethodology";
import { Heart, Shield, List } from "lucide-react";
import Link from "next/link";
import type { PeticionTipo } from "@/lib/peticion-types";

export const revalidate = 300;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { publicar?: string };
}) {
  const news = await fetchEarthquakeNews();
  const latestAlert = getLatestReplicaAlert(news);
  const affectedStat = extractAffectedPeopleStat(news);

  const urgent = searchParams?.publicar === "urgente";
  const openForm = urgent || searchParams?.publicar === "1";
  const defaultTipo: PeticionTipo = urgent ? "atrapados" : "otros";

  return (
    <>
      <LiveAlertBanner alertText={latestAlert} />

      <header className="border-b border-crisis-border px-4 py-4 sm:py-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-crisis-alert">
                Emergencia Nacional
              </p>
              <h1 className="mt-1 flex items-center gap-2 text-xl font-bold leading-tight text-white sm:text-3xl">
                <span className="text-2xl sm:text-3xl" aria-hidden="true">🇻🇪</span>
                Alerta Sísmica Venezuela
              </h1>
              <p className="mt-1 text-sm text-crisis-muted sm:text-base">
                Información clara y en vivo para todas las familias
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link
                href="/peticiones"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-crisis-border px-3 py-2.5 text-sm text-crisis-muted transition-colors hover:border-crisis-alert hover:text-white sm:w-auto"
              >
                <List className="h-4 w-4" aria-hidden="true" />
                Peticiones
              </Link>
              <Link
                href="/panel"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-crisis-border px-3 py-2.5 text-sm text-crisis-muted transition-colors hover:border-crisis-alert hover:text-white sm:w-auto"
              >
                <Shield className="h-4 w-4" aria-hidden="true" />
                Brigadas
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-5 pb-8 sm:space-y-6 sm:py-6">
        <ReportForm prominent defaultOpen={openForm} defaultTipo={defaultTipo} />

        <ReportFlowInfo />

        <VerificationMethodology />

        <EarthquakeAlertGuide compact />

        <CriticalStats initialAffected={affectedStat} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <NewsFeed />
          </div>
          <div className="lg:col-span-2">
            <EducationModule />
          </div>
        </div>
      </main>

      <footer className="border-t border-crisis-border px-4 py-5 text-center">
        <p className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-crisis-muted">
          <Heart className="h-4 w-4 text-crisis-alert" aria-hidden="true" />
          Hecho para el pueblo venezolano
        </p>
      </footer>
    </>
  );
}
