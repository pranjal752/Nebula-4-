import { Router } from 'express';
import {
  getContests,
  getContestBySlug,
  registerForContest,
  getContestLeaderboard,
  createContest,
  updateContest,
} from '../controllers/contest.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/', optionalAuth, getContests);
router.get('/:slug', optionalAuth, getContestBySlug);
router.get('/:id/leaderboard', getContestLeaderboard);

// Protected
router.post('/:id/register', protect, registerForContest);

// Admin
router.post('/', protect, requireAdmin, createContest);
router.put('/:id', protect, requireAdmin, updateContest);

export default router;
