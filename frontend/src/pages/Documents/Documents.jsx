import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Search,
  SlidersHorizontal,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { mockRecentDocuments } from '../../services/mockData';
import './Documents.css';

function Documents() {
  const [documents, setDocuments] = useState(mockRecentDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDocForInspect, setSelectedDocForInspect] = useState(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSimulatedUpload = () => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: `Q4_Strategy_Analysis_${documents.length + 1}.pdf`,
      type: 'PDF',
      size: '4.2 MB',
      pages: 18,
      chunks: 54,
      status: 'Processing',
      uploadedAt: 'Just now',
      author: 'Strategy Team'
    };
    setDocuments([newDoc, ...documents]);
  };

  return (
    <div className="docs-page-container">
      {/* Header */}
      <div className="docs-header-bar">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>Document Library</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Manage, index, and inspect semantic vector chunks for RAG.</p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="docs-upload-dropzone" onClick={handleSimulatedUpload}>
        <div className="upload-icon-circle">
          <UploadCloud size={24} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
            Click or drag documents to index into Vector RAG
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Supports PDF, DOCX, XLSX, TXT up to 50MB per file
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="docs-filter-toolbar">
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search documents by name or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#0d1321',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '7px 12px 7px 34px',
              fontSize: '12.5px',
              color: '#f8fafc',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'PDF', 'DOCX', 'TXT'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: selectedType === type ? 'rgba(99, 102, 241, 0.2)' : '#101625',
                color: selectedType === type ? '#818cf8' : '#94a3b8',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="docs-grid-catalog">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="doc-card-box">
            <div className="doc-card-header">
              <div
                className="doc-type-icon"
                style={{
                  background: doc.type === 'PDF' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                  color: doc.type === 'PDF' ? '#06b6d4' : '#818cf8'
                }}
              >
                <FileText size={20} />
              </div>
              <div className="doc-card-info">
                <span className="doc-card-title">{doc.name}</span>
                <span className="doc-card-author">{doc.author} • {doc.uploadedAt}</span>
              </div>
            </div>

            <div className="doc-stats-pills-row">
              <span>{doc.pages} pages</span>
              <span>•</span>
              <span>{doc.chunks} chunks</span>
              <span>•</span>
              <span>{doc.size}</span>
            </div>

            <div className="doc-card-footer">
              <span className={`doc-status-chip ${doc.status.toLowerCase()}`}>
                {doc.status}
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSelectedDocForInspect(doc)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '5px 8px',
                    color: '#cbd5e1',
                    cursor: 'pointer'
                  }}
                  title="Inspect Vector Chunks"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vector Inspect Modal */}
      {selectedDocForInspect && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0e1526',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            padding: '24px',
            width: '600px',
            maxWidth: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                Vector Inspect: {selectedDocForInspect.name}
              </span>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setSelectedDocForInspect(null)} />
            </div>

            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Extracted <strong>{selectedDocForInspect.chunks}</strong> semantic vector chunks (1536-dimensional embeddings).
            </div>

            <div style={{
              background: '#090e17',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: '#38bdf8',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              Chunk #1 [Page 1]: "Q3 Financial Highlights: Consolidated net revenues increased 18.4% YoY. Enterprise subscription ARR expanded by $8.4M across North America..."
              <br /><br />
              Embedding: [-0.0142, 0.0821, -0.0049, 0.0319, ...]
            </div>

            <button
              onClick={() => setSelectedDocForInspect(null)}
              style={{
                alignSelf: 'flex-end',
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#6366f1',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
