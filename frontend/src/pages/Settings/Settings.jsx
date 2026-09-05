import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, Shield, Palette, Bell, FileText, Lock, Info,
  LogOut, Save, Moon, Sun, Monitor, AlertTriangle
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('docmind-theme') || 'system');

  // Preferences State
  const [docView, setDocView] = useState(localStorage.getItem('docmind-docview') || 'list');
  const [confirmDelete, setConfirmDelete] = useState(localStorage.getItem('docmind-confirm-delete') !== 'false');
  const [notifications, setNotifications] = useState({
    processing: localStorage.getItem('docmind-notif-proc') !== 'false',
    security: localStorage.getItem('docmind-notif-sec') !== 'false'
  });

  useEffect(() => {
    // Apply theme
    const applyTheme = (selectedTheme) => {
      let activeTheme = selectedTheme;
      if (selectedTheme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
      document.documentElement.setAttribute('data-theme', activeTheme);
    };
    applyTheme(theme);
    localStorage.setItem('docmind-theme', theme);
  }, [theme]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      return setErrorMsg('New passwords do not match.');
    }
    if (newPassword.length < 6) {
      return setErrorMsg('New password must be at least 6 characters.');
    }

    try {
      setIsChangingPassword(true);
      const res = await fetch('http://localhost:8000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(data.detail || 'Failed to change password.');
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const savePreferences = (key, value) => {
    localStorage.setItem(key, value);
    setSuccessMsg('Preferences saved.');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'documents', label: 'Document Preferences', icon: FileText },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'about', label: 'About', icon: Info },
  ];

  if (authLoading) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and platform settings.</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Nav */}
        <aside className="settings-sidebar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab.id); setErrorMsg(''); setSuccessMsg(''); }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="settings-content">
          {errorMsg && <div className="settings-alert error">{errorMsg}</div>}
          {successMsg && <div className="settings-alert success">{successMsg}</div>}

          {/* ACCOUNT */}
          {activeTab === 'account' && (
            <div className="settings-section animate-fade-in">
              <h2>Account Information</h2>
              <div className="settings-card">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={user?.name || ''} readOnly className="read-only-input" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={user?.email || ''} readOnly className="read-only-input" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value={user?.role || 'Employee'} readOnly className="read-only-input" />
                </div>
                <p className="settings-note">
                  Profile editing is currently managed by your organization administrator.
                </p>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="settings-section animate-fade-in">
              <h2>Security</h2>
              
              <div className="settings-card">
                <h3>Change Password</h3>
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="settings-btn primary" disabled={isChangingPassword}>
                    {isChangingPassword ? 'Saving...' : 'Change Password'}
                  </button>
                </form>
              </div>

              <div className="settings-card danger-zone">
                <h3>Log Out</h3>
                <p>Sign out of your account on this device.</p>
                <button className="settings-btn danger" onClick={logout}>
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="settings-section animate-fade-in">
              <h2>Appearance</h2>
              <div className="settings-card">
                <h3>Theme Preference</h3>
                <div className="theme-options">
                  <div 
                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun size={20} />
                    <span>Light</span>
                  </div>
                  <div 
                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon size={20} />
                    <span>Dark</span>
                  </div>
                  <div 
                    className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                    onClick={() => setTheme('system')}
                  >
                    <Monitor size={20} />
                    <span>System</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="settings-section animate-fade-in">
              <h2>Notifications (Local)</h2>
              <div className="settings-card">
                <div className="toggle-row">
                  <div>
                    <h4>Document Processing Alerts</h4>
                    <p>Show notifications when document processing succeeds or fails.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.processing} 
                      onChange={(e) => {
                        setNotifications(prev => ({ ...prev, processing: e.target.checked }));
                        savePreferences('docmind-notif-proc', e.target.checked);
                      }} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-row">
                  <div>
                    <h4>Security Alerts</h4>
                    <p>Show local warnings for security-related events.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifications.security} 
                      onChange={(e) => {
                        setNotifications(prev => ({ ...prev, security: e.target.checked }));
                        savePreferences('docmind-notif-sec', e.target.checked);
                      }} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <p className="settings-note">
                  * Note: Email notifications are not currently configured for this deployment. These settings only affect in-app local alerts.
                </p>
              </div>
            </div>
          )}

          {/* DOCUMENT PREFERENCES */}
          {activeTab === 'documents' && (
            <div className="settings-section animate-fade-in">
              <h2>Document Preferences</h2>
              <div className="settings-card">
                <div className="form-group">
                  <label>Default Document View</label>
                  <select 
                    value={docView}
                    onChange={(e) => {
                      setDocView(e.target.value);
                      savePreferences('docmind-docview', e.target.value);
                    }}
                  >
                    <option value="list">List View</option>
                    <option value="grid">Grid View</option>
                  </select>
                </div>
                
                <div className="toggle-row" style={{ marginTop: '20px' }}>
                  <div>
                    <h4>Confirm Deletions</h4>
                    <p>Ask for confirmation before deleting documents.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={confirmDelete} 
                      onChange={(e) => {
                        setConfirmDelete(e.target.checked);
                        savePreferences('docmind-confirm-delete', e.target.checked);
                      }} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="settings-section animate-fade-in">
              <h2>Privacy</h2>
              <div className="settings-card">
                <h3>Data Control</h3>
                <p>Manage your personal data and chat history.</p>
                <button className="settings-btn secondary" disabled title="Not implemented in current backend">
                  Clear Chat History
                </button>
              </div>
              <div className="settings-card danger-zone">
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                <div className="alert-box">
                  <AlertTriangle size={14} />
                  <span>Account deletion is currently managed by IT administrators.</span>
                </div>
                <button className="settings-btn danger" disabled>
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* ABOUT */}
          {activeTab === 'about' && (
            <div className="settings-section animate-fade-in">
              <h2>About DocMind</h2>
              <div className="settings-card text-center-about">
                <div className="about-logo">
                  <img src="/logo.png" alt="DocMind AI Logo" className="about-logo-img" />
                </div>
                <h3>DocMind AI</h3>
                <p className="version-badge">Version 1.0.0-beta</p>
                <p className="about-desc">
                  Advanced Document Intelligence platform powered by MongoDB Atlas Vector Search and Qwen2.5.
                </p>
                <div className="about-links">
                  <a href="#">Privacy Policy</a>
                  <a href="#">Terms of Service</a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;
