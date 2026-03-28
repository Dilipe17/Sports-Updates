import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header          from '../components/Header';
import FavoritesModal  from '../components/FavoritesModal';
import StandingsPanel  from '../components/StandingsPanel';
import MatchCard, { SectionHeader, MatchCardSkeleton } from '../components/MatchCard';
import IPLBanner       from '../components/IPLBanner';
import { SPORT_CONFIG, fetchSportMatches, fetchESPNHeadlines } from '../../../shared/api.js';

const SPORTS = Object.entries(SPORT_CONFIG).map(([id, cfg]) => ({ id, ...cfg }));

// Grid and sidebar toggle are handled via JS width detection — no media query needed.
const RESPONSIVE_CSS = `
  .home-sidebar-mobile-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 16px;
    background: rgba(30,58,138,0.38);
    border: 1px solid rgba(30,64,175,0.4);
    border-radius: 14px;
    color: #93c5fd;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: background .15s;
    text-transform: uppercase;
    letter-spacing: .06em;
  }
  .home-sidebar-content {
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease;
    opacity: 0;
  }
  .home-sidebar-content.open {
    max-height: 900px;
    opacity: 1;
  }

  @media (max-width: 480px) {
    .home-tab-bar { gap: 4px !important; }
    .home-tab-btn { padding: 7px 11px !important; font-size: 12px !important; }
  }
`;

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
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [isMobile,      setIsMobile]      = useState(() => window.innerWidth <= 900);
  const intervalRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

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

  /* ── fetch news when tab changes ───────────────────────────────────────── */
  useEffect(() => {
    const sport = activeTab === 'nfl' ? 'nfl'
                : activeTab === 'basketball' ? 'basketball'
                : activeTab === 'baseball'   ? 'baseball'
                : activeTab === 'soccer'     ? 'soccer'
                : activeTab === 'tennis'     ? 'tennis'
                : activeTab === 'f1'         ? 'f1'
                : 'cricket'; // default to cricket (covers 'cricket' tab)
    fetchESPNHeadlines(sport, 6)
      .then(d => setNews(d.articles?.slice(0, 6) || []))
      .catch(() => setNews([]));
  }, [activeTab]);

  /* ── region filter ──────────────────────────────────────────────────────── */
  const regionBlocked = region !== 'all' && SPORT_CONFIG[activeTab]?.region !== region;

  /* ── match rendering ────────────────────────────────────────────────────── */
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
        <button style={retryBtn} onClick={() => loadMatches(activeTab, true)}>&#8635; Retry</button>
      </div>
    );

    if (activeTab === 'cricket') {
      const groups = { ipl: [], worldcup: [], international: [], domestic: [] };
      matches.forEach(m => { (groups[m.leagueGroup] || groups.domestic).push(m); });
      let idx = 0;
      return (
        <>
          {/* IPL always first — hero banner + matches */}
          <IPLBanner />
          {groups.ipl.length > 0 && <>
            <SectionHeader icon="🏏" title="IPL 2026" count={groups.ipl.length} accent="#fb923c" />
            {groups.ipl.map(m => <MatchCard key={m.id} match={m} delay={(idx++) * 70} />)}
          </>}
          {groups.worldcup.length > 0 && <>
            <SectionHeader icon="🏆" title="Major Events" count={groups.worldcup.length} />
            {groups.worldcup.map(m => <MatchCard key={m.id} match={m} delay={(idx++) * 70} />)}
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
          <div style={f1Header}>🏎️ <strong>{new Date().getFullYear()} F1 Race Calendar</strong> <span style={{ fontSize: 11, color: '#93c5fd' }}>Powered by OpenF1</span></div>
          {matches.map((m, i) => <MatchCard key={m.id} match={m} delay={i * 70} />)}
        </>
      );
    }

    return matches.map((m, i) => <MatchCard key={m.id} match={m} delay={i * 70} />);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_CSS }} />
      <Header onFavoritesClick={() => setFavOpen(true)} />
      <FavoritesModal open={favOpen} onClose={() => setFavOpen(false)} />

      <main style={mainStyle}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 260px',
          gap: 24,
          alignItems: 'start',
        }}>

          {/* ── Main scores area ───────────────────────────────────────── */}
          <div style={{ minWidth: 0 }}>
            {/* Sport tabs */}
            <nav className="home-tab-bar" style={tabBar}>
              {SPORTS.map(({ id, icon, name }) => (
                <button key={id}
                  className="home-tab-btn"
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

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0, order: isMobile ? 2 : 0 }}>
            {/* Mobile toggle button — only rendered on mobile */}
            {isMobile && (
              <button
                className="home-sidebar-mobile-toggle"
                onClick={() => setSidebarOpen(o => !o)}
              >
                <span>Filters &amp; Headlines</span>
                <svg
                  width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  style={{ transition: 'transform .3s', transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Sidebar content — always visible on desktop, animated toggle on mobile */}
            <div className={isMobile ? `home-sidebar-content${sidebarOpen ? ' open' : ''}` : undefined}
              style={isMobile ? undefined : { display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                <h3 style={cardTitle}>
                  {activeTab === 'cricket' ? '🏏 IPL & Cricket Headlines' : 'Latest Headlines'}
                </h3>
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
            </div>
          </aside>

        </div>
      </main>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const mainStyle = { maxWidth: 1280, margin: '0 auto', padding: '24px 16px' };

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
  WebkitOverflowScrolling: 'touch',
};
const tabBtn = {
  padding: '8px 16px', borderRadius: 20,
  border: 'none', background: 'none',
  color: '#93c5fd', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  fontFamily: 'inherit', transition: 'all .15s',
};
const tabBtnActive = { background: '#2563eb', color: '#fff', boxShadow: '0 4px 14px rgba(37,99,235,.4)' };

const empty    = { background: 'rgba(30,58,138,.25)', borderRadius: 20, padding: '60px 20px', textAlign: 'center', border: '1px solid rgba(30,64,175,.3)' };
const retryBtn = { marginTop: 16, padding: '10px 22px', background: '#1d4ed8', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };
const f1Header = { fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' };
