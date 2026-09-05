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
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const { register, error, setError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      setSuccessMsg("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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

        {/* Right Side Register Form Card */}
        <div className="login-card-container">
          <div className="login-brand-header">
            <div className="login-logo-icon">
              <Layers size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                Create Account <span style={{ fontSize: '10px', color: '#818cf8', padding: '2px 6px', background: 'rgba(99,102,241,0.2)', borderRadius: '4px' }}>BETA</span>
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Sign up to access your document workspace</p>
            </div>
          </div>

          {/* Security Alert / Route Guard Message */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '12px 14px',
              color: '#ef4444',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '12px 14px',
              color: '#10b981',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="login-form-stack">
            <div className="login-field-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>
            <div className="login-field-group">
              <label>Work Email</label>
              <input
                type="email"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            <button type="submit" className="login-submit-btn">
              <span>Create Account</span>
              <ArrowRight size={16} />
            </button>
            <div style={{textAlign: 'center', fontSize: '12px', marginTop: '1rem', color: '#cbd5e1'}}>
                Already have an account? <span onClick={() => navigate('/login')} style={{color: '#818cf8', cursor: 'pointer'}}>Log in</span>
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
            paddingTop: '14px',
            marginTop: '1.5rem'
          }}>
            <ShieldCheck size={14} />
            <span>SOC2 Type II Certified • 256-bit Vector Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
