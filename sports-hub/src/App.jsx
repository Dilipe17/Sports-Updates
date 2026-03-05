import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatWidget from './components/ChatWidget';
import HomePage   from './pages/HomePage';
import ScoresPage  from './pages/ScoresPage';
import NewsPage    from './pages/NewsPage';
import SchedulePage from './pages/SchedulePage';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #312e81 100%);
    min-height: 100vh;
    color: #fff;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(99,155,255,0.25); border-radius: 4px; }
  @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes fadeInUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes bounce    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  .live-dot {
    display:inline-block; width:8px; height:8px;
    background:#22c55e; border-radius:50%;
    animation: livePulse 1.5s infinite;
  }
  .skeleton {
    background: linear-gradient(90deg,rgba(30,64,175,.3) 25%,rgba(59,130,246,.18) 50%,rgba(30,64,175,.3) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 12px;
  }
  .fade-in { animation: fadeInUp .35s ease-out both; }

  /* ── Global mobile safety ── */
  img, svg { max-width: 100%; }
  @media (max-width: 480px) {
    /* Tighten main padding on small phones */
    main { padding-left: 12px !important; padding-right: 12px !important; }
  }
`;

export default function App() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/scores"   element={<ScoresPage />} />
        <Route path="/news"     element={<NewsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </>
  );
}
