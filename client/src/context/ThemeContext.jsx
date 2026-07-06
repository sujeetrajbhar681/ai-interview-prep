import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // default dark
  });

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');

    if (dark) {
      document.documentElement.style.setProperty('--bg',         '#07090f');
      document.documentElement.style.setProperty('--surface',    '#0e1117');
      document.documentElement.style.setProperty('--card',       'rgba(255,255,255,0.035)');
      document.documentElement.style.setProperty('--card-hover', 'rgba(255,255,255,0.06)');
      document.documentElement.style.setProperty('--border',     'rgba(255,255,255,0.07)');
      document.documentElement.style.setProperty('--border-hi',  'rgba(108,99,255,0.45)');
      document.documentElement.style.setProperty('--text',       '#eef0ff');
      document.documentElement.style.setProperty('--text2',      '#8b93b8');
      document.documentElement.style.setProperty('--text3',      '#3d4466');
      document.documentElement.style.setProperty('--glow-sm',    '0 0 24px rgba(108,99,255,0.1)');
    } else {
      document.documentElement.style.setProperty('--bg',         '#f4f5fb');
      document.documentElement.style.setProperty('--surface',    '#ffffff');
      document.documentElement.style.setProperty('--card',       'rgba(255,255,255,0.85)');
      document.documentElement.style.setProperty('--card-hover', 'rgba(255,255,255,0.95)');
      document.documentElement.style.setProperty('--border',     'rgba(0,0,0,0.08)');
      document.documentElement.style.setProperty('--border-hi',  'rgba(108,99,255,0.35)');
      document.documentElement.style.setProperty('--text',       '#0f1117');
      document.documentElement.style.setProperty('--text2',      '#4a5280');
      document.documentElement.style.setProperty('--text3',      '#9ca3c4');
      document.documentElement.style.setProperty('--glow-sm',    '0 4px 24px rgba(108,99,255,0.08)');
    }
  }, [dark]);

  const toggle = () => setDark(d => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};