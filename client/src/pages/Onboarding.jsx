import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  'Backend Engineer', 'Frontend Engineer', 'Full Stack Engineer',
  'DevOps Engineer', 'Data Engineer', 'ML Engineer',
  'iOS Developer', 'Android Developer', 'QA Engineer',
];

const LEVELS = [
  { v: 'easy',   l: 'Junior',   d: '0-2 years experience',  e: '🌱' },
  { v: 'medium', l: 'Mid-level', d: '2-5 years experience', e: '🚀' },
  { v: 'hard',   l: 'Senior',   d: '5+ years experience',   e: '⚡' },
];

const GOALS = [
  { v: 'new_job',     l: 'Land a new job',        e: '💼' },
  { v: 'promotion',   l: 'Get promoted',           e: '📈' },
  { v: 'practice',    l: 'Stay sharp',             e: '🎯' },
  { v: 'switch',      l: 'Switch tech stack',      e: '🔄' },
];

const Step = ({ current, total }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ height: 3, flex: 1, borderRadius: 99, background: i < current ? 'linear-gradient(90deg,#6c63ff,#22d3ee)' : 'rgba(255,255,255,0.07)', transition: 'all 0.4s' }} />
    ))}
  </div>
);

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [role, setRole]       = useState('');
  const [custom, setCustom]   = useState('');
  const [level, setLevel]     = useState('');
  const [goal, setGoal]       = useState('');
  const [saving, setSaving]   = useState(false);

  const finalRole = role === 'custom' ? custom.trim() : role;

  const handleFinish = async () => {
    if (!finalRole) return toast.error('Please select a role');
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { targetRole: finalRole });
      updateUser(data.user);
      toast.success('Profile set up!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save profile');
    } finally { setSaving(false); }
  };

  const Card = ({ selected, onClick, children }) => (
    <button onClick={onClick} style={{
      padding: '16px 18px', borderRadius: 14, cursor: 'pointer', fontFamily: 'Inter',
      textAlign: 'left', width: '100%', transition: 'all 0.18s',
      background: selected ? 'linear-gradient(135deg,rgba(108,99,255,0.18),rgba(34,211,238,0.1))' : 'rgba(255,255,255,0.03)',
      border: selected ? '1px solid rgba(108,99,255,0.5)' : '1px solid rgba(255,255,255,0.06)',
      boxShadow: selected ? '0 0 0 1px rgba(108,99,255,0.2)' : 'none',
    }}>{children}</button>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#6c63ff,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 auto 16px', boxShadow: '0 6px 24px rgba(108,99,255,0.4)' }}>AI</div>
          <p style={{ fontSize: 13, color: '#5a6080' }}>Welcome, {user?.name?.split(' ')[0]} 👋 Let's set up your profile</p>
        </div>

        <div className="glass" style={{ padding: '32px 28px' }}>
          <Step current={step} total={3} />

          {/* Step 1 — Role */}
          {step === 1 && (
            <div className="anim-fade-up">
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#eef0ff', marginBottom: 6, letterSpacing: '-0.02em' }}>What role are you targeting?</h2>
              <p style={{ fontSize: 13, color: '#5a6080', marginBottom: 24 }}>We'll personalise your questions around this role.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {ROLES.map(r => (
                  <Card key={r} selected={role === r} onClick={() => setRole(r)}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: role === r ? '#c5c2ff' : '#8b93b8' }}>{r}</span>
                  </Card>
                ))}
                <Card selected={role === 'custom'} onClick={() => setRole('custom')}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: role === 'custom' ? '#c5c2ff' : '#8b93b8' }}>Custom role...</span>
                </Card>
              </div>
              {role === 'custom' && (
                <input type="text" value={custom} onChange={e => setCustom(e.target.value)}
                  placeholder="e.g. Site Reliability Engineer" className="input" autoFocus style={{ marginTop: 8 }} />
              )}
              <button onClick={() => finalRole && setStep(2)} disabled={!finalRole}
                className="btn btn-primary" style={{ marginTop: 24, fontSize: 14 }}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — Level */}
          {step === 2 && (
            <div className="anim-fade-up">
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#eef0ff', marginBottom: 6, letterSpacing: '-0.02em' }}>What's your experience level?</h2>
              <p style={{ fontSize: 13, color: '#5a6080', marginBottom: 24 }}>This sets the default difficulty for your questions.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {LEVELS.map(l => (
                  <Card key={l.v} selected={level === l.v} onClick={() => setLevel(l.v)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{l.e}</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: level === l.v ? '#c5c2ff' : '#eef0ff', marginBottom: 2 }}>{l.l}</p>
                        <p style={{ fontSize: 12, color: '#5a6080' }}>{l.d}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1, fontSize: 14 }}>← Back</button>
                <button onClick={() => level && setStep(3)} disabled={!level} className="btn btn-primary" style={{ flex: 2, fontSize: 14 }}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3 — Goal */}
          {step === 3 && (
            <div className="anim-fade-up">
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#eef0ff', marginBottom: 6, letterSpacing: '-0.02em' }}>What's your main goal?</h2>
              <p style={{ fontSize: 13, color: '#5a6080', marginBottom: 24 }}>Help us understand what you're working towards.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {GOALS.map(g => (
                  <Card key={g.v} selected={goal === g.v} onClick={() => setGoal(g.v)}>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                      <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{g.e}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: goal === g.v ? '#c5c2ff' : '#8b93b8' }}>{g.l}</span>
                    </div>
                  </Card>
                ))}
              </div>
              <div style={{ glass: true, padding: '14px 16px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 12, marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: '#a5a0ff', marginBottom: 4, fontWeight: 600 }}>Your setup</p>
                <p style={{ fontSize: 13, color: '#8b93b8' }}>
                  {finalRole} · {LEVELS.find(l => l.v === level)?.l || 'Mid-level'} · {GOALS.find(g => g.v === goal)?.l || 'Practice'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} className="btn btn-ghost" style={{ flex: 1, fontSize: 14 }}>← Back</button>
                <button onClick={handleFinish} disabled={saving} className="btn btn-primary" style={{ flex: 2, fontSize: 14 }}>
                  {saving ? <><span className="spin" style={{ width: 14, height: 14 }} />Saving...</> : '🚀 Start Practising'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#3d4466', marginTop: 16 }}>
          You can change these settings anytime in your profile.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;