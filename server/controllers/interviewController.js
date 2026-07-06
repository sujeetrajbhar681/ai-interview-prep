import Session from '../models/Session.js';
import Interview from '../models/Interview.js';
import User from '../models/User.js';

// ── Sessions ───────────────────────────────────────────────

// @desc    Create a new session
// @route   POST /api/interviews/sessions
// @access  Private
export const createSession = async (req, res) => {
  try {
    const { jobRole } = req.body;

    if (!jobRole || !jobRole.trim()) {
      return res.status(400).json({ success: false, message: 'Job role is required' });
    }

    const session = await Session.create({
      user: req.user._id,
      jobRole: jobRole.trim(),
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all sessions for the logged-in user
// @route   GET /api/interviews/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    const { status, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('interviews', 'score category difficulty answeredAt'),
      Session.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: sessions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: sessions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get a single session with full interview detail
// @route   GET /api/interviews/sessions/:id
// @access  Private
export const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate(
      'interviews',
      'question answer aiFeedback score difficulty category answeredAt createdAt'
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Ownership check
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update session status or jobRole
// @route   PUT /api/interviews/sessions/:id
// @access  Private
export const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { status, jobRole } = req.body;
    if (status) session.status = status;
    if (jobRole) session.jobRole = jobRole.trim();

    // Mark completedAt when session is completed
    if (status === 'completed' && !session.completedAt) {
      session.completedAt = new Date();
    }

    await session.save(); // triggers pre-save score hook

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a session and all its interviews
// @route   DELETE /api/interviews/sessions/:id
// @access  Private
export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete all child interviews first
    await Interview.deleteMany({ session: session._id });
    await session.deleteOne();

    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Interviews (within a session) ─────────────────────────

// @desc    Add an interview question to a session
// @route   POST /api/interviews/sessions/:sessionId/questions
// @access  Private
export const addQuestion = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { question, difficulty = 'medium', category = 'technical' } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const interview = await Interview.create({
      session: session._id,
      user: req.user._id,
      question: question.trim(),
      difficulty,
      category,
    });

    // Link interview to session
    session.interviews.push(interview._id);
    session.totalQuestions = session.interviews.length;
    await session.save();

    res.status(201).json({ success: true, data: interview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit an answer + store AI feedback and score
// @route   PUT /api/interviews/questions/:id/answer
// @access  Private
export const submitAnswer = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { answer, aiFeedback, score } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: 'Answer is required' });
    }

    interview.answer = answer.trim();
    if (aiFeedback) interview.aiFeedback = aiFeedback;
    if (score !== undefined) interview.score = score;
    interview.answeredAt = new Date();

    await interview.save();

    // Recalculate parent session score
    const session = await Session.findById(interview.session);
    if (session) await session.save(); // triggers pre-save hook

    res.json({ success: true, data: interview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user stats for the dashboard
// @route   GET /api/interviews/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalSessions, completedSessions, allInterviews] = await Promise.all([
      Session.countDocuments({ user: userId }),
      Session.countDocuments({ user: userId, status: 'completed' }),
      Interview.find({ user: userId, score: { $ne: null } }).select('score category createdAt'),
    ]);

    const avgScore =
      allInterviews.length > 0
        ? Math.round(
            (allInterviews.reduce((sum, i) => sum + i.score, 0) / allInterviews.length) * 10
          ) / 10
        : 0;

    // Score trend — last 7 completed sessions
    const recentSessions = await Session.find({
      user: userId,
      status: 'completed',
      overallScore: { $ne: null },
    })
      .sort('-completedAt')
      .limit(7)
      .select('jobRole overallScore completedAt');

    // Breakdown by category
    const categoryBreakdown = allInterviews.reduce((acc, i) => {
      if (!acc[i.category]) acc[i.category] = { total: 0, scoreSum: 0 };
      acc[i.category].total += 1;
      acc[i.category].scoreSum += i.score;
      return acc;
    }, {});

    const categoryStats = Object.entries(categoryBreakdown).map(([cat, data]) => ({
      category: cat,
      count: data.total,
      avgScore: Math.round((data.scoreSum / data.total) * 10) / 10,
    }));

    res.json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        totalAnswered: allInterviews.length,
        avgScore,
        recentSessions: recentSessions.reverse(), // oldest first for chart
        categoryStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};