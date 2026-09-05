import React from 'react';
import { FileText, Search, Download, Trash2, PlusCircle, Menu } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onToggleSidebar }) {
  const { activeDocName, startNewConversation, setMessages, messages } = useChat();
  const navigate = useNavigate();

  const handleNewChat = () => {
    startNewConversation();
    navigate('/chat');
  };

  const handleClear = () => {
    const validMsgs = (messages || []).filter(m => !m.isGenerating && m.content);
    if (validMsgs.length === 0) {
      alert('No active chat messages to clear.');
      return;
    }
    if (window.confirm('Are you sure you want to clear the current conversation?')) {
      startNewConversation();
      navigate('/chat');
    }
  };

  const handleExport = () => {
    const validMsgs = (messages || []).filter(m => !m.isGenerating && m.content);
    if (validMsgs.length === 0) {
      alert('No conversation messages to export. Ask a question first!');
      return;
    }

    const docScope = activeDocName || 'All Uploaded Documents';
    const timestamp = new Date().toLocaleString();

    let markdown = `# QLOXA AI — Conversation & Document Analysis Report\n`;
    markdown += `**Document Scope:** ${docScope}\n`;
    markdown += `**Export Date:** ${timestamp}\n`;
    markdown += `**Total Messages:** ${validMsgs.length}\n\n`;
    markdown += `---\n\n`;

    validMsgs.forEach((msg, idx) => {
      const isUser = msg.role === 'user';
      const speaker = isUser ? '👤 User' : '🤖 QLOXA AI Assistant';
      const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
      
      markdown += `### ${idx + 1}. ${speaker} ${timeStr ? `(${timeStr})` : ''}\n\n`;
      markdown += `${msg.content}\n\n`;

      if (!isUser && msg.sources && msg.sources.length > 0) {
        markdown += `**Cited Sources:**\n`;
        msg.sources.forEach((src) => {
          const docName = src.document_name || 'Document Chunk';
          const page = src.page ? ` (Page ${src.page})` : '';
          const score = src.score ? ` [Confidence: ${Math.round(src.score * 100)}%]` : '';
          markdown += `- ${docName}${page}${score}\n`;
        });
        markdown += `\n`;
      }

      if (!isUser && msg.metrics && Object.keys(msg.metrics).length > 0) {
        const { latency_ms, faithfulness_score, relevance_score } = msg.metrics;
        const details = [];
        if (latency_ms) details.push(`Latency: ${latency_ms}ms`);
        if (faithfulness_score) details.push(`Faithfulness: ${Math.round(faithfulness_score * 100)}%`);
        if (relevance_score) details.push(`Relevance: ${Math.round(relevance_score * 100)}%`);
        if (details.length > 0) {
          markdown += `*Metrics: ${details.join(' | ')}*\n\n`;
        }
      }

      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedDoc = (docScope.replace(/[^a-zA-Z0-9_-]/g, '_')).slice(0, 30);
    a.download = `qloxa-chat-export-${sanitizedDoc}-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <button className="header-btn-secondary" onClick={handleExport} title="Export current conversation as Markdown">
          <Download size={14} />
          <span>Export</span>
        </button>
        <button className="header-btn-secondary" onClick={handleClear} title="Clear current conversation messages">
          <Trash2 size={14} />
          <span>Clear</span>
        </button>
        <button className="header-btn-primary" onClick={handleNewChat} title="Start new conversation">
          <PlusCircle size={14} />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
