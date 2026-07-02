function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function rounded(value, digits = 4) {
  const number = numberOrNull(value);
  if (number === null) return null;
  const factor = 10 ** digits;
  return Math.round(number * factor) / factor;
}

function classifyRangePosition({ price, rangeHigh, rangeLow }) {
  if (price === null || rangeHigh === null || rangeLow === null || rangeHigh <= rangeLow) {
    return { position: "unknown", percent: null };
  }

  if (price > rangeHigh) return { position: "above_range", percent: 100 };
  if (price < rangeLow) return { position: "below_range", percent: 0 };

  const percent = ((price - rangeLow) / (rangeHigh - rangeLow)) * 100;
  if (percent >= 80) return { position: "upper_range", percent: rounded(percent, 2) };
  if (percent <= 20) return { position: "lower_range", percent: rounded(percent, 2) };
  return { position: "mid_range", percent: rounded(percent, 2) };
}

function classifyVolatility(atrPercent) {
  if (atrPercent === null) return "unknown";
  if (atrPercent < 1.2) return "compression";
  if (atrPercent > 4) return "expansion";
  return "normal";
}

function classifyVolume({ volume, volumeSma }) {
  if (volume === null || volumeSma === null || volumeSma <= 0) {
    return { state: "unknown", ratio: null };
  }

  const ratio = volume / volumeSma;
  if (ratio >= 1.5) return { state: "high", ratio: rounded(ratio, 2) };
  if (ratio <= 0.7) return { state: "low", ratio: rounded(ratio, 2) };
  return { state: "normal", ratio: rounded(ratio, 2) };
}

function classifyRsi(rsi) {
  if (rsi === null) return "unknown";
  if (rsi >= 70) return "overbought";
  if (rsi <= 30) return "oversold";
  if (rsi >= 55) return "bullish";
  if (rsi <= 45) return "bearish";
  return "neutral";
}

export function classifyMarketRange(alert) {
  const price = numberOrNull(alert.price);
  const rangeHigh = numberOrNull(alert.rangeHigh);
  const rangeLow = numberOrNull(alert.rangeLow);
  const rangeMid = numberOrNull(alert.rangeMid);
  const atr = numberOrNull(alert.atr);
  const atrPercent = numberOrNull(alert.atrPercent);
  const volume = numberOrNull(alert.volume);
  const volumeSma = numberOrNull(alert.volumeSma);
  const rsi = numberOrNull(alert.rsi);
  const range = classifyRangePosition({ price, rangeHigh, rangeLow });
  const volumeState = classifyVolume({ volume, volumeSma });
  const volatilityState = classifyVolatility(atrPercent);
  const rsiState = classifyRsi(rsi);

  let rangeState = range.position;
  if (alert.signal === "breakout") rangeState = "breakout";
  if (alert.signal === "breakdown") rangeState = "breakdown";

  const squeezeRisk =
    volatilityState === "compression" && range.position === "upper_range"
      ? "upside_breakout_building"
      : volatilityState === "compression" && range.position === "lower_range"
        ? "downside_breakdown_building"
        : "neutral";

  return {
    provider: "rules_v1",
    rangeState,
    rangePosition: range.position,
    rangePositionPercent: range.percent,
    volatilityState,
    volumeState: volumeState.state,
    volumeRatio: volumeState.ratio,
    rsiState,
    squeezeRisk,
    levels: {
      rangeHigh: rounded(rangeHigh),
      rangeLow: rounded(rangeLow),
      rangeMid: rounded(rangeMid),
      atr: rounded(atr),
      atrPercent: rounded(atrPercent, 2),
    },
  };
}
