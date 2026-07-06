import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const scoreColor = s => s >= 8 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';
const scoreBg    = s => s >= 8 ? 'rgba(16,185,129,0.12)' : s >= 5 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';

const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  let feedback = null;
  if (item.aiFeedback) {
    try {
      const clean = item.aiFeedback.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      feedback = JSON.parse(clean);
    } catch {}
  }

  return (
    <div className="glass" style={{ padding: '20px 22px', transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(34,211,238,0.1))', border: '1px solid rgba(108,99,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#a5a0ff', flexShrink: 0 }}>{index + 1}</div>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#eef0ff', lineHeight: 1.6, flex: 1 }}>{item.question}</p>
        {item.score != null && (
          <div style={{ background: scoreBg(item.score), border: `1px solid ${scoreColor(item.score)}40`, borderRadius: 10, padding: '6px 12px', textAlign: 'center', flexShrink: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: scoreColor(item.score), lineHeight: 1 }}>{item.score}</p>
            <p style={{ fontSize: 10, color: '#3d4466' }}>/10</p>
          </div>
        )}
      </div>

      {/* Score bar */}
      {item.score != null && (
        <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 99, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(item.score/10)*100}%`, background: scoreColor(item.score), borderRadius: 99 }} />
        </div>
      )}

      {item.answer && (
        <button onClick={() => setOpen(o => !o)} style={{
          fontSize: 12, color: open ? '#a5a0ff' : '#5a6080', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'Inter', padding: 0, transition: 'color 0.2s',
        }}>{open ? '▲ Hide details' : '▼ Show answer & feedback'}</button>
      )}

      {open && (
        <div className="anim-fade-up" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#3d4466', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Your Answer</p>
            <p style={{ fontSize: 13, color: '#8b93b8', lineHeight: 1.7, fontFamily: 'JetBrains Mono' }}>{item.answer}</p>
          </div>

          {feedback ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, color: '#8b93b8', lineHeight: 1.65 }}>{feedback.summary}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {feedback.strengths?.length > 0 && (
                  <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>✓ Strengths</p>
                    {feedback.strengths.map((s,i) => <p key={i} style={{ fontSize: 12, color: '#8b93b8', marginBottom: 4, display: 'flex', gap: 5 }}><span style={{ color: '#10b981' }}>•</span>{s}</p>)}
                  </div>
                )}
                {feedback.improvements?.length > 0 && (
                  <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>↑ Improve</p>
                    {feedback.improvements.map((s,i) => <p key={i} style={{ fontSize: 12, color: '#8b93b8', marginBottom: 4, display: 'flex', gap: 5 }}><span style={{ color: '#f59e0b' }}>•</span>{s}</p>)}
                  </div>
                )}
              </div>
              {feedback.modelAnswer && (
                <div style={{ background: 'rgba(108,99,255,0.07)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 10, padding: 14, borderLeft: '2px solid rgba(108,99,255,0.5)' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#a5a0ff', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>💡 Model Answer</p>
                  <p style={{ fontSize: 12, color: '#8b93b8', lineHeight: 1.7 }}>{feedback.modelAnswer}</p>
                </div>
              )}
            </div>
          ) : item.aiFeedback ? (
            <p style={{ fontSize: 12, color: '#5a6080', lineHeight: 1.7 }}>{item.aiFeedback}</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/interviews/sessions/${id}`)
      .then(r => setSession(r.data.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spin" style={{ width: 32, height: 32, color: '#6c63ff' }} />
    </div>
  );
  if (!session) return null;

  const interviews = session.interviews || [];
  const avg = session.overallScore;
  const statusColor = { completed: '#10b981', 'in-progress': '#f59e0b', abandoned: '#5a6080' }[session.status] || '#5a6080';

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#5a6080', textDecoration: 'none', marginBottom: 28, transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color='#eef0ff'}
        onMouseLeave={e => e.currentTarget.style.color='#5a6080'}
      >← Dashboard</Link>

      {/* Session header */}
      <div className="glass-accent anim-fade-up" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.03em', marginBottom: 6 }}>{session.jobRole}</h1>
            <p style={{ fontSize: 13, color: '#3d4466' }}>{new Date(session.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
          </div>
          {avg != null && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: '#3d4466', marginBottom: 4 }}>Avg Score</p>
              <p style={{ fontSize: 36, fontWeight: 800, color: scoreColor(avg), letterSpacing: '-0.04em', lineHeight: 1 }}>{avg}<span style={{ fontSize: 16, color: '#3d4466' }}>/10</span></p>
            </div>
          )}
        </div>

        {/* Score chips */}
        {interviews.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {interviews.map((item, i) => (
              <div key={item._id} title={`Q${i+1}: ${item.score ?? 'unanswered'}`}
                style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: item.score != null ? scoreBg(item.score) : 'rgba(255,255,255,0.04)', color: item.score != null ? scoreColor(item.score) : '#3d4466', border: `1px solid ${item.score != null ? scoreColor(item.score)+'40' : 'rgba(255,255,255,0.06)'}` }}>
                {item.score ?? '—'}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#3d4466' }}>{interviews.length} questions · {interviews.filter(i => i.answer).length} answered</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}30`, padding: '3px 10px', borderRadius: 99 }}>{session.status}</span>
        </div>
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {interviews.map((item, i) => <QuestionCard key={item._id} item={item} index={i} />)}
      </div>

      {session.status === 'in-progress' && (
        <div style={{ marginTop: 20 }}>
          <Link to={`/interview/${session._id}`} state={{ jobRole: session.jobRole, difficulty: 'medium', category: 'technical' }}
            className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 24px', fontSize: 14 }}>
            Resume Session →
          </Link>
        </div>
      )}
    </div>
  );
};

export default SessionDetail;