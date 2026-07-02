import { useEffect, useMemo, useRef } from "react";

const EMBED_BASE = "https://s3.tradingview.com/external-embedding/";

function TradingViewWidget({ scriptName, options, className = "" }) {
  const containerRef = useRef(null);
  const stableOptions = useMemo(() => options, [options]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widgetContainer.appendChild(widget);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `${EMBED_BASE}${scriptName}`;
    script.text = JSON.stringify(stableOptions);
    widgetContainer.appendChild(script);

    container.appendChild(widgetContainer);
  }, [scriptName, stableOptions]);

  return <div ref={containerRef} className={className} />;
}

export function TradingViewTickerTape({ symbols }) {
  const options = useMemo(() => ({
    symbols,
    showSymbolLogo: true,
    colorTheme: "dark",
    isTransparent: false,
    displayMode: "adaptive",
    locale: "en",
  }), [symbols]);

  return <TradingViewWidget className="tv-widget tv-widget-strip" scriptName="embed-widget-ticker-tape.js" options={options} />;
}

export function TradingViewMarketOverview({ tabs }) {
  const options = useMemo(() => ({
    colorTheme: "dark",
    dateRange: "12M",
    showChart: true,
    locale: "en",
    width: "100%",
    height: "100%",
    isTransparent: false,
    showSymbolLogo: true,
    showFloatingTooltip: false,
    tabs,
  }), [tabs]);

  return <TradingViewWidget className="tv-widget tv-widget-market" scriptName="embed-widget-market-overview.js" options={options} />;
}

export function TradingViewTechnicalAnalysis({ symbol }) {
  const options = useMemo(() => ({
    interval: "1h",
    width: "100%",
    isTransparent: false,
    height: "100%",
    symbol,
    showIntervalTabs: true,
    displayMode: "single",
    locale: "en",
    colorTheme: "dark",
  }), [symbol]);

  return <TradingViewWidget className="tv-widget tv-widget-technical" scriptName="embed-widget-technical-analysis.js" options={options} />;
}

// Add more official TradingView widget wrappers here when the MVP grows.
