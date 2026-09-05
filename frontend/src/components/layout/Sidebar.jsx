import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layers, Plus, ChevronDown, RotateCw, Search,
  FileText, MessageSquare, LayoutDashboard, Files,
  Compass, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { documentService } from '../../services/documentService';
import { chatService } from '../../services/chatService';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { startNewConversation, loadConversation, currentConversationId, activeDocName, setActiveDocName } = useChat();
  
  const [docSearch, setDocSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState('QLOXA DeepSIG 4.0 (Trial)');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  
  const [activeDocuments, setActiveDocuments] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSidebarData();
  }, [currentConversationId]); // Refresh when a conversation changes

  const fetchSidebarData = async () => {
    setIsRefreshing(true);
    try {
      const [docs, chats] = await Promise.all([
        documentService.getDocuments(),
        chatService.getConversations().catch(() => ({ conversations: [] }))
      ]);
      setActiveDocuments(docs || []);
      setRecentConversations(chats.conversations || []);
    } catch (err) {
      console.error('Failed to fetch sidebar data', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const models = [
    'QLOXA DeepSIG 4.0 (Trial)',
    'QLOXA Vector RAG 4.0 Enterprise',
    'GPT-4o Document Intelligence',
    'Claude 3.5 Sonnet RAG'
  ];

  const filteredDocs = activeDocuments.filter(d =>
    d.name.toLowerCase().includes(docSearch.toLowerCase())
  );

  const navItems = [
    { to: '/chat', label: 'AI Chat & RAG', icon: MessageSquare },
    { to: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/documents', label: 'Document Library', icon: Files },
    { to: '/search', label: 'Semantic Vector Search', icon: Compass },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const handleNewAnalysis = () => {
    startNewConversation();
    navigate('/chat');
    if (onClose) onClose();
  };

  const handleSelectConversation = (convId) => {
    loadConversation(convId);
    navigate('/chat');
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar-container ${isOpen ? 'is-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <img src="/logo.png" alt="DocMind AI Logo" className="sidebar-logo-img" />
        </div>
        <div className="sidebar-brand-info">
          <div className="sidebar-brand-title">
            QLOXA AI <span className="sidebar-beta-badge">BETA</span>
          </div>
          <span className="sidebar-brand-sub">Document Intelligence Platform</span>
        </div>
      </div>

      {/* New Analysis Action Button */}
      <div className="sidebar-action-wrap">
        <button className="new-analysis-btn" onClick={handleNewAnalysis}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            <span>New Analysis</span>
          </div>
          <span className="hotkey-tag">⌘K</span>
        </button>
      </div>

      {/* Navigation section */}
      <div className="nav-links-section">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* AI Partner Selector */}
      <div className="sidebar-section">
        <div className="section-label-row">
          <span>AI PARTNER</span>
        </div>
        <div 
          className="partner-select-box" 
          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
        >
          <div className="partner-left-group">
            <Layers size={14} style={{ color: '#818cf8' }} />
            <span>{selectedModel}</span>
          </div>
          <ChevronDown size={14} style={{ color: '#64748b' }} />
        </div>
        {isModelDropdownOpen && (
          <div style={{
            background: '#121827',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            marginTop: '4px',
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
          }}>
            {models.map(m => (
              <div 
                key={m} 
                onClick={() => { setSelectedModel(m); setIsModelDropdownOpen(false); }}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: selectedModel === m ? '#818cf8' : '#cbd5e1',
                  background: selectedModel === m ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Documents List */}
      <div className="sidebar-section">
        <div className="section-label-row">
          <span>ACTIVE DOCUMENTS ({activeDocuments.length})</span>
          <RotateCw size={12} className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`} onClick={fetchSidebarData} />
        </div>

        <div className="doc-search-box">
          <Search size={12} className="doc-search-icon" />
          <input
            type="text"
            placeholder="Search documents..."
            value={docSearch}
            onChange={(e) => setDocSearch(e.target.value)}
          />
        </div>

        <div className="doc-list">
          {filteredDocs.map((doc) => (
            <div
              key={doc.document_id}
              className={`doc-item ${activeDocName === doc.name ? 'active' : ''}`}
              onClick={() => setActiveDocName(doc.name)}
            >
              <FileText size={14} style={{ color: doc.type === 'PDF' ? '#06b6d4' : doc.type === 'DOCX' ? '#6366f1' : '#10b981' }} />
              <span className="doc-name">{doc.name}</span>
              <span className="status-dot-green" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="sidebar-section">
        <div className="section-label-row">
          <span>RECENT CONVERSATIONS</span>
        </div>
        <div className="chat-list">
          {recentConversations.length === 0 && (
            <div style={{ padding: '10px', fontSize: '12px', color: '#64748b' }}>No recent chats.</div>
          )}
          {recentConversations.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${currentConversationId === chat.id ? 'active' : ''}`}
              onClick={() => handleSelectConversation(chat.id)}
            >
              <MessageSquare size={14} style={{ color: '#818cf8' }} />
              <span className="doc-name">{chat.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-spacer" />

      {/* User Profile Footer */}
      <div className="sidebar-user-footer">
        <div className="user-profile-info">
          <div className="user-avatar-pill">{user?.avatarInitials || 'QX'}</div>
          <div className="user-text-details">
            <span className="user-name-text">{user?.name || 'Qloax Admin'}</span>
            <span className="user-email-text">{user?.email || 'qloax@gmail.com'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut
            size={16}
            className="gear-icon-btn"
            style={{ color: '#ef4444' }}
            title="Sign Out"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
