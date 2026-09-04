import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Layers,
  BarChart3,
  FileCheck,
  HelpCircle,
  Star,
  ArrowRight,
  Paperclip,
  Send,
  ShieldCheck,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { documentService } from '../../services/documentService';
import './Chat.css';

const DEFAULT_TEMPLATES = [
  {
    id: '1',
    icon: BarChart3,
    tag: 'Policy & Rules',
    title: 'Check Leave & Vacation Policy',
    desc: 'Verify the annual leave days, carryover limits, and request rules.',
    prompt: 'How many annual leave days do employees receive?'
  },
  {
    id: '2',
    icon: FileCheck,
    tag: 'Benefits & Perks',
    title: 'Explore Health & Allowances',
    desc: 'Extract full details regarding health insurance and annual allowances.',
    prompt: 'When does health insurance become available and what is the development allowance?'
  },
  {
    id: '3',
    icon: HelpCircle,
    tag: 'Working Hours',
    title: 'Working Hours & Remote Work',
    desc: 'Ask about standard shift timings and remote working guidelines.',
    prompt: 'What are the standard working hours and remote work policies?'
  },
  {
    id: '4',
    icon: Star,
    tag: 'Out-of-Scope Test',
    title: 'Test Evidence Guardrails',
    desc: 'Ask a question not covered by the document to verify the AI does not hallucinate.',
    prompt: 'What is the company maternity leave policy?'
  }
];

