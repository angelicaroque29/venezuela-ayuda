import { NextResponse } from "next/server";
import { fetchEarthquakeNews, getLatestReplicaAlert } from "@/lib/news-fetcher";
import { extractAffectedPeopleStat } from "@/lib/crisis-stats";

export const revalidate = 300;

export async function GET() {
  try {
    const news = await fetchEarthquakeNews();
    const latestAlert = getLatestReplicaAlert(news);
    const affectedStat = extractAffectedPeopleStat(news);

    return NextResponse.json({
      news,
      latestAlert,
      affectedStat,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar las noticias." },
      { status: 500 }
    );
  }
}
