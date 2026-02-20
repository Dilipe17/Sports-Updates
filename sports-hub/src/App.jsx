import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { COLORS } from '../../shared/theme.js';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ScoresPage from './pages/ScoresPage';
import NewsPage from './pages/NewsPage';
import SchedulePage from './pages/SchedulePage';

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: COLORS.primary,
    color: COLORS.text,
  },
  main: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px 16px',
  },
};

export default function App() {
  return (
    <div style={styles.app}>
      <Header />
      <main style={styles.main}>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/scores"   element={<ScoresPage />} />
          <Route path="/news"     element={<NewsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
