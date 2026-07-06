import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 1 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo mark */}
        <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: 'linear-gradient(135deg, #6c63ff, #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
            boxShadow: '0 8px 32px rgba(108,99,255,0.45)',
            margin: '0 auto 20px',
          }}>AI</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.03em', marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#5a6080' }}>Sign in to continue your interview prep</p>
        </div>

        {/* Card */}
        <div className="glass anim-fade-up d1" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b93b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange}
                placeholder="you@example.com" className="input" autoComplete="email" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b93b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <input type="password" name="password" value={form.password} onChange={onChange}
                placeholder="••••••••" className="input" autoComplete="current-password" />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 6, padding: '14px 24px', fontSize: 15 }}>
              {loading ? <><span className="spin" style={{ width: 16, height: 16 }} />Signing in...</> : 'Sign in →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: '#3d4466' }}>No account? </span>
            <Link to="/register" style={{ fontSize: 13, color: '#a5a0ff', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
          </div>
        </div>

        {/* Feature hints */}
        <div className="anim-fade-up d2" style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 28 }}>
          {['AI Questions', 'Live Feedback', 'Resume AI'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#3d4466' }}>
              <span style={{ color: '#6c63ff' }}>✦</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;