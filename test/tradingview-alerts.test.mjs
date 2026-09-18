import assert from "node:assert/strict";
import test from "node:test";

import { tradingViewAlertSchema } from "../tradingview-alerts.mjs";


test("local extreme payload preserves deterministic score fields", () => {
  const parsed = tradingViewAlertSchema.parse({
    ticker: "BTCUSDT",
    timeframe: "60",
    price: 61200,
    signal: "local_bottom_confirmed",
    bottomScore: 100,
    topScore: 15,
    state: "CONFIRMED",
    direction: "BOTTOM",
    reasons: ["regular_bullish_divergence", "swing_low_sweep"],
    rsi: 24,
    bbZScore: -2.18,
    ema200: 62800,
    atr: 850,
    volume: 120000,
    volumeSma: 90000,
    volumeRatio: 1.333,
    regime: "BEARISH",
    message: "BTCUSDT BOTTOM CONFIRMED (100/100)",
    timestamp: "2026-09-18T12:00:00Z",
  });

  assert.equal(parsed.bottomScore, 100);
  assert.equal(parsed.state, "CONFIRMED");
  assert.deepEqual(parsed.reasons, ["regular_bullish_divergence", "swing_low_sweep"]);
});


test("scores stay within the documented 0 to 100 range", () => {
  assert.throws(() => tradingViewAlertSchema.parse({
    ticker: "BTCUSDT",
    timeframe: "60",
    price: 61200,
    signal: "local_bottom_confirmed",
    bottomScore: 101,
    message: "invalid",
    timestamp: "2026-09-18T12:00:00Z",
  }));
});
