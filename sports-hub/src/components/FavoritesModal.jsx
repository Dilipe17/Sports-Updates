import React, { useState, useEffect } from 'react';
import { SPORT_CONFIG } from '../../../shared/api.js';

export default function FavoritesModal({ open, onClose }) {
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem('favoriteSports') || '["cricket","soccer","nfl"]')
  );
  const [notifEnabled, setNotifEnabled] = useState(() =>
    localStorage.getItem('notificationsEnabled') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('favoriteSports', JSON.stringify(favorites));
  }, [favorites]);

  const toggle = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleNotif = async (e) => {
    const checked = e.target.checked;
    if (checked && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotifEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
      } else {
        e.target.checked = false;
      }
    } else {
      setNotifEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
    }
  };

  if (!open) return null;

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <h2 style={s.title}>Your Favorite Sports</h2>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Sport grid */}
        <div style={s.grid}>
          {Object.entries(SPORT_CONFIG).map(([id, cfg]) => {
            const active = favorites.includes(id);
            return (
              <button key={id} style={{ ...s.sportBtn, ...(active ? s.sportBtnActive : {}) }}
                onClick={() => toggle(id)}>
                <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                <span style={s.sportLabel}>{cfg.name}</span>
                {active && <span style={s.check}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Notifications */}
        <div style={s.notifRow}>
          <span style={{ fontSize: 22 }}>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={s.notifTitle}>Live Score Notifications</div>
            <div style={s.notifSub}>Get notified when favorited sports go live</div>
          </div>
          <label style={s.toggle}>
            <input type="checkbox" style={{ display: 'none' }}
              defaultChecked={notifEnabled} onChange={handleNotif} />
            <span style={{ ...s.toggleTrack, background: notifEnabled ? '#22c55e' : '#2563eb' }}>
              <span style={{ ...s.toggleThumb, transform: notifEnabled ? 'translateX(20px)' : 'none' }} />
            </span>
          </label>
        </div>

        <button style={s.saveBtn} onClick={onClose}>Save Preferences</button>
      </div>
    </div>
  );
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,.65)',
    backdropFilter: 'blur(8px)',
    zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  },
  modal: {
    background: 'linear-gradient(135deg,#1e3a8a,#312e81)',
    border: '1px solid rgba(59,130,246,.4)',
    borderRadius: 20, padding: 24,
    maxWidth: 520, width: '100%',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title:  { fontSize: 18, fontWeight: 800, color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: 18, fontFamily: 'inherit' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: 10, marginBottom: 20,
  },
  sportBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: 14, borderRadius: 14,
    background: 'rgba(30,58,138,.5)', border: '2px solid rgba(30,64,175,.4)',
    color: '#93c5fd', cursor: 'pointer', fontFamily: 'inherit',
    position: 'relative', transition: 'all .15s',
  },
  sportBtnActive: {
    background: '#2563eb', borderColor: '#60a5fa', color: '#fff',
  },
  sportLabel: { fontSize: 13, fontWeight: 700 },
  check: {
    position: 'absolute', top: 6, right: 8,
    fontSize: 12, color: '#fff', fontWeight: 700,
  },
  notifRow: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'rgba(30,58,138,.4)', borderRadius: 14,
    border: '1px solid rgba(30,64,175,.35)',
    padding: '14px 16px', marginBottom: 18,
  },
  notifTitle: { color: '#fff', fontWeight: 700, fontSize: 13 },
  notifSub:   { color: '#93c5fd', fontSize: 11, marginTop: 2 },
  toggle: { cursor: 'pointer' },
  toggleTrack: {
    display: 'block', width: 44, height: 24,
    borderRadius: 12, position: 'relative', transition: 'background .2s',
  },
  toggleThumb: {
    position: 'absolute', top: 2, left: 2,
    width: 20, height: 20, borderRadius: '50%',
    background: '#fff', transition: 'transform .2s',
  },
  saveBtn: {
    width: '100%', padding: '12px 0',
    background: '#2563eb', border: 'none', borderRadius: 14,
    color: '#fff', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  },
};
