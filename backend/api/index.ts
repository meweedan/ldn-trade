import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import app from "../src/index";

// Allow both the hosted FE and local dev
const ALLOWED = new Set([
  "https://ldn-trade.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function setCors(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string) || "";
  if (origin && ALLOWED.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Requested-With,sentry-trace,baggage,x-client"
  );
  res.setHeader("Vary", "Origin");
}

const handler = serverless(app, {
  // adds x-request-id if present (useful in logs)
  requestId: "x-request-id",
});

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle preflight at the function layer so we never 405/500 OPTIONS
    if (req.method === "OPTIONS") {
      setCors(req, res);
      res.status(204).end();
      return;
    }

    // Add CORS for actual requests too (Express also sets CORS, but this guarantees it)
    setCors(req, res);

    // Hand off to Express
    return handler(req as any, res as any);
  } catch (err: any) {
    console.error("Top-level API crash:", err?.stack || err);
    try { setCors(req, res); } catch {}
    res.status(500).json({ ok: false, error: "server_error", message: err?.message || "Internal error" });
  }
}

// Optional but useful on Vercel Node functions
export const maxDuration = 60;
