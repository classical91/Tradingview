# TradingView Overview MVP

Read-only TradingView dashboard and alert receiver.

## What It Does

- Embeds official TradingView widgets only.
- Provides a secure webhook at `/api/tradingview/webhook`.
- Validates alert JSON with Zod.
- Stores recent alerts locally in `data/tradingview-alerts.json`.
- Shows the latest alerts on the dashboard.
- Includes a Pine Script alert generator in `pine/tradingview-alert-mvp.pine`.

## Local Run

```powershell
npm install
npm run build
$env:TRADINGVIEW_WEBHOOK_SECRET='dev-secret'
npm start
```

Open `http://127.0.0.1:3000`.

## Pine Script Setup

1. Open TradingView Pine Editor.
2. Paste `pine/tradingview-alert-mvp.pine`.
3. Add it to a chart.
4. Set `Webhook secret` to match `TRADINGVIEW_WEBHOOK_SECRET`.
5. Create an alert using “Any alert() function call”.
6. Set the webhook URL to:

```text
https://your-domain.example/api/tradingview/webhook
```

TradingView does not need custom request headers for this MVP. The Pine Script sends the secret in the JSON body as `secret`, and the server validates it.

## Alert Payload

The Pine Script sends JSON shaped like:

```json
{
  "secret": "dev-secret",
  "ticker": "BTCUSDT",
  "timeframe": "1h",
  "price": 61200,
  "signal": "breakout",
  "rsi": 68,
  "funding": "not_available_in_pine",
  "openInterest": "not_available_in_pine",
  "message": "BTCUSDT breakout on 1h",
  "timestamp": "2026-07-01T12:00:00Z"
}
```

## Extension Points

- Edit dashboard symbols in `src/tradingViewConfig.js`.
- Add more official widget wrappers in `src/TradingViewWidget.jsx`.
- Connect OpenAI or Claude later in `tradingview-alerts.mjs`.
- Replace local JSON storage in `TradingViewAlertStore` with a database adapter.

This MVP does not scrape TradingView, automate a browser, place trades, or run auto-trading logic.
