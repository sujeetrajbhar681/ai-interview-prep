import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill in all fields');
    if (form.password.length < 6) return toast.error('Password needs 6+ characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Sujeet Rajbhar', autoComplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters', autoComplete: 'new-password' },
    { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password', autoComplete: 'new-password' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 1 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

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
            Create account
          </h1>
          <p style={{ fontSize: 14, color: '#5a6080' }}>Start practising in minutes — it's free</p>
        </div>

        <div className="glass anim-fade-up d1" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fields.map(f => (
              <div key={f.name}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b93b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
                <input type={f.type} name={f.name} value={form[f.name]} onChange={onChange}
                  placeholder={f.placeholder} className="input" autoComplete={f.autoComplete} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 6, padding: '14px 24px', fontSize: 15 }}>
              {loading ? <><span className="spin" style={{ width: 16, height: 16 }} />Creating account...</> : 'Create account →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: '#3d4466' }}>Already have an account? </span>
            <Link to="/login" style={{ fontSize: 13, color: '#a5a0ff', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;