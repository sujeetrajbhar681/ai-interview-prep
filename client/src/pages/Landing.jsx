import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ROLES = ['Backend Engineer', 'Frontend Engineer', 'Full Stack Engineer', 'DevOps Engineer', 'Data Engineer', 'ML Engineer'];

const Landing = () => {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);

  // Typewriter effect for roles
  useEffect(() => {
    const role = ROLES[roleIdx];
    if (typing) {
      if (displayed.length < role.length) {
        const t = setTimeout(() => setDisplayed(role.slice(0, displayed.length + 1)), 60);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setTyping(false), 1800);
        return () => clearTimeout(t);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
        return () => clearTimeout(t);
      } else {
        setRoleIdx(i => (i + 1) % ROLES.length);
        setTyping(true);
      }
    }
  }, [displayed, typing, roleIdx]);

  const features = [
    { icon: '🤖', title: 'AI-Generated Questions', desc: 'Get realistic interview questions tailored to your role, difficulty, and category — powered by Groq AI.' },
    { icon: '⚡', title: 'Live Streaming Feedback', desc: 'Submit your answer and watch AI feedback stream in real time — score, strengths, improvements, and a model answer.' },
    { icon: '📄', title: 'Resume Analyser', desc: 'Upload your resume and get instant AI-powered role-fit analysis with skill gaps and suggestions.' },
    { icon: '📊', title: 'Progress Dashboard', desc: 'Track your sessions, scores, and performance across categories with a detailed history.' },
    { icon: '🎯', title: 'Custom Roles', desc: 'Practice for any engineering role — backend, frontend, ML, DevOps, or enter your own custom role.' },
    { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication, rate limiting, and encrypted passwords. Your data is yours.' },
  ];

  const steps = [
    { n: '01', title: 'Create your account', desc: 'Sign up free in 30 seconds. No credit card required.' },
    { n: '02', title: 'Pick your role & settings', desc: 'Choose your target role, question category, and difficulty level.' },
    { n: '03', title: 'Answer AI questions', desc: 'Get streamed questions and type your answers in a real interview format.' },
    { n: '04', title: 'Get instant feedback', desc: 'Receive a score, strengths, improvements, and a model answer instantly.' },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(7,9,15,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6c63ff,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', boxShadow: '0 4px 16px rgba(108,99,255,0.45)' }}>AI</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#eef0ff', letterSpacing: '-0.02em' }}>
              Interview<span style={{ background: 'linear-gradient(135deg,#a5a0ff,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Prep</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, color: '#8b93b8', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s' }}>Sign in</Link>
            <Link to="/register" style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg,#6c63ff,#5b54ee)', border: '1px solid rgba(108,99,255,0.5)', boxShadow: '0 4px 16px rgba(108,99,255,0.3)' }}>Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div className="anim-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', fontSize: 12, fontWeight: 500, color: '#a5a0ff', marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
          Powered by Groq AI — completely free
        </div>

        <h1 className="anim-fade-up d1" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20 }}>
          Ace your interview as a<br />
          <span style={{ background: 'linear-gradient(135deg,#a5a0ff,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {displayed}<span style={{ opacity: 1, animation: '_blink 1s step-end infinite', display: 'inline-block', width: 3, height: '0.85em', background: '#6c63ff', marginLeft: 4, verticalAlign: 'text-bottom' }} />
          </span>
        </h1>

        <p className="anim-fade-up d2" style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: '#5a6080', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Practice with AI-generated interview questions, get instant streamed feedback, and track your progress — all for free.
        </p>

        <div className="anim-fade-up d3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg,#6c63ff,#5b54ee)', border: '1px solid rgba(108,99,255,0.5)', boxShadow: '0 8px 32px rgba(108,99,255,0.35)', transition: 'all 0.2s' }}>
            Start practising free →
          </Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#8b93b8', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>
            Sign in
          </Link>
        </div>

        {/* Stats row */}
        <div className="anim-fade-up d4" style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
          {[['100%', 'Free forever'], ['AI-powered', 'Question generation'], ['Instant', 'Streaming feedback']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.02em' }}>{v}</p>
              <p style={{ fontSize: 12, color: '#3d4466', marginTop: 2 }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.03em', marginBottom: 12 }}>Everything you need to prepare</h2>
          <p style={{ fontSize: 15, color: '#5a6080', maxWidth: 480, margin: '0 auto' }}>A complete interview prep platform built on modern AI — no subscriptions, no paywalls.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <div key={f.title} className="glass anim-fade-up" style={{ padding: '26px 24px', animationDelay: `${i * 0.06}s` }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#eef0ff', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#5a6080', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.03em', marginBottom: 12 }}>How it works</h2>
          <p style={{ fontSize: 15, color: '#5a6080' }}>From signup to feedback in under 2 minutes.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {steps.map((s, i) => (
            <div key={s.n} className="glass anim-fade-up" style={{ padding: '26px 24px', animationDelay: `${i * 0.07}s`, position: 'relative' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: 'rgba(108,99,255,0.15)', letterSpacing: '-0.04em', marginBottom: 12, lineHeight: 1 }}>{s.n}</p>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#eef0ff', marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: '#5a6080', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '60px 24px 100px' }}>
        <div className="glass-accent" style={{ padding: 'clamp(32px, 5vw, 64px)', textAlign: 'center', borderRadius: 24 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, color: '#eef0ff', letterSpacing: '-0.03em', marginBottom: 16 }}>
            Ready to ace your next interview?
          </h2>
          <p style={{ fontSize: 16, color: '#5a6080', marginBottom: 32, maxWidth: 420, margin: '0 auto 32px' }}>
            Join thousands of developers practising smarter with AI.
          </p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', borderRadius: 12, fontSize: 16, fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg,#6c63ff,#5b54ee)', border: '1px solid rgba(108,99,255,0.5)', boxShadow: '0 8px 32px rgba(108,99,255,0.4)' }}>
            Create free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#3d4466' }}>© 2025 InterviewPrep · Built with MERN + Groq AI</p>
      </footer>
    </div>
  );
};

export default Landing;