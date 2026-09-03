import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, setError } = useAuth();

  const [email, setEmail] = useState('qloax@gmail.com');
  const [password, setPassword] = useState('qloax123');
  const [rememberMe, setRememberMe] = useState(true);

  // Message from ProtectedRoute guard redirect
  const guardMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      const fromPath = location.state?.from?.pathname || '/chat';
      navigate(fromPath, { replace: true });
    }
  };

  const handleSSOLogin = async (ssoProvider) => {
    const success = await login(`admin.${ssoProvider}@qloax.ai`, 'qloax123');
    if (success) {
      navigate('/chat');
    }
  };

  return (
    <div className="login-page-root">
      <div className="login-bg-glow" />
      <div className="login-bg-grid-pattern" />

      <div className="login-wrapper">
        {/* Left Side Branding & Hero Text */}
        <div className="login-hero-info">
          <div className="hero-brand-pill">
            <Sparkles size={14} />
            <span>QLOXA DeepSIG 4.0 Platform</span>
          </div>

          <h1 className="hero-main-title">
            Enterprise <span className="gradient-brand">Document Intelligence</span> Powered by Vector RAG
          </h1>

          <p className="hero-sub-text">
            Unlock instant insights across financial reports, legal contracts, and architecture design specs with high-precision semantic search and automated citation tracking.
          </p>

          <div className="hero-features-list">
            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <CheckCircle2 size={15} />
              </div>
              <span>Sub-15ms Cosine Similarity Vector Indexing</span>
            </div>
            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <CheckCircle2 size={15} />
              </div>
              <span>Multi-Document Comparison & Automatic Citations</span>
            </div>
            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <CheckCircle2 size={15} />
              </div>
              <span>SOC2 Type II Certified & Zero Data Retention</span>
            </div>
          </div>
        </div>

        {/* Right Side Login Form Card */}
        <div className="login-card-container">
          <div className="login-brand-header">
            <div className="login-logo-icon">
              <Layers size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                QLOXA AI <span style={{ fontSize: '10px', color: '#818cf8', padding: '2px 6px', background: 'rgba(99,102,241,0.2)', borderRadius: '4px' }}>BETA</span>
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Sign in to access your document workspace</p>
            </div>
          </div>

          {/* Security Alert / Route Guard Message */}
          {(guardMessage || error) && (
            <div style={{
              background: error ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${error ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              borderRadius: '10px',
              padding: '12px 14px',
              color: error ? '#ef4444' : '#f59e0b',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error || guardMessage}</span>
            </div>
          )}

          {/* SSO Options */}
          <div className="sso-buttons-group">
            <button type="button" className="sso-btn" onClick={() => handleSSOLogin('google')}>
              <Globe size={16} style={{ color: '#38bdf8' }} />
              <span>Continue with Google Single Sign-On</span>
            </button>
            <button type="button" className="sso-btn" onClick={() => handleSSOLogin('saml')}>
              <Lock size={16} style={{ color: '#c084fc' }} />
              <span>Enterprise SAML / Okta SSO</span>
            </button>
          </div>

          <div className="divider-or-row">
            <div className="divider-line" />
            <span>or email sign in</span>
            <div className="divider-line" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="login-form-stack">
            <div className="login-field-group">
              <label>Work Email</label>
              <input
                type="email"
                id="login-email"
                placeholder="name@qloax.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            <div className="login-field-group">
              <label>Password</label>
              <input
                type="password"
                id="login-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            <div className="login-options-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#6366f1' }}
                />
                <span>Remember me</span>
              </label>
              <span className="login-forgot-link" onClick={() => navigate('/forgot-password')}>
                Forgot password?
              </span>
            </div>

            <button type="submit" id="login-submit-btn" className="login-submit-btn">
              <span>Sign In to QLOXA AI</span>
              <ArrowRight size={16} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#94a3b8',
              marginTop: '8px'
            }}>
              <span>Don't have an account?</span>
              <span
                id="go-to-register"
                onClick={() => navigate('/register')}
                style={{ color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}
              >
                Create an account
              </span>
            </div>
          </form>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11.5px',
            color: '#10b981',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '14px'
          }}>
            <ShieldCheck size={14} />
            <span>SOC2 Type II Certified • 256-bit Vector Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;