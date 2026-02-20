import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../../../shared/theme.js';

const NAV_LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/scores',   label: 'Scores' },
  { to: '/news',     label: 'News' },
  { to: '/schedule', label: 'Schedule' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🏆</span>
          <span style={styles.logoText}>Sports Hub</span>
        </div>

        {/* Desktop nav */}
        <nav style={styles.nav}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                ...styles.navLink,
                color: isActive ? COLORS.accent : COLORS.text,
                borderBottom: isActive ? `2px solid ${COLORS.accent}` : '2px solid transparent',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          style={styles.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav style={styles.mobileMenu}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                ...styles.mobileNavLink,
                color: isActive ? COLORS.accent : COLORS.text,
              })}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: COLORS.secondary,
    borderBottom: `1px solid ${COLORS.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 16px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
  },
  logoIcon: { fontSize: 24 },
  logoText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  navLink: {
    padding: '22px 12px',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: COLORS.text,
    fontSize: 22,
    cursor: 'pointer',
    padding: 8,
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: COLORS.secondary,
    borderTop: `1px solid ${COLORS.border}`,
    padding: '8px 16px 16px',
  },
  mobileNavLink: {
    padding: '12px 0',
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.medium,
    textDecoration: 'none',
    borderBottom: `1px solid ${COLORS.border}`,
  },
};
