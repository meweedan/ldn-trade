import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import app from "../src/index";
const handler = serverless(app);
export default async function (req: VercelRequest, res: VercelResponse) {
  return handler(req as any, res as any);
}
