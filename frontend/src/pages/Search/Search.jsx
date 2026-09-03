import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search as SearchIcon,
  Sliders,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import './Search.css';

const MOCK_SEARCH_RESULTS = [
  {
    id: 'res-1',
    score: '98.4%',
    docName: 'Q3_Financial_Analysis.pdf',
    page: 14,
    snippet: '...Consolidated Net Revenue reached $48.2 million for the quarter ending September 30, reflecting an 18.4% year-over-year expansion. Enterprise SaaS ARR added $8.4M in recurring bookings...',
    category: 'Financial'
  },
  {
    id: 'res-2',
    score: '94.1%',
    docName: 'Vendor_Contract_v4.docx',
    page: 8,
    snippet: '...In no event shall either party’s aggregate liability arising out of or related to this Master Services Agreement exceed the total fees paid or payable by Customer in the 12 months preceding the claim...',
    category: 'Legal'
  },
  {
    id: 'res-3',
    score: '89.7%',
    docName: 'Architecture_Design_Doc.pdf',
    page: 22,
    snippet: '...Vector embeddings are generated using text-embedding-3-small (1536 dimensions) and upserted into high-throughput HNSW index clusters with sub-15ms query latency target...',
    category: 'Architecture'
  }
];

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('revenue growth and contract liability limits');
  const [threshold, setThreshold] = useState(80);

  return (
    <div className="search-page-container">
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>Semantic Vector Search</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>Search indexed document chunks using cosine similarity embeddings across your knowledge base.</p>
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
          />
          <button style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
            border: 'none',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Search Vectors
          </button>
        </div>

        <div className="search-controls-row">
          <div className="threshold-slider-group">
            <Sliders size={14} style={{ color: '#06b6d4' }} />
            <span>Similarity Threshold: <strong>{threshold}% Match Cutoff</strong></span>
            <input
              type="range"
              min="50"
              max="99"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{ width: '120px', accentColor: '#6366f1' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} />
            <span>Targeting 5 Active Documents</span>
          </div>
        </div>
      </div>

      {/* Search Results List */}
      <div className="search-results-stack">
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
          FOUND {MOCK_SEARCH_RESULTS.length} HIGH-CONFIDENCE SEMANTIC MATCHES
        </span>

        {MOCK_SEARCH_RESULTS.map((res) => (
          <div key={res.id} className="result-card-item">
            <div className="result-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} style={{ color: '#38bdf8' }} />
                <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '14px' }}>{res.docName}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>• Page {res.page}</span>
              </div>
              <span className="sim-score-tag">{res.score} Cosine Match</span>
            </div>

            <div className="result-snippet-quote">
              {res.snippet}
            </div>

            <div className="result-actions-bar">
              <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 600 }}>Category: {res.category}</span>
              <button
                onClick={() => navigate('/chat')}
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
