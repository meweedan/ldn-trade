import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import app from "../src/index"; // <-- uses your existing express app (no app.listen)

const handler = serverless(app);

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  // if you need raw body for /monitoring, serverless-http preserves it with express.raw
  return handler(req as any, res as any);
}
