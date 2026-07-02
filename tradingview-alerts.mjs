import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { z } from "zod";
import { classifyMarketRange } from "./market-range-engine.mjs";

export const tradingViewAlertSchema = z.object({
  ticker: z.string().trim().min(1).max(32),
  timeframe: z.string().trim().min(1).max(16),
  price: z.coerce.number().finite().positive(),
  signal: z.string().trim().min(1).max(64),
  rsi: z.coerce.number().finite().min(0).max(100).optional(),
  rangeHigh: z.coerce.number().finite().positive().optional(),
  rangeLow: z.coerce.number().finite().positive().optional(),
  rangeMid: z.coerce.number().finite().positive().optional(),
  atr: z.coerce.number().finite().positive().optional(),
  atrPercent: z.coerce.number().finite().nonnegative().optional(),
  volume: z.coerce.number().finite().nonnegative().optional(),
  volumeSma: z.coerce.number().finite().nonnegative().optional(),
  funding: z.string().trim().max(64).optional(),
  openInterest: z.string().trim().max(64).optional(),
  message: z.string().trim().min(1).max(1000),
  timestamp: z.string().datetime(),
});

export function analyzeTradingViewAlert(alert) {
  // Connect OpenAI or Claude here after the webhook flow is proven end-to-end.
  return {
    provider: "placeholder",
    summary: `${alert.ticker} ${alert.timeframe} ${alert.signal} alert received for read-only review.`,
    action: "read_only_review",
  };
}

export class TradingViewAlertStore {
  constructor({ filePath, maxAlerts = 50 }) {
    this.filePath = filePath;
    this.maxAlerts = maxAlerts;
  }

  async readAll() {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.alerts) ? parsed.alerts : [];
    } catch {
      return [];
    }
  }

  async writeAll(alerts) {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify({ alerts }, null, 2), "utf8");
  }

  async add(alert) {
    // Replace this local JSON file store with a database-backed adapter later.
    const alerts = await this.readAll();
    const storedAlert = {
      id: randomUUID(),
      status: "received",
      receivedAt: new Date().toISOString(),
      range: classifyMarketRange(alert),
      analysis: analyzeTradingViewAlert(alert),
      ...alert,
    };

    await this.writeAll([storedAlert, ...alerts].slice(0, this.maxAlerts));
    return storedAlert;
  }

  async latest(limit = 10) {
    const alerts = await this.readAll();
    return alerts.slice(0, limit);
  }
}
