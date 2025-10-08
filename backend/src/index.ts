import express from 'express';
import * as Sentry from '@sentry/node';
import axios from 'axios';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes/index';
import prisma from './config/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Sentry init (no-op if DSN not provided)
Sentry.init({
  dsn: "https://6930c42c9841e3c477e1a8be0c1b7518@o4510122251517952.ingest.de.sentry.io/4510122267705424",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

// Middleware
app.set('etag', false);
// Allow cross-origin resource embedding (images) from the web app on :3000
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));
if (process.env.NODE_ENV !== 'test' && process.env.DISABLE_RATE_LIMIT !== '1') {
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
}
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static uploads (for admin media) - mount BEFORE API routes so they bypass any /api middleware
const uploadsDir = path.resolve(process.cwd(), 'uploads');
// Ensure CORP header specifically on uploads to allow cross-origin <img> embedding
app.use('/api/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDir));

// Sentry tunnel to bypass ad-blockers
// Accept raw envelope body and forward to Sentry's envelope endpoint
app.use('/monitoring', express.raw({ type: '*/*', limit: '1mb' }), async (req, res) => {
  try {
    const dsn = process.env.SENTRY_DSN || '';
    const match = dsn.match(/^https?:\/\/([^@]+)@([^/]+)\/([^\s]+)$/);
    // Fallback to direct values if DSN is not set but hardcoded was used earlier
    const publicKey = match ? match[1].split(':')[0] : '6930c42c9841e3c477e1a8be0c1b7518';
    const host = match ? match[2] : 'o4510122251517952.ingest.de.sentry.io';
    const projectId = match ? match[3] : '4510122267705424';
    const url = `https://${host}/api/${projectId}/envelope/?sentry_version=7&sentry_key=${publicKey}`;

    await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
      timeout: 5000,
      // send raw bytes
      maxBodyLength: Infinity,
    });
    return res.status(200).end('OK');
  } catch (err) {
    // Do not break app on monitoring failure
    return res.status(204).end();
  }
});

// API Routes
app.use('', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
let server: any;
if (process.env.NODE_ENV !== 'test' && process.env.DISABLE_RATE_LIMIT !== '1') {
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Tune HTTP timeouts to avoid premature disconnects during heavy refresh
// Keep-Alive slightly below common proxies (e.g., 75s) and align headers timeout
// @ts-ignore - Node types may vary by version
if (server) {
  server.keepAliveTimeout = 65000; // 65s
  // @ts-ignore
  server.headersTimeout = 66000; // must be > keepAliveTimeout
  // @ts-ignore
  server.requestTimeout = 0; // disable per-request inactivity timeout
}

const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down...`);
  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error('Error disconnecting Prisma:', e);
  } finally {
    if (server) {
      server.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
    // Force-exit if close hangs
    setTimeout(() => process.exit(0), 5000).unref();
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default app;
