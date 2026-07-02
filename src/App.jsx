import { useEffect, useState } from "react";
import { tradingViewWatchlist } from "./tradingViewConfig";
import {
  TradingViewMarketOverview,
  TradingViewTechnicalAnalysis,
  TradingViewTickerTape,
} from "./TradingViewWidget.jsx";

function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return number.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: number >= 1000 ? 0 : 2,
  });
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "--";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLevel(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return number.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function rangeLabel(alert) {
  if (!alert.range) return null;
  return [
    alert.range.rangeState,
    alert.range.volatilityState,
    alert.range.volumeState,
    alert.range.rsiState,
  ].filter(Boolean).join(" / ");
}

function LatestAlerts() {
  const [state, setState] = useState({ status: "loading", alerts: [] });

  useEffect(() => {
    let mounted = true;

    async function loadAlerts() {
      try {
        const response = await fetch("/api/tradingview/alerts?limit=8");
        if (!response.ok) throw new Error(`Alert endpoint returned ${response.status}`);
        const payload = await response.json();
        if (mounted) {
          setState({ status: "ready", alerts: Array.isArray(payload.alerts) ? payload.alerts : [] });
        }
      } catch (error) {
        if (mounted) setState({ status: error.message, alerts: [] });
      }
    }

    loadAlerts();
    const timer = window.setInterval(loadAlerts, 30000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="panel alert-panel">
      <div className="panel-head">
        <div>
          <h2>Latest TradingView Alerts</h2>
          <p>Validated read-only webhook payloads</p>
        </div>
        <span className="badge">{state.alerts.length ? `${state.alerts.length} live` : "Ready"}</span>
      </div>

      <div className="alert-list">
        {state.alerts.length === 0 ? (
          <div className="empty-state">
            <strong>{state.status === "ready" || state.status === "loading" ? "No alerts yet" : "Alerts unavailable"}</strong>
            <p>
              POST alert JSON to <code>/api/tradingview/webhook</code> with the secret in{" "}
              <code>x-tradingview-secret</code>.
            </p>
            {state.status !== "ready" && state.status !== "loading" && <p>{state.status}</p>}
          </div>
        ) : (
          state.alerts.map((alert) => (
            <article className="alert-card" key={alert.id}>
              <div className="alert-top">
                <div>
                  <strong>{alert.ticker}</strong>
                  <span>{alert.timeframe}</span>
                </div>
                <span className="badge badge-ok">{alert.status || "received"}</span>
              </div>
              <div className="alert-meta">
                <span>{formatPrice(alert.price)}</span>
                <span>{alert.signal}</span>
                <span>{formatTime(alert.timestamp)}</span>
              </div>
              {alert.range && (
                <div className="range-readout">
                  <div className="range-state">{rangeLabel(alert)}</div>
                  <div className="range-levels">
                    <span>H {formatLevel(alert.range.levels?.rangeHigh)}</span>
                    <span>M {formatLevel(alert.range.levels?.rangeMid)}</span>
                    <span>L {formatLevel(alert.range.levels?.rangeLow)}</span>
                    <span>ATR {formatLevel(alert.range.levels?.atrPercent)}%</span>
                  </div>
                  {alert.range.squeezeRisk !== "neutral" && <div className="range-risk">{alert.range.squeezeRisk}</div>}
                </div>
              )}
              <p>{alert.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="dashboard">
      <header className="hero">
        <div>
          <div className="kicker">Read-only MVP</div>
          <h1>TradingView Overview</h1>
          <p>Official TradingView widgets, secure alert intake, and a placeholder analysis path for AI later.</p>
        </div>
      </header>

      <TradingViewTickerTape symbols={tradingViewWatchlist.tickerTape} />

      <div className="main-grid">
        <section className="panel market-panel">
          <div className="panel-head">
            <div>
              <h2>Market Overview</h2>
              <p>Crypto and macro watchlist</p>
            </div>
          </div>
          <TradingViewMarketOverview tabs={tradingViewWatchlist.marketOverviewTabs} />
        </section>
        <LatestAlerts />
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Technical Analysis</h2>
            <p>BTCUSDT, ETHUSDT, SOLUSDT, SPY, QQQ, DXY</p>
          </div>
        </div>
        <div className="tech-grid">
          {tradingViewWatchlist.technicalAnalysis.map((item) => (
            <article className="tech-card" key={item.symbol}>
              <div className="tech-title">{item.label}</div>
              <TradingViewTechnicalAnalysis symbol={item.symbol} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
