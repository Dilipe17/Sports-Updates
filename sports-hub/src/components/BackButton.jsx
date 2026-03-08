import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/')} style={s.btn}>
      <span style={s.arrow}>←</span> Home
    </button>
  );
}

const s = {
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    padding: '7px 16px',
    background: 'rgba(30,58,138,.55)',
    border: '1px solid rgba(59,130,246,.35)',
    borderRadius: 999,
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background .15s, border-color .15s',
  },
  arrow: { fontSize: 15, lineHeight: 1 },
};
