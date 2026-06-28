import { processReportBatch } from "@/lib/batch-processor";

const INTERVAL_MS = 60 * 60 * 1000;

async function runBatch() {
  console.log(`[${new Date().toISOString()}] Iniciando procesamiento por lotes...`);
  try {
    const result = await processReportBatch();
    if (result) {
      console.log(
        `Lote completado: ${result.legitimate.length} legítimos, ${result.falsos.length} falsos`
      );
      console.log(`Resumen: ${result.resumenGeneral}`);
    } else {
      console.log("Sin reportes pendientes.");
    }
  } catch (err) {
    console.error("Error en lote:", err);
  }
}

const watchMode = process.argv.includes("--watch");

if (watchMode) {
  console.log("Modo cron activo: procesamiento cada hora.");
  runBatch();
  setInterval(runBatch, INTERVAL_MS);
} else {
  runBatch().then(() => process.exit(0));
}
