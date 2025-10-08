import { Router } from 'express';
import { getRecommendedRoutes, getPopularTrips, getCitySuggestions, getAirlines } from '../controllers/content.controller';
import { getTicketOffers, getPopularDestinations } from '../services/providers/discovery.service';
import prisma from '../config/prisma';

const router = Router();

// Content
router.get('/content/recommended-routes', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, getRecommendedRoutes);
router.get('/content/popular-trips', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); }, getPopularTrips);

// Marketing banners (DB-backed)
router.get('/content/banners', async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, image_url, title, subtitle, badge, href, created_at
       FROM banners
       ORDER BY created_at DESC
       LIMIT 24`
    );
    const data = (rows || []).map((r) => ({
      id: r.id,
      imageUrl: r.image_url,
      title: r.title,
      subtitle: r.subtitle,
      badge: r.badge,
      href: r.href,
    }));
    return res.json({ data });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load banners' });
  }
});

// Offers
router.get('/offers/tickets', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const data = await getTicketOffers();
    res.json({ data });
  } catch {
    res.status(500).json({ message: 'Failed to load ticket offers' });
  }
});

// Destinations
router.get('/destinations/popular', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const data = await getPopularDestinations();
    res.json({ data });
  } catch {
    res.status(500).json({ message: 'Failed to load popular destinations' });
  }
});

// Backward-compatible alias
router.get('/popular_destinations', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const data = await getPopularDestinations();
    res.json({ data });
  } catch {
    res.status(500).json({ message: 'Failed to load popular destinations' });
  }
});

// Suggestions
router.get('/suggest/cities', getCitySuggestions);
router.get('/suggest/airlines', getAirlines);

export default router;
