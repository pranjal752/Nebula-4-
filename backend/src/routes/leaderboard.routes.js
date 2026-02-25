import { Router } from 'express';
import {
  getGlobalLeaderboard,
  getMyRank,
  getCountryLeaderboard,
} from '../controllers/leaderboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getGlobalLeaderboard);
router.get('/me', protect, getMyRank);
router.get('/country/:country', getCountryLeaderboard);

export default router;
