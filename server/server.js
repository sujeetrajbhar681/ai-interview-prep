import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import connectDB       from './config/db.js';
import authRoutes      from './routes/auth.js';
import interviewRoutes from './routes/interviews.js';
import aiRoutes        from './routes/ai.js';
import adminRoutes     from './routes/admin.js';
import errorHandler    from './middleware/errorHandler.js';

connectDB();

const app = express();

// ── CORS ───────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Body parsing — skip for file uploads ──────────────────
app.use((req, res, next) => {
  if (req.path === '/api/ai/resume') return next();
  express.json()(req, res, next);
});
app.use((req, res, next) => {
  if (req.path === '/api/ai/resume') return next();
  express.urlencoded({ extended: false })(req, res, next);
});

// ── Logging ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Rate limiting ──────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, try again later' },
});

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/ai',         aiRoutes);
app.use('/api/admin',      adminRoutes);

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ───────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});