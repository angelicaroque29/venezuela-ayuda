import { fetchEarthquakeNews } from "../src/lib/news-fetcher";
import { extractAffectedPeopleStat } from "../src/lib/crisis-stats";

async function main() {
  const useProduction = process.argv.includes("--prod");

  let news;
  if (useProduction) {
    const res = await fetch("https://venezuela-ayuda.xyz/api/news");
    const data = await res.json();
    news = data.news;
  } else {
    news = await fetchEarthquakeNews();
  }

  console.log("News count:", news.length);
  for (const [i, n] of news.entries()) {
    console.log(`${i + 1}. [${n.source}] ${n.title}`);
    if (n.summary) console.log(`   ${n.summary.slice(0, 120)}`);
  }
  console.log("---");
  console.log(JSON.stringify(extractAffectedPeopleStat(news), null, 2));
}

main().catch(console.error);
