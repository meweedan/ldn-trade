// backend/src/config/prisma.ts
import { PrismaClient } from "@prisma/client";

// prevent hot re-instantiation in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ['query', 'error', 'warn'] // enable if needed
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
