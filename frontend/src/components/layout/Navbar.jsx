import React from 'react';
import { FileText, Search, Download, Trash2, PlusCircle, Menu } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onToggleSidebar }) {
  const { activeDocName, startNewConversation, setMessages } = useChat();
  const navigate = useNavigate();

  const handleNewChat = () => {
    startNewConversation();
    navigate('/chat');
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <header className="navbar-header-bar">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={onToggleSidebar} style={{ display: 'none' }}>
        <Menu size={18} />
      </button>

      {/* Active Document Pill */}
      {activeDocName && activeDocName !== 'All Uploaded Documents' && activeDocName !== 'Select Document' && (
        <div className="active-doc-pill">
          <FileText size={15} style={{ color: '#06b6d4' }} />
          <span className="active-doc-name">{activeDocName}</span>
        </div>
      )}
      
      {(!activeDocName || activeDocName === 'All Uploaded Documents' || activeDocName === 'Select Document') && (
        <div className="active-doc-pill" style={{ opacity: 0.7 }}>
          <FileText size={15} style={{ color: '#94a3b8' }} />
          <span className="active-doc-name" style={{ color: '#94a3b8' }}>Global Search</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="header-search-box">
        <Search size={14} className="header-search-icon" />
        <input type="text" placeholder="Search messages..." />
        <span className="header-search-shortcut">⌘K</span>
      </div>

      {/* Action Buttons */}
      <div className="header-actions-group">
        <button className="header-btn-secondary">
          <Download size={14} />
          <span>Export</span>
        </button>
        <button className="header-btn-secondary" onClick={handleClear}>
          <Trash2 size={14} />
          <span>Clear</span>
        </button>
        <button className="header-btn-primary" onClick={handleNewChat}>
          <PlusCircle size={14} />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
