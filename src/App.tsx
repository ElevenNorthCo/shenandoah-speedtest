import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { TownsPage } from './pages/TownsPage';
import { TownDetailPage } from './pages/TownDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { NotFoundPage } from './pages/NotFoundPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-void)' }}>
      <ScrollToTop />
      <Header />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/towns" element={<TownsPage />} />
          <Route path="/towns/:slug" element={<TownDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
