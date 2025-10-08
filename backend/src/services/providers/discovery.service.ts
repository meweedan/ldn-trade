import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

export async function getTicketOffers() {
  try {
    // Prefer raw query to work even if Prisma model is missing
    const rows = await prisma.$queryRaw`
      SELECT id, title, origin, destination, price, currency, created_at
      FROM ticket_offers
      ORDER BY created_at DESC
      LIMIT 24
    `;
    return rows as any[];
  } catch {
    try {
      // Fallback to Prisma model if available
      const rows = await prisma.ticket_offers.findMany({ orderBy: { created_at: 'desc' }, take: 24 });
      return rows;
    } catch {
      return [];
    }
  }
}

export async function getPopularDestinations() {
  try {
    // Use raw SQL with explicit column names from migration (unquoted imageUrl becomes lowercase imageurl)
    const rows = await prisma.$queryRawUnsafe(
      `SELECT id, name, title, subtitle, imageurl AS "imageUrl", currency, created_at
       FROM popular_destinations
       ORDER BY created_at DESC
       LIMIT 24`
    );
    return rows as any[];
  } catch {
    // Fail-soft: return empty list to avoid 500s in content screens
    return [] as any[];
  }
}
