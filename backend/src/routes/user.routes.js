import { Router } from 'express';
import {
  getPublicProfile,
  updateProfile,
  changePassword,
  getUserSubmissions,
  getUserStats,
  getAllUsers,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// Admin only
router.get('/', protect, requireAdmin, getAllUsers);

// Public
router.get('/:username', getPublicProfile);
router.get('/:username/submissions', getUserSubmissions);
router.get('/:username/stats', getUserStats);

// Protected
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
