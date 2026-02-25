import { Router } from 'express';
import {
  getProblems,
  getProblemBySlug,
  getAllTags,
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemSubmissions,
} from '../controllers/problem.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// Public / Optional auth
router.get('/', optionalAuth, getProblems);
router.get('/tags', getAllTags);
router.get('/:slug', optionalAuth, getProblemBySlug);

// Protected
router.get('/:slug/my-submissions', protect, getProblemSubmissions);

// Admin only
router.post('/', protect, requireAdmin, createProblem);
router.put('/:id', protect, requireAdmin, updateProblem);
router.delete('/:id', protect, requireAdmin, deleteProblem);

export default router;
