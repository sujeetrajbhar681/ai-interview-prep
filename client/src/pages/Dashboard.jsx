import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const scoreColor = s => s >= 8 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';
const scoreBg    = s => s >= 8 ? 'rgba(16,185,129,0.1)' : s >= 5 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
const statusCfg  = { completed: { color:'#10b981', bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.2)' }, 'in-progress': { color:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.2)' }, abandoned: { color:'#5a6080', bg:'rgba(90,96,128,0.1)', border:'rgba(90,96,128,0.2)' } };

const StatCard = ({ emoji, label, value, color, delay }) => (
  <div className={`glass anim-fade-up ${delay}`} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{emoji}</div>
    <div>
      <p style={{ fontSize: 12, color: '#5a6080', fontWeight: 500, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: color || '#eef0ff', letterSpacing: '-0.02em' }}>{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/interviews/sessions?sort=-createdAt&limit=8'),
      api.get('/interviews/stats'),
    ]).then(([s, st]) => {
      setSessions(s.data.data || []);
      setStats(st.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 13, color: '#5a6080', marginBottom: 6, fontWeight: 500 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#10b981', marginRight: 6, boxShadow: '0 0 0 3px rgba(16,185,129,0.2)', animation: 'pulse-ring 1.5s ease-out infinite', verticalAlign: 'middle' }} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: 15, color: '#5a6080', marginTop: 8 }}>Ready to ace your next interview?</p>
        </div>
        <Link to="/interview/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600,
          background: 'linear-gradient(135deg, #6c63ff, #5b54ee)',
          color: '#fff', textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(108,99,255,0.35)',
          border: '1px solid rgba(108,99,255,0.5)',
          transition: 'all 0.2s', flexShrink: 0,
        }}>+ New Session</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 36 }}>
        <StatCard emoji="🎯" label="Total Sessions"    value={stats?.totalSessions   ?? '—'} delay="d1" />
        <StatCard emoji="✅" label="Completed"          value={stats?.completedSessions ?? '—'} color="#10b981" delay="d2" />
        <StatCard emoji="📝" label="Questions Answered" value={stats?.totalAnswered   ?? '—'} color="#f59e0b" delay="d3" />
        <StatCard emoji="⭐" label="Avg Score"          value={stats?.avgScore ? `${stats.avgScore}/10` : '—'} color="#a5a0ff" delay="d4" />
      </div>

      {/* Sessions */}
      <div className="anim-fade-up d2" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#eef0ff' }}>Recent Sessions</h2>
        <Link to="/interview/new" style={{ fontSize: 13, color: '#6c63ff', textDecoration: 'none', fontWeight: 500 }}>+ New →</Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <span className="spin" style={{ width: 32, height: 32, color: '#6c63ff' }} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass anim-scale-in" style={{ padding: 64, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#eef0ff', marginBottom: 8 }}>No sessions yet</p>
          <p style={{ fontSize: 14, color: '#5a6080', marginBottom: 28 }}>Start your first AI-powered mock interview</p>
          <Link to="/interview/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
            background: 'linear-gradient(135deg,#6c63ff,#5b54ee)', color: '#fff', borderRadius: 12,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
            boxShadow: '0 4px 20px rgba(108,99,255,0.35)',
          }}>Start now →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map((s, i) => {
            const sc = statusCfg[s.status] || statusCfg.abandoned;
            return (
              <div key={s._id} className={`glass anim-fade-up`} style={{ animationDelay: `${i * 0.04}s`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                onClick={() => window.location.href = `/session/${s._id}`}>

                {/* Role icon */}
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(34,211,238,0.1))', border: '1px solid rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#a5a0ff', flexShrink: 0 }}>
                  {s.jobRole?.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#eef0ff', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.jobRole}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge" style={{ background: sc.bg, color: sc.color, borderColor: sc.border, fontSize: 10 }}>{s.status}</span>
                    <span style={{ fontSize: 12, color: '#3d4466' }}>{s.totalQuestions} questions</span>
                    <span style={{ fontSize: 12, color: '#3d4466' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {s.overallScore != null && (
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: scoreColor(s.overallScore) }}>{s.overallScore}</p>
                      <p style={{ fontSize: 10, color: '#3d4466' }}>/ 10</p>
                    </div>
                  )}
                  {s.status === 'in-progress' && (
                    <Link to={`/interview/${s._id}`} state={{ jobRole: s.jobRole, difficulty: 'medium', category: 'technical' }}
                      onClick={e => e.stopPropagation()}
                      style={{ padding: '7px 14px', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 9, color: '#a5a0ff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      Resume →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category stats */}
      {stats?.categoryStats?.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <h2 className="anim-fade-up" style={{ fontSize: 16, fontWeight: 700, color: '#eef0ff', marginBottom: 14 }}>Performance by Category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {stats.categoryStats.map((c, i) => (
              <div key={c.category} className={`glass anim-fade-up`} style={{ animationDelay: `${i * 0.05}s`, padding: '20px 18px', textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: '#5a6080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{c.category}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: scoreColor(c.avgScore), letterSpacing: '-0.02em' }}>{c.avgScore}</p>
                <p style={{ fontSize: 11, color: '#3d4466', marginTop: 2 }}>/ 10 · {c.count} answered</p>
                <div style={{ marginTop: 12, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(c.avgScore/10)*100}%`, background: scoreColor(c.avgScore), borderRadius: 99, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;