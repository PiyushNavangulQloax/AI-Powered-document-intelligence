import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, Mail, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword, error, setError } = useAuth();
  const [email, setEmail] = useState('qloax@gmail.com');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (resetPassword(email)) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="forgot-page-root">
      <div className="forgot-bg-glow" />

      <div className="forgot-card-container">
        <div className="forgot-brand-header">
          <div className="forgot-logo-icon">
            <Layers size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              Reset Password
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b' }}>QLOXA AI Security Protocol</p>
          </div>
        </div>

        {error && (
          <div className="error-alert-box">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="success-reset-box">
            <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px', color: '#fff' }}>Password Reset Link Sent!</strong>
              We have dispatched a secure password reset link to <strong>{email}</strong>. Please check your inbox and follow instructions.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-form-stack">
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Enter your work email address below and we will send you a secure link to reset your account password.
            </p>

            <div className="forgot-field-group">
              <label>Work Email Address</label>
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

            <button type="submit" className="forgot-submit-btn">
              <Mail size={16} />
              <span>Send Password Reset Link</span>
            </button>
          </form>
        )}

        <div className="back-to-login-link" onClick={() => navigate('/login')}>
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </div>

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
          <span>SOC2 Type II Certified • 256-bit Encryption</span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
