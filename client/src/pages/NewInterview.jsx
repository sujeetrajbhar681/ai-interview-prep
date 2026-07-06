import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ROLES = ['Backend Engineer','Frontend Engineer','Full Stack Engineer','DevOps Engineer','Data Engineer','ML Engineer','iOS Developer','Android Developer','QA Engineer'];
const CATS  = [{ v:'technical', l:'Technical', e:'💻', d:'Algorithms, system concepts, language specifics' },{ v:'behavioral', l:'Behavioral', e:'🤝', d:'Leadership, teamwork, past experiences' },{ v:'system-design', l:'System Design', e:'🏗️', d:'Architecture, scalability, infrastructure' },{ v:'situational', l:'Situational', e:'🎯', d:'Hypothetical scenarios and decisions' }];
const DIFFS = [{ v:'easy', l:'Easy', color:'#10b981', bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.25)', d:'Junior · 0-2 yrs' },{ v:'medium', l:'Medium', color:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.25)', d:'Mid · 2-5 yrs' },{ v:'hard', l:'Hard', color:'#ef4444', bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.25)', d:'Senior · 5+ yrs' }];

const Step = ({ n, title, children }) => (
  <div className="glass anim-fade-up" style={{ padding: '26px 28px', marginBottom: 16, animationDelay: `${n * 0.07}s` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6c63ff,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{n}</div>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#eef0ff' }}>{title}</h2>
    </div>
    {children}
  </div>
);

const NewInterview = () => {
  const navigate = useNavigate();
  const [role, setRole]       = useState('');
  const [custom, setCustom]   = useState('');
  const [cat, setCat]         = useState('technical');
  const [diff, setDiff]       = useState('medium');
  const [loading, setLoading] = useState(false);

  const finalRole = role === 'custom' ? custom.trim() : role;

  const handleStart = async () => {
    if (!finalRole) return toast.error('Select a job role first');
    setLoading(true);
    try {
      const { data } = await api.post('/interviews/sessions', { jobRole: finalRole });
      toast.success('Session created!');
      navigate(`/interview/${data.data._id}`, { state: { difficulty: diff, category: cat, jobRole: finalRole } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start session');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>
      <div className="anim-fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.03em', marginBottom: 6 }}>New Interview Session</h1>
        <p style={{ fontSize: 14, color: '#5a6080' }}>Configure your session and get AI-powered questions instantly.</p>
      </div>

      {/* Step 1 — Role */}
      <Step n={1} title="Select a job role">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: role === 'custom' ? 12 : 0 }}>
          {ROLES.map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
              background: role === r ? 'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(34,211,238,0.1))' : 'rgba(255,255,255,0.03)',
              border: role === r ? '1px solid rgba(108,99,255,0.45)' : '1px solid rgba(255,255,255,0.06)',
              color: role === r ? '#c5c2ff' : '#8b93b8',
              transition: 'all 0.18s', textAlign: 'left',
            }}>{r}</button>
          ))}
          <button onClick={() => setRole('custom')} style={{
            padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
            background: role === 'custom' ? 'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(34,211,238,0.1))' : 'rgba(255,255,255,0.03)',
            border: role === 'custom' ? '1px solid rgba(108,99,255,0.45)' : '1px solid rgba(255,255,255,0.06)',
            color: role === 'custom' ? '#c5c2ff' : '#8b93b8', transition: 'all 0.18s', textAlign: 'left',
          }}>Custom...</button>
        </div>
        {role === 'custom' && (
          <input type="text" value={custom} onChange={e => setCustom(e.target.value)}
            placeholder="e.g. Site Reliability Engineer" className="input" autoFocus style={{ marginTop: 8 }} />
        )}
      </Step>

      {/* Step 2 — Category */}
      <Step n={2} title="Question category">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {CATS.map(c => (
            <button key={c.v} onClick={() => setCat(c.v)} style={{
              padding: '14px 16px', borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter', textAlign: 'left',
              background: cat === c.v ? 'linear-gradient(135deg,rgba(108,99,255,0.18),rgba(34,211,238,0.1))' : 'rgba(255,255,255,0.03)',
              border: cat === c.v ? '1px solid rgba(108,99,255,0.45)' : '1px solid rgba(255,255,255,0.06)',
              transition: 'all 0.18s',
            }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{c.e}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: cat === c.v ? '#c5c2ff' : '#8b93b8', marginBottom: 3 }}>{c.l}</div>
              <div style={{ fontSize: 11, color: '#3d4466' }}>{c.d}</div>
            </button>
          ))}
        </div>
      </Step>

      {/* Step 3 — Difficulty */}
      <Step n={3} title="Difficulty level">
        <div style={{ display: 'flex', gap: 12 }}>
          {DIFFS.map(d => (
            <button key={d.v} onClick={() => setDiff(d.v)} style={{
              flex: 1, padding: '16px 12px', borderRadius: 12, cursor: 'pointer', fontFamily: 'Inter', textAlign: 'center',
              background: diff === d.v ? d.bg : 'rgba(255,255,255,0.03)',
              border: diff === d.v ? `1px solid ${d.border}` : '1px solid rgba(255,255,255,0.06)',
              transition: 'all 0.18s',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: diff === d.v ? d.color : '#5a6080', marginBottom: 4 }}>{d.l}</div>
              <div style={{ fontSize: 11, color: diff === d.v ? d.color : '#3d4466', opacity: 0.8 }}>{d.d}</div>
            </button>
          ))}
        </div>
      </Step>

      {/* Start */}
      <div className="anim-fade-up d4">
        <button onClick={handleStart} disabled={loading || !finalRole} className="btn btn-primary" style={{ fontSize: 16, padding: '16px 24px' }}>
          {loading ? <><span className="spin" style={{ width: 18, height: 18 }} />Starting...</> : '🚀  Start Interview Session'}
        </button>
        {!finalRole && <p style={{ textAlign: 'center', fontSize: 12, color: '#3d4466', marginTop: 10 }}>Select a role above to continue</p>}
      </div>
    </div>
  );
};

export default NewInterview;