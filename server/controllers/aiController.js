// controllers/aiController.js
import Groq from 'groq-sdk';
import Session from '../models/Session.js';
import Interview from '../models/Interview.js';
import { buildQuestionPrompt, buildEvalPrompt } from '../utils/promptBuilder.js';

const getClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const setSSEHeaders = (res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
};

const sendEvent = (res, event, data) => {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

const safeParseJSON = (raw) => {
  let cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try { return JSON.parse(cleaned); } catch (_) {}

  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (_) {}
  }

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (_) {}
  }

  throw new Error('No valid JSON found in response');
};

// @desc    Generate a single interview question (streamed)
// @route   POST /api/ai/question
// @access  Private
export const generateQuestion = async (req, res) => {
  const { sessionId, jobRole, difficulty = 'medium', category = 'technical' } = req.body;

  if (!jobRole) return res.status(400).json({ success: false, message: 'jobRole is required' });

  let askedBefore = [];
  if (sessionId) {
    try {
      const session = await Session.findById(sessionId).populate('interviews', 'question');
      if (session) askedBefore = session.interviews.map(i => i.question);
    } catch (_) {}
  }

  const prompt = buildQuestionPrompt(jobRole, difficulty, category, askedBefore);
  setSSEHeaders(res);
  let fullQuestion = '';

  try {
    const stream = await getClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) { fullQuestion += text; sendEvent(res, 'delta', { text }); }
    }

    const question = fullQuestion.trim();
    let interviewId = null;

    if (sessionId) {
      try {
        const session = await Session.findById(sessionId);
        if (session && session.user.toString() === req.user._id.toString()) {
          const interview = await Interview.create({
            session: session._id,
            user: req.user._id,
            question,
            difficulty,
            category,
          });
          session.interviews.push(interview._id);
          session.totalQuestions = session.interviews.length;
          await session.save();
          interviewId = interview._id;
        }
      } catch (saveErr) { console.error('Failed to save question:', saveErr.message); }
    }

    sendEvent(res, 'done', { question, interviewId, difficulty, category });
    res.end();

  } catch (err) {
    console.error('generateQuestion error:', err.message);
    if (!res.headersSent) return res.status(500).json({ success: false, message: err.message });
    sendEvent(res, 'error', { message: err.message });
    res.end();
  }
};

// @desc    Evaluate a candidate's answer (streamed feedback)
// @route   POST /api/ai/evaluate
// @access  Private
export const evaluateAnswer = async (req, res) => {
  const { interviewId, answer } = req.body;

  if (!interviewId || !answer?.trim()) {
    return res.status(400).json({ success: false, message: 'interviewId and answer are required' });
  }

  const interview = await Interview.findById(interviewId).populate('session', 'jobRole');
  if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
  if (interview.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

  const jobRole = interview.session?.jobRole || 'Software Engineer';
  const prompt  = buildEvalPrompt(jobRole, interview.question, answer, interview.difficulty, interview.category);

  setSSEHeaders(res);
  let fullResponse = '';

  try {
    const stream = await getClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) { fullResponse += text; sendEvent(res, 'delta', { text }); }
    }

    let feedback = null;
    let score    = null;

    try {
      feedback = safeParseJSON(fullResponse);
      score    = feedback.score ?? null;
    } catch (parseErr) {
      console.error('Failed to parse AI feedback JSON:', parseErr.message);
    }

    try {
      interview.answer     = answer.trim();
      interview.aiFeedback = fullResponse.trim();
      if (score !== null) interview.score = score;
      interview.answeredAt = new Date();
      await interview.save();
      const session = await Session.findById(interview.session);
      if (session) await session.save();
    } catch (saveErr) { console.error('Failed to save feedback:', saveErr.message); }

    sendEvent(res, 'done', { feedback, score, interviewId, raw: feedback ? null : fullResponse });
    res.end();

  } catch (err) {
    console.error('evaluateAnswer error:', err.message);
    if (!res.headersSent) return res.status(500).json({ success: false, message: err.message });
    sendEvent(res, 'error', { message: err.message });
    res.end();
  }
};

// @desc    Get AI-suggested job roles
// @route   GET /api/ai/roles?q=
// @access  Private
export const suggestRoles = async (req, res) => {
  const { q = '' } = req.query;
  if (!q.trim()) return res.json({ success: true, data: [] });

  try {
    const completion = await getClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: `List exactly 5 real software engineering job roles that match "${q}". Respond with a JSON array of strings only, no explanation. Example: ["Role 1","Role 2"]` }],
      max_tokens: 200,
    });

    const text  = completion.choices[0]?.message?.content?.trim() || '[]';
    const match = text.match(/\[[\s\S]*\]/);
    const roles = match ? JSON.parse(match[0]) : [];
    res.json({ success: true, data: Array.isArray(roles) ? roles : [] });
  } catch (err) {
    console.error('suggestRoles error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Analyse a resume against a job role
// @route   POST /api/ai/resume
// @access  Private
export const analyseResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Resume file is required' });

    const jobRole = req.body.jobRole?.trim() || 'Software Engineer';

    const { default: parseResume } = await import('../utils/parseResume.js');
    const { buildResumePrompt }    = await import('../utils/promptBuilder.js');

    const resumeText = await parseResume(req.file.buffer);

    if (!resumeText || resumeText.length < 10) {
      return res.status(400).json({ success: false, message: 'Could not extract text from file.' });
    }

    const prompt = buildResumePrompt(resumeText, jobRole);

    // response_format forces Groq to return pure JSON — no extra text
    const completion = await getClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON API. You only respond with valid JSON objects. Never include any text, explanation, or markdown outside the JSON object. Always start your response with { and end with }.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';

    let analysis;
    try {
      analysis = safeParseJSON(raw);
    } catch (err) {
      console.error('Resume JSON parse failed. Raw:', raw.slice(0, 200));
      return res.status(500).json({ success: false, message: 'AI did not return valid JSON. Try again.' });
    }

    res.json({ success: true, data: analysis });

  } catch (err) {
    console.error('analyseResume error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};