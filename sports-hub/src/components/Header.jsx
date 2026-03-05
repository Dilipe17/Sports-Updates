import React, { useState, useEffect } from 'react';

export default function Header({ onFavoritesClick }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
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
            <h1 style={s.title}>SportsHub Global</h1>
            <p style={s.subtitle}>Live Scores • Real-Time Data</p>
          </div>
        </div>

        {/* Right actions */}
        <div style={s.actions}>
          <div style={s.clock}>
            <span className="live-dot" />
            <span style={s.clockText}>{time}</span>
          </div>
          <button style={s.favBtn} onClick={onFavoritesClick}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0
                00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364
                1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0
                00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
                1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1
                0 00.951-.69l1.07-3.292z" />
            </svg>
            <span style={s.favLabel}>Favorites</span>
          </button>
        </div>
      </div>
    </header>
  );
}

const s = {
  header: {
    background: 'rgba(15,23,42,0.6)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(59,130,246,0.25)',
    position: 'sticky', top: 0, zIndex: 50,
  },
  inner: {
    maxWidth: 1280, margin: '0 auto',
    padding: '14px 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 12 },
  logoBox: {
    background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
    padding: 8, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title:    { fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1.2 },
  subtitle: { fontSize: 11, color: '#93c5fd', marginTop: 1 },
  actions:  { display: 'flex', alignItems: 'center', gap: 14 },
  clock: {
    display: 'flex', alignItems: 'center', gap: 6,
    color: '#93c5fd', fontSize: 13,
  },
  clockText: { fontWeight: 600 },
  favBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px',
    background: '#2563eb', border: 'none', borderRadius: 10,
    color: '#fff', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'background .15s',
  },
  favLabel: {},
};
