export const tradingViewWatchlist = {
  // Edit symbols here. The ticker tape, market overview, and technical widgets read from this config.
  tickerTape: [
    { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
    { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
    { proName: "BINANCE:SOLUSDT", title: "Solana" },
    { proName: "AMEX:SPY", title: "SPY" },
    { proName: "NASDAQ:QQQ", title: "QQQ" },
    { proName: "TVC:DXY", title: "DXY" },
  ],
  marketOverviewTabs: [
    {
      title: "Crypto",
      symbols: [
        { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
        { s: "BINANCE:ETHUSDT", d: "Ethereum" },
        { s: "BINANCE:SOLUSDT", d: "Solana" },
        { s: "CRYPTOCAP:TOTAL", d: "Total Market Cap" },
        { s: "CRYPTOCAP:BTC.D", d: "BTC Dominance" },
      ],
    },
    {
      title: "Markets",
      symbols: [
        { s: "AMEX:SPY", d: "SPY" },
        { s: "NASDAQ:QQQ", d: "QQQ" },
        { s: "TVC:DXY", d: "DXY" },
        { s: "TVC:US10Y", d: "US 10Y" },
        { s: "CBOE:VIX", d: "VIX" },
      ],
    },
  ],
  technicalAnalysis: [
    { symbol: "BINANCE:BTCUSDT", label: "BTCUSDT" },
    { symbol: "BINANCE:ETHUSDT", label: "ETHUSDT" },
    { symbol: "BINANCE:SOLUSDT", label: "SOLUSDT" },
    { symbol: "AMEX:SPY", label: "SPY" },
    { symbol: "NASDAQ:QQQ", label: "QQQ" },
    { symbol: "TVC:DXY", label: "DXY" },
  ],
};
