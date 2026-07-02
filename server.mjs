import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { TradingViewAlertStore, tradingViewAlertSchema } from "./tradingview-alerts.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = normalize(join(__filename, ".."));
const distDir = join(__dirname, "dist");
const port = Number(process.env.PORT || 3000);
const dataDir = normalize(join(__dirname, process.env.DATA_DIR || "data"));
const tradingViewAlertStore = new TradingViewAlertStore({
  filePath: join(dataDir, "tradingview-alerts.json"),
  maxAlerts: Number(process.env.TRADINGVIEW_MAX_STORED_ALERTS || 50),
});

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

const send = (res, statusCode, body, contentType) => {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
};

const sendJson = (res, statusCode, payload) => {
  send(res, statusCode, JSON.stringify(payload), "application/json; charset=utf-8");
};

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let raw = "";

  req.on("data", (chunk) => {
    raw += chunk;
    if (raw.length > 1024 * 1024) {
      reject(new Error("Request body too large"));
      req.destroy();
    }
  });

  req.on("end", () => {
    try {
      resolve(raw ? JSON.parse(raw) : {});
    } catch {
      reject(new Error("Invalid JSON body"));
    }
  });

  req.on("error", reject);
});

const readTradingViewSecret = (req, url, body) => (
  req.headers["x-tradingview-secret"] ||
  url.searchParams.get("secret") ||
  body.secret ||
  ""
);

async function handleTradingViewApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/tradingview/alerts") {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 10, 1), 50);
    sendJson(res, 200, { alerts: await tradingViewAlertStore.latest(limit) });
    return true;
  }

  if (req.method !== "POST" || url.pathname !== "/api/tradingview/webhook") {
    return false;
  }

  const webhookSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET || "";
  if (!webhookSecret) {
    sendJson(res, 503, { error: "TradingView webhook secret is not configured" });
    return true;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return true;
  }

  if (readTradingViewSecret(req, url, body) !== webhookSecret) {
    sendJson(res, 401, { error: "Invalid TradingView webhook secret" });
    return true;
  }

  const parsed = tradingViewAlertSchema.safeParse(body);
  if (!parsed.success) {
    sendJson(res, 400, {
      error: "Invalid TradingView alert payload",
      details: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return true;
  }

  const alert = await tradingViewAlertStore.add(parsed.data);
  sendJson(res, 201, { ok: true, alert });
  return true;
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname.startsWith("/api/tradingview/") && await handleTradingViewApi(req, res, url)) {
      return;
    }

    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = normalize(join(distDir, pathname));

    if (!filePath.startsWith(distDir)) {
      send(res, 403, "Forbidden", "text/plain; charset=utf-8");
      return;
    }

    try {
      const file = await readFile(filePath);
      const ext = extname(filePath).toLowerCase();
      send(res, 200, file, MIME_TYPES[ext] || "application/octet-stream");
      return;
    } catch {
      const indexHtml = await readFile(join(distDir, "index.html"));
      send(res, 200, indexHtml, MIME_TYPES[".html"]);
    }
  } catch (error) {
    send(res, 500, `Server error: ${error.message}`, "text/plain; charset=utf-8");
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`TradingView Overview listening on http://0.0.0.0:${port}`);
});
