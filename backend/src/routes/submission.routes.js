import { Router } from 'express';
import {
  submitCode,
  runCode,
  getSubmission,
  getSubmissions,
} from '../controllers/submission.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { submissionLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/', protect, submissionLimiter, submitCode);
router.post('/run', protect, submissionLimiter, runCode);
router.get('/', protect, getSubmissions);
router.get('/:id', protect, getSubmission);

export default router;
