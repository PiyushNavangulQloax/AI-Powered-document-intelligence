import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileCheck,
  Zap,
  Lock,
  MessageSquare,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleProtectedNavigation = (path, featureName) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/login', {
        state: {
          from: { pathname: path },
          message: `Authentication required. Please sign in to access ${featureName || 'this feature'}.`
        }
      });
    }
  };

  return (
    <div className="home-page-root">
      <div className="home-bg-glow-1" />
      <div className="home-bg-grid-pattern" />

      {/* Top Landing Navbar */}
      <header className="home-navbar">
        <div className="home-logo-wrap" onClick={() => navigate('/')}>
          <div className="home-logo-icon">
            <Layers size={20} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 800, fontSize: '17px', color: '#fff' }}>QLOXA AI</span>
            <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 5px', background: 'rgba(99,102,241,0.25)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '4px' }}>
              BETA
            </span>
          </div>
        </div>

        <nav className="home-nav-links">
          <span className="home-nav-link" onClick={() => handleProtectedNavigation('/chat', 'AI Chat')}>AI Chat</span>
          <span className="home-nav-link" onClick={() => handleProtectedNavigation('/search', 'Vector Search')}>Vector Search</span>
          <span className="home-nav-link" onClick={() => handleProtectedNavigation('/documents', 'Document Library')}>Document Library</span>
          <span className="home-nav-link" onClick={() => handleProtectedNavigation('/dashboard', 'Dashboard')}>Dashboard</span>
        </nav>

        <div className="home-nav-actions">
          <button className="home-btn-ghost" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="home-btn-primary" onClick={() => navigate('/login')}>
            <span>Get Started</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="hero-announcement-chip">
          <Sparkles size={14} />
          <span>QLOXA DeepSIG 4.0 RAG Engine Active</span>
        </div>

        <h1 className="hero-title-giant">
          Transform Complex Documents into <span className="gradient-brand">Actionable Intelligence</span>
        </h1>

        <p className="hero-subtitle-desc">
          High-precision Vector RAG platform for instant cross-document reasoning. Query financial reports, audit contracts, and compare architecture specs with sub-15ms semantic retrieval and zero data leakage.
        </p>

        <div className="hero-cta-group">
          <button className="cta-large-btn cta-large-primary" onClick={() => navigate('/login')}>
            <span>Sign In to QLOXA AI</span>
            <ArrowRight size={18} />
          </button>

          <button
            className="cta-large-btn cta-large-secondary"
            onClick={() => handleProtectedNavigation('/chat', 'AI Chat')}
          >
            <MessageSquare size={18} style={{ color: '#38bdf8' }} />
            <span>Explore Demo Chat</span>
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="home-features-section">
        <div className="feature-card-item">
          <div className="feature-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Zap size={22} />
          </div>
          <h3 className="feature-card-title">Deep Vector RAG 4.0</h3>
          <p className="feature-card-text">
            1536-dimensional embedding vectors with hybrid HNSW index clusters for accurate semantic matching.
          </p>
        </div>

        <div className="feature-card-item">
          <div className="feature-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
            <FileCheck size={22} />
          </div>
          <h3 className="feature-card-title">Multi-Doc Synthesis</h3>
          <p className="feature-card-text">
            Cross-reference multiple PDF financial highlights, DOCX contracts, and TXT guides simultaneously.
          </p>
        </div>

        <div className="feature-card-item">
          <div className="feature-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
            <Compass size={22} />
          </div>
          <h3 className="feature-card-title">Citation Verification</h3>
          <p className="feature-card-text">
            Every AI response includes exact document name and page number citations with match score badges.
          </p>
        </div>

        <div className="feature-card-item">
          <div className="feature-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Lock size={22} />
          </div>
          <h3 className="feature-card-title">SOC2 & 256-Bit Security</h3>
          <p className="feature-card-text">
            Enterprise grade security with zero-data retention guarantee and encrypted vector storage.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} style={{ color: '#6366f1' }} />
          <span>© 2026 QLOXA AI • Document Intelligence Platform</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
          <ShieldCheck size={14} />
          <span>SOC2 Type II Certified • Vector RAG 4.0</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;
