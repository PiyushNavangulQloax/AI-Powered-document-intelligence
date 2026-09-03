import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../Login/Login.css';

function Register() {
  const navigate = useNavigate();
  const { register, login, error, setError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const success = await register(name, email, password);
    setLoading(false);

    if (success) {
      setSuccessMsg('Account created successfully! Signing you in...');
      // Auto-login newly registered user
      const loginSuccess = await login(email, password);
      if (loginSuccess) {
        setTimeout(() => {
          navigate('/documents');
        }, 800);
      } else {
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      }
    }
  };

  return (
    <div className="login-page-root">
      <div className="login-bg-glow" />
      <div className="login-bg-grid-pattern" />

      <div className="login-wrapper">
        {/* Left Side Branding */}
        <div className="login-hero-info">
          <div className="hero-brand-pill">
            <Sparkles size={14} />
            <span>Join QLOXA AI Platform</span>
          </div>

          <h1 className="hero-main-title">
            Unlock <span className="gradient-brand">Intelligent Workspaces</span> with Enterprise Roles
          </h1>

          <p className="hero-sub-text">
            Start parsing, indexing, and querying multi-format enterprise documentation with high-precision neural search and strict data privacy.
          </p>

          <div className="hero-features-list">
            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <CheckCircle2 size={15} />
              </div>
              <span>Role-Based Access Control (Admin, Manager, Employee)</span>
            </div>
            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <CheckCircle2 size={15} />
              </div>
              <span>Document-Level Authorization & Ownership Isolation</span>
            </div>
            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <CheckCircle2 size={15} />
              </div>
              <span>SOC2 Type II Certified with Zero Credential Leaks</span>
            </div>
          </div>
        </div>

        {/* Right Side Registration Form Card */}
        <div className="login-card-container">
          <div className="login-brand-header">
            <div className="login-logo-icon">
              <Layers size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                Create Account <span style={{ fontSize: '10px', color: '#818cf8', padding: '2px 6px', background: 'rgba(99,102,241,0.2)', borderRadius: '4px' }}>FREE</span>
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Register to access your document intelligence library</p>
            </div>
          </div>

          {/* Error / Success Feedback */}
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
              gap: '8px'
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
              gap: '8px'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-stack">
            <div className="login-field-group">
              <label>Full Name</label>
              <input
                type="text"
                id="register-name"
                placeholder="Samarth Sharma"
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
                id="register-email"
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
                id="register-password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            <div className="login-field-group">
              <label>Confirm Password</label>
              <input
                type="password"
                id="register-confirm-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            <button type="submit" id="register-submit-btn" className="login-submit-btn" disabled={loading}>
              <UserPlus size={16} />
              <span>{loading ? 'Registering...' : 'Create DocMind Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '13px',
            color: '#94a3b8',
            marginTop: '8px'
          }}>
            <span>Already have an account?</span>
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11.5px',
            color: '#10b981',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '14px',
            marginTop: '12px'
          }}>
            <ShieldCheck size={14} />
            <span>Default Role: Employee • End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
