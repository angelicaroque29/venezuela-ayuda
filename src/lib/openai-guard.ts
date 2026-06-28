import { getStorageItem, setStorageItem } from "./storage";

const LAST_OPENAI_CALL_KEY = "last-openai-call-at";
const OPENAI_CALLS_LOG_KEY = "openai-calls-log";

/** Mínimo 60 minutos entre llamadas a OpenAI */
const MIN_INTERVAL_MS = 60 * 60 * 1000;

export interface OpenAIUsageStats {
  lastCallAt: string | null;
  nextAllowedAt: string | null;
  canCallNow: boolean;
  maxCallsPerHour: 1;
  callsLast24h: number;
  estimatedMonthlyCostUsd: string;
}

interface CallLogEntry {
  at: string;
  reportCount: number;
}

export async function canCallOpenAI(): Promise<{
  allowed: boolean;
  lastCallAt: string | null;
  nextAllowedAt: string | null;
}> {
  const lastCallAt = await getStorageItem<string | null>(LAST_OPENAI_CALL_KEY, null);

  if (!lastCallAt) {
    return { allowed: true, lastCallAt: null, nextAllowedAt: null };
  }

  const elapsed = Date.now() - new Date(lastCallAt).getTime();
  const allowed = elapsed >= MIN_INTERVAL_MS;

  return {
    allowed,
    lastCallAt,
    nextAllowedAt: allowed
      ? null
      : new Date(new Date(lastCallAt).getTime() + MIN_INTERVAL_MS).toISOString(),
  };
}

export async function recordOpenAICall(reportCount: number): Promise<void> {
  const now = new Date().toISOString();
  await setStorageItem(LAST_OPENAI_CALL_KEY, now);

  const log = await getStorageItem<CallLogEntry[]>(OPENAI_CALLS_LOG_KEY, []);
  log.unshift({ at: now, reportCount });
  await setStorageItem(OPENAI_CALLS_LOG_KEY, log.slice(0, 168)); // ~7 días horarios
}

export async function getOpenAIUsageStats(
  pendingReportCount = 0
): Promise<OpenAIUsageStats> {
  const { allowed, lastCallAt, nextAllowedAt } = await canCallOpenAI();
  const log = await getStorageItem<CallLogEntry[]>(OPENAI_CALLS_LOG_KEY, []);

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const callsLast24h = log.filter((e) => new Date(e.at).getTime() >= dayAgo).length;

  // gpt-4o-mini: ~$0.15/1M input, ~$0.60/1M output
  // Estimado por lote: ~2k input + ~1k output tokens → ~$0.0009/lote
  const avgReportsPerCall = log.length
    ? log.reduce((s, e) => s + e.reportCount, 0) / log.length
    : Math.min(pendingReportCount, 20) || 10;
  const tokensPerCall = 800 + avgReportsPerCall * 120;
  const costPerCall =
    (tokensPerCall / 1_000_000) * 0.15 + (1000 / 1_000_000) * 0.6;
  const monthlyEstimate = costPerCall * 24 * 30;

  return {
    lastCallAt,
    nextAllowedAt,
    canCallNow: allowed,
    maxCallsPerHour: 1,
    callsLast24h,
    estimatedMonthlyCostUsd:
      monthlyEstimate < 0.01
        ? "< $0.01"
        : monthlyEstimate < 1
          ? `$${monthlyEstimate.toFixed(2)}`
          : `$${monthlyEstimate.toFixed(2)}`,
  };
}
