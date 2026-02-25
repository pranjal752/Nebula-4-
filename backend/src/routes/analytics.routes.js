import { Router } from 'express';
import { getPlatformOverview, getProblemAnalytics } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/overview', protect, requireAdmin, getPlatformOverview);
router.get('/problems', protect, requireAdmin, getProblemAnalytics);

export default router;
