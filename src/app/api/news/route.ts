import { NextResponse } from "next/server";
import { fetchEarthquakeNews, getLatestReplicaAlert } from "@/lib/news-fetcher";

export const revalidate = 300;

export async function GET() {
  try {
    const news = await fetchEarthquakeNews();
    const latestAlert = getLatestReplicaAlert(news);

    return NextResponse.json({
      news,
      latestAlert,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar las noticias." },
      { status: 500 }
    );
  }
}
