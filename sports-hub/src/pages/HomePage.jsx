import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header          from '../components/Header';
import FavoritesModal  from '../components/FavoritesModal';
import StandingsPanel  from '../components/StandingsPanel';
import MatchCard, { SectionHeader, MatchCardSkeleton } from '../components/MatchCard';
import { SPORT_CONFIG, fetchSportMatches, fetchESPNHeadlines } from '../../../shared/api.js';

const SPORTS = Object.entries(SPORT_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function HomePage() {
  const [activeTab,     setActiveTab]     = useState('cricket');
  const [region,        setRegion]        = useState('all');
  const [matches,       setMatches]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [news,          setNews]          = useState([]);
  const [favOpen,       setFavOpen]       = useState(false);
  const intervalRef = useRef(null);

  /* ── fetch matches ──────────────────────────────────────────────────────── */
  const loadMatches = useCallback(async (tab, force = false) => {
    setLoading(true);
    const data = await fetchSportMatches(tab, force);
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMatches(activeTab);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => loadMatches(activeTab, true), 60000);
    return () => clearInterval(intervalRef.current);
  }, [activeTab, loadMatches]);

  /* ── fetch news once ────────────────────────────────────────────────────── */
  useEffect(() => {
    fetchESPNHeadlines('nfl', 5)
      .then(d => setNews(d.articles?.slice(0, 5) || []))
      .catch(() => setNews([]));
  }, []);

  /* ── region filter ──────────────────────────────────────────────────────── */
  const regionBlocked = region !== 'all' && SPORT_CONFIG[activeTab]?.region !== region;

  /* ── cricket grouping ───────────────────────────────────────────────────── */
  const renderMatches = () => {
    if (loading) return [1, 2, 3].map(i => <MatchCardSkeleton key={i} />);

    if (regionBlocked) return (
      <div style={empty}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{SPORT_CONFIG[activeTab]?.icon}</div>
        <div style={{ color: '#93c5fd', fontSize: 16, fontWeight: 500 }}>
          No {SPORT_CONFIG[activeTab]?.name} matches in this region.
        </div>
        <button style={retryBtn} onClick={() => setRegion('all')}>Show All Regions</button>
      </div>
    );

    if (!matches.length) return (
      <div style={empty}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{SPORT_CONFIG[activeTab]?.icon}</div>
        <div style={{ color: '#93c5fd', fontSize: 16, fontWeight: 500 }}>
          No {SPORT_CONFIG[activeTab]?.name} matches right now.
        </div>
        <button style={retryBtn} onClick={() => loadMatches(activeTab, true)}>↻ Retry</button>
      </div>
    );

    if (activeTab === 'cricket') {
      const groups = { ipl: [], international: [], domestic: [] };
      matches.forEach(m => { (groups[m.leagueGroup] || groups.domestic).push(m); });
      let idx = 0;
      return (
        <>
          {groups.ipl.length > 0 && <>
            <SectionHeader icon="🏆" title="IPL T20" count={groups.ipl.length} />
            {groups.ipl.map(m => <MatchCard key={m.id} match={m} delay={(idx++) * 70} />)}
          </>}
          {groups.international.length > 0 && <>
            <SectionHeader icon="🌍" title="International" count={groups.international.length} />
            {groups.international.map(m => <MatchCard key={m.id} match={m} delay={(idx++) * 70} />)}
          </>}
          {groups.domestic.length > 0 && <>
            <SectionHeader icon="🏏" title="Domestic" count={groups.domestic.length} />
            {groups.domestic.map(m => <MatchCard key={m.id} match={m} delay={(idx++) * 70} />)}
          </>}
        </>
      );
    }

    if (activeTab === 'f1') {
      return (
        <>
          <div style={f1Header}>🏎️ <strong>2025 F1 Race Calendar</strong> <span style={{ fontSize: 11, color: '#93c5fd' }}>Powered by OpenF1</span></div>
          {matches.map((m, i) => <MatchCard key={m.id} match={m} delay={i * 70} />)}
        </>
      );
    }

    return matches.map((m, i) => <MatchCard key={m.id} match={m} delay={i * 70} />);
  };

  return (
    <>
      <Header onFavoritesClick={() => setFavOpen(true)} />
      <FavoritesModal open={favOpen} onClose={() => setFavOpen(false)} />

      <main style={layout.main}>
        <div style={layout.grid}>

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <aside style={layout.sidebar}>
            {/* Region filter */}
            <div style={card}>
              <h3 style={cardTitle}>Filter by Region</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[['all','All Regions'],['na','North America'],['eu','Europe'],['as','Asia']].map(([id, label]) => (
                  <button key={id}
                    style={{ ...regionBtn, ...(region === id ? regionBtnActive : {}) }}
                    onClick={() => setRegion(id)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* News */}
            <div style={card}>
              <h3 style={cardTitle}>Latest Headlines</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {news.length > 0 ? news.map((a, i) => (
                  <div key={i} style={{ cursor: 'pointer' }}
                    onClick={() => a.links?.web?.href && window.open(a.links.web.href, '_blank')}>
                    <div style={newsCategory}>{a.categories?.[0]?.description || 'Sports'}</div>
                    <div style={newsTitle}>{a.headline}</div>
                    <div style={newsTime}>{a.published ? timeAgo(a.published) : ''}</div>
                  </div>
                )) : (
                  <>
                    {['Live scores powered by ESPN API', 'F1 data from OpenF1', 'Auto-refreshes every 60s'].map((t, i) => (
                      <div key={i}>
                        <div style={newsCategory}>Update</div>
                        <div style={newsTitle}>{t}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main scores area ───────────────────────────────────────── */}
          <div style={layout.main2}>
            {/* Sport tabs */}
            <nav style={tabBar}>
              {SPORTS.map(({ id, icon, name }) => (
                <button key={id}
                  style={{ ...tabBtn, ...(activeTab === id ? tabBtnActive : {}) }}
                  onClick={() => setActiveTab(id)}>
                  {icon} {name}
                </button>
              ))}
            </nav>

            {/* Standings */}
            <StandingsPanel sportId={activeTab} />

            {/* Cards */}
            <div>{renderMatches()}</div>
          </div>
        </div>
      </main>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const layout = {
  main:  { maxWidth: 1280, margin: '0 auto', padding: '24px 16px' },
  grid:  { display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 },
  main2: { minWidth: 0 },
};

const card      = { background: 'rgba(30,58,138,.38)', border: '1px solid rgba(30,64,175,.4)', borderRadius: 18, padding: '16px 18px' };
const cardTitle = { fontSize: 11, fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 };

const regionBtn = {
  width: '100%', textAlign: 'left',
  padding: '8px 12px', borderRadius: 10,
  border: '1px solid transparent',
  background: 'none', color: '#93c5fd',
  fontSize: 13, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
};
const regionBtnActive = { background: 'rgba(30,64,175,.6)', border: '1px solid #2563eb', color: '#fff', fontWeight: 700 };

const newsCategory = { fontSize: 10, fontWeight: 700, color: '#3b82f6', marginBottom: 3, textTransform: 'uppercase' };
const newsTitle    = { fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4 };
const newsTime     = { fontSize: 10, color: '#93c5fd', marginTop: 3 };

const tabBar = {
  display: 'flex', gap: 6, overflowX: 'auto',
  paddingBottom: 10, marginBottom: 14,
  scrollbarWidth: 'none',
};
const tabBtn = {
  padding: '8px 16px', borderRadius: 20,
  border: 'none', background: 'none',
  color: '#93c5fd', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  fontFamily: 'inherit', transition: 'all .15s',
};
const tabBtnActive = { background: '#2563eb', color: '#fff', boxShadow: '0 4px 14px rgba(37,99,235,.4)' };

const empty   = { background: 'rgba(30,58,138,.25)', borderRadius: 20, padding: '60px 20px', textAlign: 'center', border: '1px solid rgba(30,64,175,.3)' };
const retryBtn= { marginTop: 16, padding: '10px 22px', background: '#1d4ed8', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };
const f1Header= { fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' };
