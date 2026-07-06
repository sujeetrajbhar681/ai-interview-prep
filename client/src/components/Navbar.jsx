import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout }   = useAuth();
  const { dark, toggle }   = useTheme();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('See you next time!');
    navigate('/login');
  };

  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');

  if (!user) return null;

  const linkStyle = (path) => ({
    padding: '7px 15px', borderRadius: 10, fontSize: 13, fontWeight: 500,
    color: isActive(path) ? '#c5c2ff' : 'var(--text2)',
    background: isActive(path) ? 'rgba(108,99,255,0.13)' : 'transparent',
    border: `1px solid ${isActive(path) ? 'rgba(108,99,255,0.28)' : 'transparent'}`,
    textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
  });

  const navLinks = [
    { to: '/dashboard',     label: 'Dashboard' },
    { to: '/interview/new', label: 'Practice' },
    { to: '/resume',        label: 'Resume AI' },
    ...(user.role === 'admin' ? [{ to: '/admin', label: '⚡ Admin' }] : []),
  ];

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        background: scrolled ? (dark ? 'rgba(7,9,15,0.88)' : 'rgba(244,245,251,0.88)') : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        transition: 'all 0.35s',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6c63ff,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', boxShadow: '0 4px 16px rgba(108,99,255,0.45)' }}>AI</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Interview<span style={{ background: 'linear-gradient(135deg,#a5a0ff,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Prep</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, '@media(max-width:768px)': { display: 'none' } }} className="desktop-nav">
            {navLinks.map(l => <Link key={l.to} to={l.to} style={linkStyle(l.to)}>{l.label}</Link>)}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {/* Theme toggle */}
            <button onClick={toggle} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 16, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >{dark ? '☀️' : '🌙'}</button>

            {/* User avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', boxShadow: '0 2px 10px rgba(108,99,255,0.35)', flexShrink: 0 }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500, display: window.innerWidth > 640 ? 'block' : 'none' }}>
                {user.name?.split(' ')[0]}
              </span>
            </div>

            {/* Logout — desktop */}
            <button onClick={handleLogout}
              style={{ padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter', display: window.innerWidth > 640 ? 'block' : 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color='#ef4444'; e.currentTarget.style.borderColor='rgba(239,68,68,0.3)'; e.currentTarget.style.background='rgba(239,68,68,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='transparent'; }}
            >Logout</button>

            {/* Hamburger — mobile */}
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', cursor: 'pointer', padding: 0 }}>
              <span style={{ display: 'block', width: 16, height: 1.5, background: menuOpen ? '#6c63ff' : 'var(--text2)', borderRadius: 99, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(2px, 4px)' : 'none' }} />
              <span style={{ display: 'block', width: 16, height: 1.5, background: menuOpen ? 'transparent' : 'var(--text2)', borderRadius: 99, transition: 'all 0.2s' }} />
              <span style={{ display: 'block', width: 16, height: 1.5, background: menuOpen ? '#6c63ff' : 'var(--text2)', borderRadius: 99, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(2px, -4px)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="anim-fade-in" style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: dark ? 'rgba(7,9,15,0.97)' : 'rgba(244,245,251,0.97)',
          backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)',
          padding: '16px 24px 24px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 400, margin: '0 auto' }}>
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} style={{ ...linkStyle(l.to), display: 'block', padding: '12px 16px' }}>
                {l.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 12 }}>
              <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', fontFamily: 'Inter', textAlign: 'left' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;