const ChatWindow = () => {
  const [searchParams] = useSearchParams();
  const docIdFromUrl = searchParams.get('docId');

  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(docIdFromUrl || '');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await documentService.getDocuments();
        setDocuments(docs);
        if (docIdFromUrl && docs.some((d) => d.document_id === docIdFromUrl)) {
          setSelectedDocId(docIdFromUrl);
        } else if (!selectedDocId && docs.length > 0) {
          // Default to first document if available
          setSelectedDocId(docs[0].document_id);
        }
      } catch (err) {
        console.error('Failed to load documents:', err);
      }
    };
    fetchDocs();
  }, [docIdFromUrl]);

  const activeDoc = documents.find((d) => d.document_id === selectedDocId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await documentService.uploadDocument(file);
      const docs = await documentService.getDocuments();
      setDocuments(docs);
      if (res.document?.document_id) {
        setSelectedDocId(res.document.document_id);
      }
    } catch (err) {
      alert('Failed to upload document: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Real API Call to Qwen RAG backend
      const res = await chatService.sendMessage(query, selectedDocId || null);

      const citations = (res.sources || []).map((s) => ({
        doc: s.title || s.chunk_id || activeDoc?.name || 'Document',
        page: s.page,
        score: s.score ? `${(s.score * 100).toFixed(1)}% Match` : null
      }));

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.answer,
        citations: citations,
        evidence: res.evidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Error contacting RAG service: ${err.message}. Please check if backend server is running.`,
        citations: [],
        evidence: 'ERROR',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      {/* Hidden file upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept=".pdf,.docx,.doc,.txt,.md"
      />

      {/* Scoped Document Indicator Bar */}
      <div style={{
        background: '#0d1321',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={16} style={{ color: '#818cf8' }} />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Active Document Scope:</span>
          
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            style={{
              background: '#131b2e',
              color: '#f8fafc',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12.5px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Uploaded Documents</option>
            {documents.map((d) => (
              <option key={d.document_id} value={d.document_id}>
                {d.name} ({d.chunks} chunks)
              </option>
            ))}
          </select>
        </div>

        {activeDoc && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#38bdf8' }}>
            <span style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              Filtering only chunks in "{activeDoc.name}"
            </span>
            <button
              onClick={() => setSelectedDocId('')}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Clear Document Scope"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        /* Empty Landing State */
        <div className="chat-landing-view">
          <div className="pulsing-logo-circle">
            <Layers size={36} />
          </div>

          <h1 className="chat-landing-title">
            Ask <span className="qloxa-brand-highlight">DocMind AI</span> about your documents
          </h1>

          <p className="chat-landing-subtitle">
            {activeDoc
              ? `Currently asking questions strictly from "${activeDoc.name}". The AI only uses facts inside this document.`
              : 'Deep document intelligence powered by MongoDB Atlas Vector Search and Qwen2.5-7B-Instruct.'}
          </p>

          <div className="template-cards-grid">
            {DEFAULT_TEMPLATES.map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.id}
                  className="template-card"
                  onClick={() => handleSend(card.prompt)}
                >
                  <div className="card-top-row">
                    <div className="card-icon-box">
                      <IconComp size={18} />
                    </div>
                    <span className="card-tag-pill">{card.tag}</span>
                  </div>

                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-desc">{card.desc}</p>

                  <div className="card-ask-action">
                    <span>Ask AI</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active Messages View */
        <div className="messages-list-wrapper">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${msg.sender === 'user' ? 'user-row' : ''}`}
            >
              <div className={`msg-avatar ${msg.sender === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                {msg.sender === 'user' ? 'ME' : <Sparkles size={16} />}
              </div>

              <div className={`msg-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.text}</div>

                {/* Evidence Verification Badge */}
                {msg.sender === 'ai' && msg.evidence && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {msg.evidence === 'YES' ? (
                      <span style={{
                        fontSize: '11px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#4ade80',
                        background: 'rgba(74, 222, 128, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(74, 222, 128, 0.2)'
                      }}>
                        <CheckCircle2 size={12} />
                        Evidence Verified in Document
                      </span>
                    ) : msg.evidence === 'NO' ? (
                      <span style={{
                        fontSize: '11px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#fbbf24',
                        background: 'rgba(251, 191, 36, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(251, 191, 36, 0.2)'
                      }}>
                        <AlertTriangle size={12} />
                        No Direct Evidence Found in Document
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Source Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="source-citations-container">
                    {msg.citations.map((c, i) => (
                      <div key={i} className="citation-chip">
                        <FileText size={12} />
                        <span>{c.doc} {c.page ? `(p. ${c.page})` : ''}</span>
                        {c.score && <span style={{ fontSize: '10px', opacity: 0.8 }}>• {c.score}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {msg.sender === 'ai' && (
                  <div className="msg-actions-row">
                    <Copy
                      size={13}
                      className="msg-action-btn"
                      title="Copy to clipboard"
                      onClick={() => navigator.clipboard.writeText(msg.text)}
                    />
                    <ThumbsUp size={13} className="msg-action-btn" title="Good response" />
                    <ThumbsDown size={13} className="msg-action-btn" title="Bad response" />
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#475569' }}>{msg.timestamp}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-row">
              <div className="msg-avatar ai-avatar">
                <Sparkles size={16} />
              </div>
              <div className="msg-bubble ai-bubble" style={{ color: '#818cf8', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Searching vector embeddings & generating verified answer with Qwen...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Floating Bottom Input Footer */}
      <div className="chat-input-sticky-footer">
        <div className="input-card-box">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ background: 'none', border: 'none', cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            title={isUploading ? 'Uploading...' : 'Upload & Index New Document'}
          >
            {isUploading ? (
              <Loader2 size={18} className="animate-spin" style={{ color: '#818cf8', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Paperclip size={18} className="input-icon-btn" />
            )}
          </button>

          <textarea
            className="chat-textarea"
            rows={1}
            placeholder={
              activeDoc
                ? `Ask a question about "${activeDoc.name}"... (Shift+Enter for newline)`
                : 'Ask a question about your documents... (Shift+Enter for newline)'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button className="send-msg-btn" onClick={() => handleSend()} disabled={isTyping}>
            <Send size={16} />
          </button>
        </div>

        <div className="chat-disclaimer-row">
          <span>DocMind AI answers strictly from your uploaded documents.</span>
          <div className="rag-status-badge">
            <ShieldCheck size={13} />
            <span>MongoDB Atlas Vector Search • BGE 384-d • Qwen2.5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
