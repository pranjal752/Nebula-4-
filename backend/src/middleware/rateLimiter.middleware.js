import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => sendError(res, message, 429),
  });

// Auth endpoints: 10 requests per 15 minutes
export const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts. Please try again after 15 minutes.'
);

// Submission: 30 submissions per minute
export const submissionLimiter = createLimiter(
  60 * 1000,
  30,
  'Too many submissions. Please wait before submitting again.'
);

// General API: 200 requests per minute
export const apiLimiter = createLimiter(
  60 * 1000,
  200,
  'Too many requests. Please slow down.'
);
