import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  BarChart3,
  FileCheck,
  HelpCircle,
  Star,
  ArrowRight,
  Paperclip,
  Sliders,
  Send,
  ShieldCheck,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Sparkles
} from 'lucide-react';
import './Chat.css';

const TEMPLATE_CARDS = [
  {
    id: 'financial',
    icon: BarChart3,
    tag: 'Financial SIG',
    title: 'Summarize Q3 Financial Metrics',
    desc: 'Get key summaries from key financial highlights, revenue breakdown, and profit trends in Q3 Financial.',
    prompt: 'Summarize key financial highlights, revenue breakdown, and profit trends from Q3_Financial_Analysis.pdf.'
  },
  {
    id: 'legal',
    icon: FileCheck,
    tag: 'Legal Analysis',
    title: 'Extract Risk & Liability Clauses',
    desc: 'Scan Vendor Contract v4.docx and list all indemnity clauses, limitation of liability, and obligations.',
    prompt: 'Extract and analyze all risk, limitation of liability, and indemnity clauses from Vendor Contract v4.docx.'
  },
  {
    id: 'architecture',
    icon: HelpCircle,
    tag: 'Architecture',
    title: 'Compare Tech Stack & Dependencies',
    desc: 'Compare the system architecture and required protocols mentioned in Architecture Design Doc.pdf.',
    prompt: 'Compare tech stack, protocols, and microservice dependencies mentioned in Architecture Design Doc.pdf.'
  },
  {
    id: 'synthesis',
    icon: Star,
    tag: 'Smart Synthesis',
    title: 'Generate Executive Summary Slide',
    desc: 'Create a bullet-point executive summary with citations suitable for C-level presentation.',
    prompt: 'Generate an executive bullet-point summary suitable for C-level presentation based on current active documents.'
  }
];

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
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

    // Simulate RAG Vector search response
    setTimeout(() => {
      let aiText = '';
      let citations = [];

      if (query.toLowerCase().includes('financial') || query.toLowerCase().includes('q3')) {
        aiText = `Based on **Q3_Financial_Analysis.pdf**:\n\n• **Total Revenue**: $48.2M (+18.4% YoY increase driven by Cloud Enterprise tier).\n• **Operating Margin**: Expanded by 240 bps to 31.8%.\n• **Net Income**: $14.1M compared to $11.5M in Q2.\n• **Key Risks**: Higher GPU computing infrastructure costs offsetting SaaS Gross Margins by ~2.1%.`;
        citations = [
          { doc: 'Q3_Financial_Analysis.pdf', page: 4, score: '98.6% Match' },
          { doc: 'Q3_Financial_Analysis.pdf', page: 12, score: '94.2% Match' }
        ];
      } else if (query.toLowerCase().includes('contract') || query.toLowerCase().includes('risk') || query.toLowerCase().includes('liability')) {
        aiText = `Scanning **Vendor_Contract_v4.docx** yielded 3 critical risk findings:\n\n1. **Indemnification Clause (§8.2)**: Vendor limits total aggregate liability to 1x Annual Contract Value ($250k caps).\n2. **Data Privacy Breach (§11.4)**: 24-hour mandatory disclosure SLA with zero penalty liquidated damages.\n3. **Termination Notice (§14.1)**: Requires 60-day written notice prior to auto-renewal.`;
        citations = [
          { doc: 'Vendor_Contract_v4.docx', page: 8, score: '97.1% Match' },
          { doc: 'Vendor_Contract_v4.docx', page: 15, score: '91.8% Match' }
        ];
      } else {
        aiText = `Vector RAG synthesis for active documents (**Q3_Financial_Analysis.pdf**, **Vendor_Contract_v4.docx**):\n\nKey finding: The system analyzed 164 semantic vector chunks across 5 indexed documents. High confidence scores confirm alignment with core operational protocols and security policies.`;
        citations = [
          { doc: 'Q3_Financial_Analysis.pdf', page: 2, score: '95.4% Match' },
          { doc: 'Architecture_Design_Doc.pdf', page: 19, score: '89.2% Match' }
        ];
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        citations: citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        /* Empty Landing State - Exact Match to Screenshot */
        <div className="chat-landing-view">
          <div className="pulsing-logo-circle">
            <Layers size={36} />
          </div>

          <h1 className="chat-landing-title">
            How can <span className="qloxa-brand-highlight">QLOXA AI</span> assist your analysis today?
          </h1>

          <p className="chat-landing-subtitle">
            Deep document understanding powered by high-precision Vector RAG. Ask questions, compare sections, or extract hidden data instantly.
          </p>

          <div className="template-cards-grid">
            {TEMPLATE_CARDS.map((card) => {
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
                {msg.sender === 'user' ? 'QX' : <Sparkles size={16} />}
              </div>

              <div className={`msg-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="source-citations-container">
                    {msg.citations.map((c, i) => (
                      <div key={i} className="citation-chip">
                        <FileText size={12} />
                        <span>{c.doc} (p. {c.page})</span>
                        <span style={{ fontSize: '10px', opacity: 0.8 }}>• {c.score}</span>
                      </div>
                    ))}
                  </div>
                )}

                {msg.sender === 'ai' && (
                  <div className="msg-actions-row">
                    <Copy size={13} className="msg-action-btn" title="Copy to clipboard" />
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
                <span>Searching vector embeddings & generating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Floating Bottom Input Footer */}
      <div className="chat-input-sticky-footer">
        <div className="input-card-box">
          <Paperclip size={18} className="input-icon-btn" title="Attach file" />
          <Sliders size={18} className="input-icon-btn" title="Tune RAG parameters" />

          <textarea
            className="chat-textarea"
            rows={1}
            placeholder="Ask a question about your documents... (Shift+Enter for newline)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button className="send-msg-btn" onClick={() => handleSend()}>
            <Send size={16} />
          </button>
        </div>

        <div className="chat-disclaimer-row">
          <span>QLOXA AI can make mistakes. Please verify important information.</span>
          <div className="rag-status-badge">
            <ShieldCheck size={13} />
            <span>Powered by QLOXA Deep Precision Vector RAG 4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
