import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sliders,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Eye,
  X,
  History,
  Trash2,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { searchService } from '../../services/searchService';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import './Search.css';

const DEFAULT_SAMPLE_QUERIES = [
  'Revenue growth and quarterly performance',
  'Contract liability limits and indemnification',
  'Vector embeddings and HNSW query latency',
  'Working hours and remote work policies',
  'Health insurance coverage and allowances'
];

const Search = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setActiveDocName } = useChat();

  const [query, setQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [threshold, setThreshold] = useState(40);
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  // Selected chunk for modal viewing
  const [inspectingChunk, setInspectingChunk] = useState(null);

  // Recent queries key unique to current logged-in user
  const userQueryKey = user?.email
    ? `docmind_recent_queries_${user.email}`
    : user?.id
    ? `docmind_recent_queries_${user.id}`
    : 'docmind_recent_queries_guest';

  const [recentQueries, setRecentQueries] = useState([]);

  // Load saved recent queries for this specific user
  useEffect(() => {
    try {
      const stored = localStorage.getItem(userQueryKey);
      if (stored) {
        setRecentQueries(JSON.parse(stored));
      } else {
        setRecentQueries([]);
      }
    } catch (e) {
      console.error('Failed to load recent queries', e);
    }
  }, [userQueryKey]);

  // Load available documents on mount
  useEffect(() => {
    const loadDocs = async () => {
      try {
        const docs = await documentService.getDocuments();
        setDocuments(docs || []);
      } catch (err) {
        console.error('Failed to load documents for search:', err);
      }
    };
    loadDocs();
  }, []);

  const saveRecentQuery = (newQuery) => {
    const trimmed = (newQuery || '').trim();
    if (!trimmed) return;

    setRecentQueries((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(userQueryKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist recent query', e);
      }
      return updated;
    });
  };

  const handleClearRecentQueries = () => {
    setRecentQueries([]);
    try {
      localStorage.removeItem(userQueryKey);
    } catch (e) {
      console.error('Failed to clear recent queries', e);
    }
  };

  const handleSearch = async (queryToSearch) => {
    const q = (typeof queryToSearch === 'string' ? queryToSearch : query).trim();
    if (!q) return;

    saveRecentQuery(q);
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await searchService.searchDocuments(q, selectedDocId || null, 15);
      // Ensure results are sorted descending by score (best matching first)
      const sorted = (data || []).sort((a, b) => (b.score || 0) - (a.score || 0));
      setResults(sorted);
    } catch (err) {
      setError(err.message || 'Failed to perform semantic vector search. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleQueryClick = (qStr) => {
    setQuery(qStr);
    handleSearch(qStr);
  };

  const handleAskAI = (res) => {
    if (res.docName) {
      setActiveDocName(res.docName);
    }
    const snippetText = res.snippet || res.text || '';
    const initialPrompt = `Regarding "${res.docName || 'the document'}" (Page ${res.page || 1}):\n"${snippetText.slice(0, 220)}..."\nCould you elaborate and explain this in detail?`;
    
    navigate('/chat', {
      state: {
        initialPrompt,
        docName: res.docName
      }
    });
  };

  // Filter results by similarity threshold and ensure sorted descending
  const filteredResults = results
    .filter((r) => {
      const scorePct = Math.round((r.score || 0) * 100);
      return scorePct >= threshold;
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  // Highest score among all retrieved chunks
  const highestScore = results.length > 0 ? Math.round((results[0].score || 0) * 100) : 0;

  return (
    <div className="search-page-container">
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Semantic Vector Search</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Search indexed document chunks using cosine similarity embeddings across your knowledge base.
        </p>
      </div>

      {/* Hero Query Box */}
      <div className="search-hero-box">
        <div className="search-input-main-row">
          <Compass size={20} style={{ color: '#06b6d4', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Type a semantic query, concept, or phrase (e.g. 'contract liability limits' or 'annual revenue growth')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: '13px',
              cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !query.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(6, 182, 212, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>{isLoading ? 'Searching...' : 'Search Vectors'}</span>
          </button>
        </div>

        {/* Try Queries / Recent Queries Section (Saved for current user) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
          {recentQueries.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <History size={13} />
                  Your Recent Queries:
                </span>
                {recentQueries.map((rq, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQueryClick(rq)}
                    style={{
                      background: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      color: '#e0f2fe',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Click to search again"
                  >
                    {rq}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleClearRecentQueries}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Clear your recent query history"
              >
                <Trash2 size={11} />
                <span>Clear history</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Try Queries:</span>
              {DEFAULT_SAMPLE_QUERIES.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQueryClick(sq)}
                  style={{
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    color: '#38bdf8',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {sq}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Controls: Similarity Threshold + Document Scope Filter */}
        <div className="search-controls-row">
          <div className="threshold-slider-group">
            <Sliders size={14} style={{ color: '#06b6d4' }} />
            <span>Similarity Threshold: <strong>{threshold}% Relevance Cutoff</strong></span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{ width: '130px', accentColor: '#0284c7' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} style={{ color: '#06b6d4' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Target Document:</span>
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                if (query.trim()) handleSearch();
              }}
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">All Uploaded Documents ({documents.length} available)</option>
              {documents.map((d) => (
                <option key={d.document_id} value={d.document_id}>
                  {d.name} ({d.chunks} chunks)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#f87171',
          fontSize: '13px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '12px' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#06b6d4' }} />
          <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Converting query into 384-dimensional embedding and ranking relevant document chunks...
          </span>
        </div>
      )}

      {/* Results Area */}
      {!isLoading && hasSearched && (
        <div className="search-results-stack">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              FOUND {filteredResults.length} {filteredResults.length === 1 ? 'RELEVANT CHUNK' : 'RELEVANT CHUNKS'} (≥ {threshold}% RELEVANCE)
            </span>
            {results.length > filteredResults.length && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                ({results.length - filteredResults.length} chunks below threshold)
              </span>
            )}
          </div>

          {/* If no sufficiently relevant result is found, show informative fallback */}
          {filteredResults.length === 0 ? (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '40px 24px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <AlertCircle size={40} style={{ margin: '0 auto 14px', color: '#f59e0b' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No Sufficiently Relevant Result Found
              </h3>
              <p style={{ fontSize: '13.5px', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                None of the stored document chunks met your <strong>{threshold}% Relevance Cutoff</strong> for query <em>"{query}"</em>.
                {highestScore > 0 && ` The highest scoring chunk achieved ${highestScore}% similarity.`}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {highestScore > 0 && threshold > highestScore && (
                  <button
                    onClick={() => setThreshold(Math.max(5, highestScore - 5))}
                    style={{
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.35)',
                      color: '#38bdf8',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Lower Cutoff to {Math.max(5, highestScore - 5)}%
                  </button>
                )}
                {selectedDocId && (
                  <button
                    onClick={() => {
                      setSelectedDocId('');
                      handleSearch();
                    }}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Search Across All Documents
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredResults.map((res, index) => {
              const scorePct = Math.round((res.score || 0) * 100);
              const scoreColor = scorePct >= 80 ? '#10b981' : scorePct >= 60 ? '#06b6d4' : '#f59e0b';
              const snippetText = res.snippet || res.text || '';
              const isBestMatch = index === 0;

              return (
                <div
                  key={res.chunk_id || index}
                  className={`result-card-item ${isBestMatch ? 'is-best-match' : ''}`}
                >
                  <div className="result-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <FileText size={16} style={{ color: '#06b6d4', flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14.5px' }}>
                        {res.docName || res.title || 'Document'}
                      </span>
                      {res.page && (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '4px' }}>
                          Page {res.page}
                        </span>
                      )}
                      {isBestMatch && (
                        <span className="best-match-pill">
                          <Sparkles size={11} /> Best Match
                        </span>
                      )}
                    </div>

                    <span
                      className="sim-score-tag"
                      style={{
                        background: `${scoreColor}22`,
                        color: scoreColor,
                        border: `1px solid ${scoreColor}44`
                      }}
                    >
                      {scorePct}% Relevance
                    </span>
                  </div>

                  <div className="result-snippet-quote">
                    {snippetText}
                  </div>

                  <div className="result-actions-bar">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Section: {res.title || 'Document Section'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Open / View Source Document Section */}
                      <button
                        onClick={() => setInspectingChunk(res)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-color)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title="Open and inspect the full source document section"
                      >
                        <Eye size={13} style={{ color: '#06b6d4' }} />
                        <span>View Section</span>
                      </button>

                      {/* Ask AI about this snippet */}
                      <button
                        onClick={() => handleAskAI(res)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(6, 182, 212, 0.12)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          color: '#06b6d4',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <MessageSquare size={13} />
                        <span>Ask AI</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Initial Landing State */}
      {!hasSearched && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <Compass size={40} style={{ color: '#06b6d4', margin: '0 auto 16px', opacity: 0.8 }} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            High-Dimensional Semantic Vector Search
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 20px' }}>
            Type any question or natural language phrase into the search box to find matching document chunks ranked by semantic cosine similarity.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {DEFAULT_SAMPLE_QUERIES.slice(0, 3).map((sq, i) => (
              <button
                key={i}
                onClick={() => handleQueryClick(sq)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                "{sq}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Source Document Section Modal Viewer */}
      {inspectingChunk && (
        <div className="section-modal-overlay" onClick={() => setInspectingChunk(null)}>
          <div className="section-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="section-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={18} style={{ color: '#06b6d4' }} />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Source Document Section
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {inspectingChunk.docName || 'Document'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingChunk(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="section-modal-body">
              {/* Metadata Grid */}
              <div className="source-meta-grid">
                <div className="source-meta-item">
                  <span className="source-meta-label">Original Document</span>
                  <span className="source-meta-value">{inspectingChunk.docName || 'Document'}</span>
                </div>
                <div className="source-meta-item">
                  <span className="source-meta-label">Document Page</span>
                  <span className="source-meta-value">Page {inspectingChunk.page || 1}</span>
                </div>
                <div className="source-meta-item">
                  <span className="source-meta-label">Semantic Relevance</span>
                  <span className="source-meta-value" style={{ color: '#10b981' }}>
                    {Math.round((inspectingChunk.score || 0) * 100)}% Similarity
                  </span>
                </div>
                <div className="source-meta-item">
                  <span className="source-meta-label">Section Identifier</span>
                  <span className="source-meta-value">{inspectingChunk.title || inspectingChunk.chunk_id || 'N/A'}</span>
                </div>
              </div>

              {/* Full Text Content */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                  EXTRACTED SECTION TEXT
                </span>
                <div className="full-chunk-text-box">
                  {inspectingChunk.snippet || inspectingChunk.text}
                </div>
              </div>
            </div>

            <div className="section-modal-footer">
              <button
                onClick={() => {
                  setInspectingChunk(null);
                  navigate('/documents');
                }}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={13} />
                <span>View in Library</span>
              </button>

              <button
                onClick={() => {
                  const target = inspectingChunk;
                  setInspectingChunk(null);
                  handleAskAI(target);
                }}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  border: 'none',
                  color: '#fff',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <MessageSquare size={13} />
                <span>Ask AI About This Section</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;

