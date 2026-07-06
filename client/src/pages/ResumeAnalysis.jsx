import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

const ROLES = ['Backend Engineer','Frontend Engineer','Full Stack Engineer','DevOps Engineer','Data Engineer','ML Engineer','iOS Developer','Android Developer','QA Engineer'];

const scoreColor = s => s >= 8 ? '#10b981' : s >= 5 ? '#f59e0b' : '#ef4444';

const TagChip = ({ label, color, bg, border }) => (
  <span style={{ display:'inline-flex', alignItems:'center', padding:'4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 500, color, background: bg, border: `1px solid ${border}`, margin: '3px 4px 3px 0' }}>{label}</span>
);

const ResumeAnalysis = () => {
  const [file, setFile]       = useState(null);
  const [role, setRole]       = useState('Backend Engineer');
  const [custom, setCustom]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const inputRef = useRef();

  const finalRole = role === 'custom' ? custom.trim() : role;

  const handleDrop = e => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf' || f?.name?.endsWith('.txt')) setFile(f);
    else toast.error('Upload a PDF or TXT file');
  };

  const handleAnalyse = async () => {
    if (!file)      return toast.error('Upload a resume file first');
    if (!finalRole) return toast.error('Select a job role');
    setLoading(true); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const form  = new FormData();
      form.append('resume', file);
      form.append('jobRole', finalRole);
      const res  = await fetch('/api/ai/resume', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setResult(data.data);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

      {/* Header */}
      <div className="anim-fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.03em', marginBottom: 6 }}>Resume Analyser</h1>
        <p style={{ fontSize: 14, color: '#5a6080' }}>Upload your resume and get instant AI-powered role-fit analysis.</p>
      </div>

      {/* Upload card */}
      <div className="glass anim-fade-up d1" style={{ padding: 28, marginBottom: 16 }}>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${file ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 16,
            padding: '36px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: file ? 'rgba(108,99,255,0.05)' : 'transparent',
            transition: 'all 0.25s',
            marginBottom: 24,
          }}
        >
          <input ref={inputRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }}
            onChange={e => setFile(e.target.files[0])} />
          {file ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📄</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#a5a0ff', marginBottom: 4 }}>{file.name}</p>
              <p style={{ fontSize: 12, color: '#3d4466' }}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 10 }}>⬆️</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#8b93b8', marginBottom: 4 }}>Drop your resume here</p>
              <p style={{ fontSize: 12, color: '#3d4466' }}>PDF or TXT · max 5 MB · click to browse</p>
            </>
          )}
        </div>

        {/* Role picker */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#5a6080', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Target Role</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ROLES.map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
                background: role === r ? 'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(34,211,238,0.1))' : 'rgba(255,255,255,0.03)',
                border: role === r ? '1px solid rgba(108,99,255,0.45)' : '1px solid rgba(255,255,255,0.06)',
                color: role === r ? '#c5c2ff' : '#5a6080',
                transition: 'all 0.18s',
              }}>{r}</button>
            ))}
            <button onClick={() => setRole('custom')} style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
              background: role === 'custom' ? 'linear-gradient(135deg,rgba(108,99,255,0.2),rgba(34,211,238,0.1))' : 'rgba(255,255,255,0.03)',
              border: role === 'custom' ? '1px solid rgba(108,99,255,0.45)' : '1px solid rgba(255,255,255,0.06)',
              color: role === 'custom' ? '#c5c2ff' : '#5a6080', transition: 'all 0.18s',
            }}>Custom...</button>
          </div>
          {role === 'custom' && (
            <input type="text" value={custom} onChange={e => setCustom(e.target.value)}
              placeholder="e.g. Site Reliability Engineer" className="input" style={{ marginTop: 12 }} autoFocus />
          )}
        </div>

        <button onClick={handleAnalyse} disabled={loading || !file} className="btn btn-primary" style={{ fontSize: 15, padding: '14px 24px' }}>
          {loading ? <><span className="spin" style={{ width: 16, height: 16 }} />Analysing resume...</> : '🔍  Analyse Resume'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Fit score */}
          <div className="glass-accent" style={{ padding: 28, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#5a6080', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Role Fit Score</p>
            <p style={{ fontSize: 64, fontWeight: 800, color: scoreColor(result.fitScore), letterSpacing: '-0.04em', lineHeight: 1 }}>
              {result.fitScore}<span style={{ fontSize: 28, color: '#3d4466' }}>/10</span>
            </p>
            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, margin: '16px 0 14px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(result.fitScore/10)*100}%`, background: `linear-gradient(90deg, ${scoreColor(result.fitScore)}, ${scoreColor(result.fitScore)}99)`, borderRadius: 99, transition: 'width 1.2s cubic-bezier(.16,1,.3,1)' }} />
            </div>
            <p style={{ fontSize: 14, color: '#8b93b8', lineHeight: 1.65 }}>{result.summary}</p>
          </div>

          {/* Skills grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="glass" style={{ padding: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>✓ Skills Found</p>
              <div>{(result.topSkillsFound || []).map((s,i) => <TagChip key={i} label={s} color="#10b981" bg="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.25)" />)}</div>
            </div>
            <div className="glass" style={{ padding: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>✗ Missing Skills</p>
              <div>{(result.missingSkills || []).map((s,i) => <TagChip key={i} label={s} color="#ef4444" bg="rgba(239,68,68,0.1)" border="rgba(239,68,68,0.25)" />)}</div>
            </div>
          </div>

          {/* Strong points + gaps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="glass" style={{ padding: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#a5a0ff', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>💪 Strong Points</p>
              {(result.strongPoints || []).map((s,i) => <p key={i} style={{ fontSize: 13, color: '#8b93b8', lineHeight: 1.55, marginBottom: 8, display: 'flex', gap: 6 }}><span style={{ color: '#6c63ff', flexShrink: 0 }}>•</span>{s}</p>)}
            </div>
            <div className="glass" style={{ padding: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>⚠ Gaps</p>
              {(result.gaps || []).map((s,i) => <p key={i} style={{ fontSize: 13, color: '#8b93b8', lineHeight: 1.55, marginBottom: 8, display: 'flex', gap: 6 }}><span style={{ color: '#f59e0b', flexShrink: 0 }}>•</span>{s}</p>)}
            </div>
          </div>

          {/* Suggested roles */}
          {result.suggestedRoles?.length > 0 && (
            <div className="glass" style={{ padding: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>🎯 Also a Good Fit For</p>
              <div>{result.suggestedRoles.map((s,i) => <TagChip key={i} label={s} color="#22d3ee" bg="rgba(34,211,238,0.1)" border="rgba(34,211,238,0.25)" />)}</div>
            </div>
          )}

          {/* CTA */}
          <div className="glass" style={{ padding: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#eef0ff', marginBottom: 4 }}>Practice for {finalRole}</p>
              <p style={{ fontSize: 13, color: '#5a6080' }}>Start an AI interview session for this exact role</p>
            </div>
            <a href="/interview/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px',
              background: 'linear-gradient(135deg,#6c63ff,#5b54ee)', color: '#fff', borderRadius: 12,
              textDecoration: 'none', fontWeight: 600, fontSize: 14, flexShrink: 0,
              boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
            }}>Start →</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysis;