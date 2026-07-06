// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// Stricter limit for AI routes — each request hits the Claude API and costs tokens
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute window
  max: 10,                    // 10 AI requests per minute per IP
  message: {
    success: false,
    message: 'Too many AI requests. Please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});