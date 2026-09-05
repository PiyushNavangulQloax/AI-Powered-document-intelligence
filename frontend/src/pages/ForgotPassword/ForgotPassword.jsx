import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, Mail, CheckCircle2, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword, verifyResetCode, changePassword, error, setError } = useAuth();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    const success = await resetPassword(email);
    if (success) {
      setStep(2);
      setSuccessMsg("If an account exists for this email, a verification code has been sent.");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const success = await verifyResetCode(email, code);
    if (success) {
      setStep(3);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const success = await changePassword(email, code, newPassword);
    if (success) {
      setStep(4);
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
          <div className="error-alert-box" style={{marginBottom: '1rem'}}>
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

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="forgot-form-stack">
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Enter your work email address below and we will send you a secure link or verification code to reset your account password.
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
              <span>Request Verification Code</span>
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="forgot-form-stack">
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Please enter the 6-digit verification code sent to your email.
            </p>

            <div className="forgot-field-group">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            <button type="submit" className="forgot-submit-btn">
              <KeyRound size={16} />
              <span>Verify Code</span>
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleChangePassword} className="forgot-form-stack">
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Enter your new password below.
            </p>

            <div className="forgot-field-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            <div className="forgot-field-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            <button type="submit" className="forgot-submit-btn">
              <CheckCircle2 size={16} />
              <span>Change Password</span>
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="success-reset-box">
            <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px', color: '#fff' }}>Password changed successfully!</strong>
              Please log in with your new password.
            </div>
          </div>
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
          paddingTop: '14px',
          marginTop: '1.5rem'
        }}>
          <ShieldCheck size={14} />
          <span>SOC2 Type II Certified • 256-bit Encryption</span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
