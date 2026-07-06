import express from 'express';
import { protect }   from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import upload        from '../middleware/upload.js';
import {
  generateQuestion,
  evaluateAnswer,
  suggestRoles,
  analyseResume,
} from '../controllers/aiController.js';

const router = express.Router();

router.use(protect);
router.use(aiLimiter);

router.post('/question', generateQuestion);
router.post('/evaluate', evaluateAnswer);
router.get('/roles',     suggestRoles);
router.post('/resume',   upload.single('resume'), analyseResume);

export default router;