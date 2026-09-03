import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search as SearchIcon,
  Sliders,
  FileText,
  MessageSquare,
  ArrowRight,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Search.css';

const Search = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [query, setQuery] = useState('revenue growth and contract liability limits');
  const [threshold, setThreshold] = useState(65);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchQuery = query, searchThreshold = threshold) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await api.searchDocuments(searchQuery, searchThreshold, null, token);
      setResults(response.results || []);
    } catch (err) {
      console.warn('Semantic search API call notice:', err);
      setError(err.message || 'Failed to complete semantic vector search');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.searchDocuments('revenue growth and contract liability limits', threshold, null, token)
      .then((res) => {
        if (isMounted) {
          setResults(res.results || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to complete semantic vector search');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [token, threshold]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query, threshold);
    }
  };

  const handleThresholdChange = (newVal) => {
    setThreshold(newVal);
    handleSearch(query, newVal);
  };

  const handleAskAI = (res) => {
    navigate('/chat', {
      state: {
        initialPrompt: `Analyze this passage from ${res.document_name} (Page ${res.page}): "${res.snippet}"`,
        docName: res.document_name
      }
    });
  };

  return (
    <div className="search-page-container">
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>Semantic Vector Search</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Search indexed document chunks using cosine similarity embeddings across your knowledge base.
        </p>
      </div>

      {/* Hero Query Box */}
      <div className="search-hero-box">
        <div className="search-input-main-row">
          <Compass size={20} style={{ color: '#818cf8' }} />
          <input
            type="text"
            placeholder="Type a semantic query or phrase..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={() => handleSearch(query, threshold)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <SearchIcon size={16} />}
            <span>{loading ? 'Searching...' : 'Search Vectors'}</span>
          </button>
        </div>

        <div className="search-controls-row">
          <div className="threshold-slider-group">
            <Sliders size={14} style={{ color: '#06b6d4' }} />
            <span>Similarity Threshold: <strong>{threshold}% Match Cutoff</strong></span>
            <input
              type="range"
              min="30"
              max="95"
              value={threshold}
              onChange={(e) => handleThresholdChange(Number(e.target.value))}
              style={{ width: '120px', accentColor: '#6366f1' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} />
            <span>Targeting Active Knowledge Base</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#f87171',
          fontSize: '13px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Results List */}
      <div className="search-results-stack">
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
          {loading
            ? 'RETRIEVING SEMANTIC CHUNKS...'
            : `FOUND ${results.length} HIGH-CONFIDENCE SEMANTIC MATCHES (THRESHOLD ≥ ${threshold}%)`}
        </span>

        {results.length === 0 && !loading && (
          <div style={{
            padding: '36px',
            textAlign: 'center',
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            color: '#94a3b8'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '6px' }}>No vector chunks matched your similarity cutoff.</p>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Try lowering the similarity threshold slider above or expanding your search query.</p>
          </div>
        )}

        {results.map((res) => (
          <div key={res.id} className="result-card-item">
            <div className="result-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} style={{ color: '#38bdf8' }} />
                <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '14px' }}>{res.document_name}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>• Page {res.page}</span>
              </div>
              <span className="sim-score-tag">{res.score_percentage} Cosine Match</span>
            </div>

            <div className="result-snippet-quote">
              {res.snippet}
            </div>

            <div className="result-actions-bar">
              <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 600 }}>Category: {res.category}</span>
              <button
                onClick={() => handleAskAI(res)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  color: '#818cf8',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={14} />
                <span>Ask AI About This Snippet</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
