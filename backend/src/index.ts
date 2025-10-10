import express from "express";
import * as Sentry from "@sentry/node";
import axios from "axios";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import apiRoutes from "./routes/index";
import prisma from "./config/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------------- Sentry ---------------- */
Sentry.init({
  dsn: "https://6930c42c9841e3c477e1a8be0c1b7518@o4510122251517952.ingest.de.sentry.io/4510122267705424",
  sendDefaultPii: true,
});

/* ---------------- Express baseline ---------------- */
app.set("etag", false);
app.set("trust proxy", 1); // behind Vercel proxy

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

if (process.env.NODE_ENV !== "test" && process.env.DISABLE_RATE_LIMIT !== "1") {
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
}

/* ---------------- CORS (permissive to unblock) ---------------- */
// Reflect any Origin and allow credentials; tighten later if needed
const corsOptions: cors.CorsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  res.setHeader("Vary", "Origin");
  next();
});

app.use(cors(corsOptions));

/* ---------------- Body/cookies/logs ---------------- */
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* ---------------- Static uploads ---------------- */
// Only serve static files locally, not on Vercel
if (!process.env.VERCEL) {
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  app.use(
    "/api/uploads",
    (req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(uploadsDir)
  );
}

/* ---------------- Sentry tunnel (CORS + raw) ---------------- */
// Handle preflight explicitly for the tunnel (some adblockers get picky)
app.options("/monitoring", cors(corsOptions));
app.use(
  "/monitoring",
  express.raw({ type: "*/*", limit: "1mb" }),
  async (req, res) => {
    try {
      const dsn = process.env.SENTRY_DSN || "";
      const match = dsn.match(/^https?:\/\/([^@]+)@([^/]+)\/([^\s]+)$/);
      const publicKey = match ? match[1].split(":")[0] : "6930c42c9841e3c477e1a8be0c1b7518";
      const host = match ? match[2] : "o4510122251517952.ingest.de.sentry.io";
      const projectId = match ? match[3] : "4510122267705424";
      const url = `https://${host}/api/${projectId}/envelope/?sentry_version=7&sentry_key=${publicKey}`;

      await axios.post(url, req.body, {
        headers: { "Content-Type": "application/x-sentry-envelope" },
        timeout: 5000,
        maxBodyLength: Infinity,
      });

      // Mirror CORS success for the tunnel too
      res.setHeader("Access-Control-Allow-Credentials", "true");
      const origin = (req.headers.origin as string) || "";
      if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
      return res.status(200).end("OK");
    } catch {
      // Don’t break the app if monitoring fails
      return res.status(204).end();
    }
  }
);

/* ---------------- Routes ---------------- */
app.use("", apiRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/db-check", async (_req, res) => {
  try {
    const nowRows = await prisma.$queryRaw<any[]>`SELECT now() as now`;
    const dbRows = await prisma.$queryRaw<any[]>`SELECT current_database() as db`;
    res.json({ ok: true, now: nowRows?.[0]?.now ?? null, database: dbRows?.[0]?.db ?? null });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "db error" });
  }
});

/* ---------------- Errors ---------------- */
app.use(errorHandler);

/* ---------------- Local only: listen ---------------- */
let server: any;
if (!process.env.VERCEL && process.env.NODE_ENV !== "test" && process.env.DISABLE_RATE_LIMIT !== "1") {
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  // Tune timeouts for local/dev
  // @ts-ignore
  server.keepAliveTimeout = 65000;
  // @ts-ignore
  server.headersTimeout = 66000;
  // @ts-ignore
  server.requestTimeout = 0;
}

/* ---------------- Graceful shutdown ---------------- */
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down...`);
  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error("Error disconnecting Prisma:", e);
  } finally {
    if (server) {
      server.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
    setTimeout(() => process.exit(0), 5000).unref();
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
