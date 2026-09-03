import React from 'react';
import { FileText, Search, Download, Trash2, PlusCircle, Menu } from 'lucide-react';
import './Navbar.css';

function Navbar({ onToggleSidebar, activeDocName = 'Q3_Financial_Analysis.pdf', onNewChat }) {
  return (
    <header className="navbar-header-bar">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={onToggleSidebar} style={{ display: 'none' }}>
        <Menu size={18} />
      </button>

      {/* Active Document Pill */}
      <div className="active-doc-pill">
        <FileText size={15} style={{ color: '#06b6d4' }} />
        <span className="active-doc-name">{activeDocName}</span>
        <span className="file-type-badge">PDF</span>
        <span className="upload-time-sub">Uploaded 2 minutes ago</span>
      </div>

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
        <button className="header-btn-secondary">
          <Trash2 size={14} />
          <span>Clear</span>
        </button>
        <button className="header-btn-primary" onClick={onNewChat}>
          <PlusCircle size={14} />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
