import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  createSession,
  getSessions,
  getSession,
  updateSession,
  deleteSession,
  addQuestion,
  submitAnswer,
  getStats,
} from '../controllers/interviewController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// ── Session routes ─────────────────────────────────────────
router.route('/sessions')
  .post(
    body('jobRole').trim().notEmpty().withMessage('Job role is required'),
    createSession
  )
  .get(getSessions);

router.route('/sessions/:id')
  .get(getSession)
  .put(updateSession)
  .delete(deleteSession);

// ── Question routes ────────────────────────────────────────
router.post(
  '/sessions/:sessionId/questions',
  body('question').trim().notEmpty().withMessage('Question text is required'),
  addQuestion
);

router.put('/questions/:id/answer', submitAnswer);

// ── Stats ──────────────────────────────────────────────────
router.get('/stats', getStats);

export default router;