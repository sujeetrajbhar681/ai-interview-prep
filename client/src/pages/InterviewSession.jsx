import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import useStream from '../hooks/useStream';
import toast from 'react-hot-toast';

const scoreColor = s => s >= 8 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';
const scoreBg    = s => s >= 8 ? 'rgba(16,185,129,0.12)' : s >= 5 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';

const FeedbackPanel = ({ feedback, raw, done }) => {
  if (!done && !raw) return null;
  if (!done && raw) return (
    <div className="glass-accent anim-fade-in" style={{ padding: 24, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span className="spin" style={{ width: 14, height: 14, color: '#a5a0ff' }} />
        <span style={{ fontSize: 12, color: '#a5a0ff', fontWeight: 500 }}>Analysing your answer...</span>
      </div>
      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#5a6080', lineHeight: 1.7 }}>{raw}</p>
    </div>
  );
  if (!feedback) return (
    <div className="glass anim-scale-in" style={{ padding: 24, marginTop: 16 }}>
      <p style={{ fontSize: 13, color: '#8b93b8', lineHeight: 1.7 }}>{raw}</p>
    </div>
  );
  return (
    <div className="anim-scale-in" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Score + summary */}
      <div className="glass-accent" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: '#c5c2ff', lineHeight: 1.65, flex: 1 }}>{feedback.summary}</p>
          <div style={{ textAlign: 'center', flexShrink: 0, background: scoreBg(feedback.score), border: `1px solid ${scoreColor(feedback.score)}40`, borderRadius: 14, padding: '10px 18px' }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: scoreColor(feedback.score), letterSpacing: '-0.03em', lineHeight: 1 }}>{feedback.score}</p>
            <p style={{ fontSize: 10, color: '#5a6080', marginTop: 2 }}>/ 10</p>
          </div>
        </div>
        {/* Score bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(feedback.score/10)*100}%`, background: `linear-gradient(90deg, ${scoreColor(feedback.score)}, ${scoreColor(feedback.score)}99)`, borderRadius: 99, transition: 'width 1.2s cubic-bezier(.16,1,.3,1)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {feedback.strengths?.length > 0 && (
          <div className="glass" style={{ padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>✓ Strengths</p>
            {feedback.strengths.map((s,i) => <p key={i} style={{ fontSize: 13, color: '#8b93b8', lineHeight: 1.55, marginBottom: 6, display: 'flex', gap: 6 }}><span style={{ color: '#10b981', flexShrink: 0 }}>•</span>{s}</p>)}
          </div>
        )}
        {feedback.improvements?.length > 0 && (
          <div className="glass" style={{ padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>↑ Improve</p>
            {feedback.improvements.map((s,i) => <p key={i} style={{ fontSize: 13, color: '#8b93b8', lineHeight: 1.55, marginBottom: 6, display: 'flex', gap: 6 }}><span style={{ color: '#f59e0b', flexShrink: 0 }}>•</span>{s}</p>)}
          </div>
        )}
      </div>

      {feedback.modelAnswer && (
        <div className="glass" style={{ padding: 20, borderLeft: '2px solid rgba(108,99,255,0.5)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#a5a0ff', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>💡 Model Answer</p>
          <p style={{ fontSize: 13, color: '#8b93b8', lineHeight: 1.7 }}>{feedback.modelAnswer}</p>
        </div>
      )}

      {feedback.tips && (
        <div style={{ padding: '14px 18px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#a5a0ff' }}>Pro tip: </span>
          <span style={{ fontSize: 13, color: '#8b93b8' }}>{feedback.tips}</span>
        </div>
      )}
    </div>
  );
};

const InterviewSession = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { stream } = useStream();
  const state = location.state || {};
  const jobRole = state.jobRole || 'Software Engineer';
  const difficulty = state.difficulty || 'medium';
  const category = state.category || 'technical';

  const [question, setQuestion]       = useState('');
  const [questionId, setQuestionId]   = useState(null);
  const [qDone, setQDone]             = useState(false);
  const [loadingQ, setLoadingQ]       = useState(false);
  const [answer, setAnswer]           = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [feedbackRaw, setFeedbackRaw] = useState('');
  const [feedbackData, setFeedbackData] = useState(null);
  const [fDone, setFDone]             = useState(false);
  const [loadingF, setLoadingF]       = useState(false);
  const [qNum, setQNum]               = useState(1);
  const [scores, setScores]           = useState([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [completing, setCompleting]   = useState(false);
  const answerRef = useRef();
  const feedbackRef = useRef();

  const genQuestion = useCallback(async () => {
    setQuestion(''); setQuestionId(null); setQDone(false);
    setAnswer(''); setFeedbackRaw(''); setFeedbackData(null); setFDone(false);
    setLoadingQ(true);
    await stream('/api/ai/question', { sessionId: id, jobRole, difficulty, category }, {
      onDelta: t => setQuestion(q => q + t),
      onDone: d => { setQuestionId(d.interviewId); setQDone(true); setLoadingQ(false); setTimeout(() => answerRef.current?.focus(), 100); },
      onError: m => { toast.error(m || 'Failed to generate question'); setLoadingQ(false); },
    });
  }, [id, jobRole, difficulty, category, stream]);

  useEffect(() => { genQuestion(); }, []);
  useEffect(() => { if (loadingF) feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [loadingF]);

  const handleSubmit = async () => {
    if (!answer.trim()) return toast.error('Write an answer first');
    if (!questionId) return toast.error('Question not ready');
    setSubmitting(true); setLoadingF(true); setFeedbackRaw(''); setFeedbackData(null); setFDone(false);
    await stream('/api/ai/evaluate', { interviewId: questionId, answer }, {
      onDelta: t => setFeedbackRaw(f => f + t),
      onDone: d => { setFeedbackData(d.feedback); setFDone(true); setLoadingF(false); setSubmitting(false); if (d.score != null) setScores(s => [...s, d.score]); },
      onError: m => { toast.error(m || 'Evaluation failed'); setLoadingF(false); setSubmitting(false); },
    });
  };

  const handleNext = () => { setQNum(n => n + 1); genQuestion(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleComplete = async () => {
    setCompleting(true);
    try { await api.put(`/interviews/sessions/${id}`, { status: 'completed' }); setSessionDone(true); }
    catch { toast.error('Failed to complete session'); }
    finally { setCompleting(false); }
  };

  const avg = scores.length ? Math.round((scores.reduce((a,b) => a+b, 0) / scores.length) * 10) / 10 : null;

  if (sessionDone) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
      <div className="anim-scale-in" style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🎉</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.03em', marginBottom: 8 }}>Session Complete!</h1>
        <p style={{ fontSize: 15, color: '#5a6080', marginBottom: 28 }}>You answered {scores.length} question{scores.length !== 1 ? 's' : ''}</p>

        {avg !== null && (
          <div className="glass-accent" style={{ padding: 28, marginBottom: 28 }}>
            <p style={{ fontSize: 12, color: '#5a6080', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Average Score</p>
            <p style={{ fontSize: 52, fontWeight: 800, color: scoreColor(avg), letterSpacing: '-0.04em', lineHeight: 1 }}>{avg}<span style={{ fontSize: 24, color: '#3d4466' }}>/10</span></p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
              {scores.map((s,i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: 10, background: scoreBg(s), border: `1px solid ${scoreColor(s)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: scoreColor(s) }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/interview/new')} className="btn btn-ghost" style={{ flex: 1 }}>New Session</button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ flex: 1 }}>Dashboard →</button>
        </div>
      </div>
    </div>
  );

  const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' }[difficulty] || '#a5a0ff';

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '36px 24px', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'rgba(108,99,255,0.12)', color: '#a5a0ff', borderColor: 'rgba(108,99,255,0.3)' }}>{jobRole}</span>
          <span className="badge" style={{ background: `${diffColor}1a`, color: diffColor, borderColor: `${diffColor}40` }}>{difficulty}</span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: '#5a6080', borderColor: 'rgba(255,255,255,0.07)' }}>{category}</span>
          <span style={{ fontSize: 12, color: '#3d4466' }}>Q{qNum}</span>
        </div>
        {avg !== null && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#3d4466', marginBottom: 2 }}>avg score</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: scoreColor(avg), letterSpacing: '-0.02em' }}>{avg}/10</p>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="glass-accent anim-fade-up d1" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,rgba(108,99,255,0.25),rgba(34,211,238,0.15))', border: '1px solid rgba(108,99,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#a5a0ff', flexShrink: 0 }}>Q</div>
          <div style={{ flex: 1, minHeight: 52 }}>
            {loadingQ && !question && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
                <span className="spin" style={{ width: 14, height: 14, color: '#6c63ff' }} />
                <span style={{ fontSize: 13, color: '#5a6080' }}>Generating question...</span>
              </div>
            )}
            {question && (
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 16, color: '#eef0ff', lineHeight: 1.65, letterSpacing: '-0.01em' }}>
                {question}
                {!qDone && <span className="cursor" />}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Answer */}
      {qDone && !fDone && (
        <div className="glass anim-fade-up" style={{ padding: 24, marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#5a6080', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Your Answer</label>
          <textarea ref={answerRef} value={answer} onChange={e => setAnswer(e.target.value)}
            rows={7} disabled={submitting || loadingF}
            placeholder="Type your answer here. Be thorough — include examples, explain your reasoning, and structure your thoughts clearly."
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 16px', color: '#eef0ff', fontSize: 14, fontFamily: 'Inter', lineHeight: 1.65, outline: 'none', resize: 'vertical', transition: 'border-color 0.2s, box-shadow 0.2s' }}
            onFocus={e => { e.target.style.borderColor = '#6c63ff'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
            <span style={{ fontSize: 12, color: '#3d4466' }}>{answer.length} chars</span>
            <button onClick={handleSubmit} disabled={submitting || loadingF || !answer.trim()}
              className="btn btn-primary" style={{ width: 'auto', padding: '11px 24px', fontSize: 14 }}>
              {submitting || loadingF ? <><span className="spin" style={{ width: 14, height: 14 }} />Evaluating...</> : '✓ Submit Answer'}
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {(loadingF || feedbackRaw || feedbackData) && (
        <div ref={feedbackRef} className="anim-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,rgba(108,99,255,0.25),rgba(34,211,238,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#a5a0ff' }}>AI</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#8b93b8' }}>Feedback</span>
          </div>
          <FeedbackPanel feedback={feedbackData} raw={feedbackRaw} done={fDone} />
        </div>
      )}

      {/* Actions */}
      {fDone && (
        <div className="anim-fade-up" style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={handleNext} className="btn btn-primary" style={{ flex: 1, minWidth: 160 }}>Next Question →</button>
          <button onClick={handleComplete} disabled={completing} className="btn btn-ghost" style={{ flex: 1, minWidth: 160 }}>
            {completing ? <><span className="spin" style={{ width: 14, height: 14 }} />Finishing...</> : '✓ Finish Session'}
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewSession;