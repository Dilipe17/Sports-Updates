import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { path: '/',         label: 'Home',     icon: '🏠' },
  { path: '/scores',   label: 'Scores',   icon: '🏆' },
  { path: '/news',     label: 'News',     icon: '📰' },
  { path: '/schedule', label: 'Schedule', icon: '📅' },
];

const MOBILE_CSS = `
  .header-desktop-actions { display: flex; }
  .header-hamburger        { display: none; }
  .header-mobile-menu      {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
    opacity: 0;
    border-top: 1px solid transparent;
  }
  .header-mobile-menu.open {
    max-height: 360px;
    opacity: 1;
    border-top: 1px solid rgba(59,130,246,0.2);
  }
  @media (max-width: 767px) {
    .header-desktop-actions { display: none !important; }
    .header-hamburger        { display: flex !important; }
    .header-title-text       { font-size: 17px !important; }
    .header-subtitle-text    { display: none; }
  }
`;

export default function Header({ onFavoritesClick }) {
  const [time, setTime]         = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const goTo = (path) => { navigate(path); setMenuOpen(false); };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MOBILE_CSS }} />
      <header style={s.header}>
        <div style={s.inner}>
          {/* Brand */}
          <div style={s.brand}>
            <div style={s.logoBox}>
              <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0
                     3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806
                     1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0
                     01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42
                     3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806
                     -1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0
                     013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h1 className="header-title-text" style={s.title}>SportsHub Global</h1>
              <p className="header-subtitle-text" style={s.subtitle}>Live Scores • Real-Time Data</p>
            </div>
          </div>

          {/* Desktop nav + actions */}
          <div className="header-desktop-actions" style={s.desktopRight}>
            <nav style={s.desktopNav}>
              {NAV_LINKS.map(({ path, label }) => (
                <button
                  key={path}
                  style={{ ...s.desktopNavBtn, ...(location.pathname === path ? s.desktopNavBtnActive : {}) }}
                  onClick={() => navigate(path)}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div style={s.clock}>
              <span className="live-dot" />
              <span style={s.clockText}>{time}</span>
            </div>
            <button style={s.favBtn} onClick={onFavoritesClick}>
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0
                  00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364
                  1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0
                  00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
                  1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1
                  0 00.951-.69l1.07-3.292z" />
              </svg>
              Favorites
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="header-hamburger"
            style={s.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              /* X icon */
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile slide-down menu */}
        <div className={`header-mobile-menu${menuOpen ? ' open' : ''}`} style={s.mobileMenu}>
          <nav style={s.mobileNav}>
            {NAV_LINKS.map(({ path, label, icon }) => (
              <button
                key={path}
                style={{
                  ...s.mobileNavBtn,
                  ...(location.pathname === path ? s.mobileNavBtnActive : {}),
                }}
                onClick={() => goTo(path)}
              >
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span>{label}</span>
                {location.pathname === path && <span style={s.activeDot} />}
              </button>
            ))}
          </nav>
          <div style={s.mobileDivider} />
          <div style={s.mobileBottom}>
            <div style={s.mobileClock}>
              <span className="live-dot" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd' }}>{time}</span>
            </div>
            <button style={s.mobileFavBtn} onClick={() => { onFavoritesClick(); setMenuOpen(false); }}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0
                  00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364
                  1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0
                  00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
                  1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1
                  0 00.951-.69l1.07-3.292z" />
              </svg>
              Favorites
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

const s = {
  header: {
    background: 'rgba(15,23,42,0.85)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(59,130,246,0.25)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  inner: {
    maxWidth: 1280, margin: '0 auto',
    padding: '12px 18px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 11 },
  logoBox: {
    background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
    padding: 8, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  title:    { fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.2 },
  subtitle: { fontSize: 11, color: '#93c5fd', marginTop: 1 },

  /* Desktop right section */
  desktopRight: { alignItems: 'center', gap: 18 },
  desktopNav: { display: 'flex', gap: 4 },
  desktopNavBtn: {
    padding: '6px 14px', borderRadius: 8, border: 'none',
    background: 'none', color: '#93c5fd', fontSize: 13.5, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
  },
  desktopNavBtnActive: {
    background: 'rgba(37,99,235,0.25)', color: '#fff',
    boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.4)',
  },
  clock: { display: 'flex', alignItems: 'center', gap: 6, color: '#93c5fd', fontSize: 13 },
  clockText: { fontWeight: 600 },
  favBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 15px',
    background: '#2563eb', border: 'none', borderRadius: 10,
    color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s',
  },

  /* Hamburger */
  hamburger: {
    alignItems: 'center', justifyContent: 'center',
    width: 40, height: 40, borderRadius: 10,
    border: '1px solid rgba(59,130,246,0.3)',
    background: 'rgba(30,58,138,0.4)',
    color: '#93c5fd', cursor: 'pointer',
    transition: 'all .2s',
    flexShrink: 0,
  },

  /* Mobile menu */
  mobileMenu: {
    background: 'rgba(10,18,36,0.97)',
    backdropFilter: 'blur(16px)',
  },
  mobileNav: {
    display: 'flex', flexDirection: 'column', gap: 2,
    padding: '10px 16px 8px',
  },
  mobileNavBtn: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px', borderRadius: 12,
    border: 'none', background: 'none',
    color: '#cbd5e1', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    textAlign: 'left', transition: 'background .15s',
    position: 'relative',
  },
  mobileNavBtnActive: {
    background: 'rgba(37,99,235,0.25)', color: '#fff',
  },
  activeDot: {
    marginLeft: 'auto', width: 7, height: 7,
    borderRadius: '50%', background: '#3b82f6',
  },
  mobileDivider: {
    height: 1, background: 'rgba(59,130,246,0.15)',
    margin: '0 16px',
  },
  mobileBottom: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px 14px',
  },
  mobileClock: { display: 'flex', alignItems: 'center', gap: 7 },
  mobileFavBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 10,
    border: 'none', background: '#2563eb',
    color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
  },
};
