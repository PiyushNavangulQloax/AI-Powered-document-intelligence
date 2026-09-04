import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { documentService } from '../../services/documentService';
import './Documents.css';

function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDocForInspect, setSelectedDocForInspect] = useState(null);
  const [inspectChunks, setInspectChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      await documentService.uploadDocument(file);
      await fetchDocuments();
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (documentId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document and its vector embeddings?')) {
      return;
    }
    try {
      await documentService.deleteDocument(documentId);
      setDocuments((prev) => prev.filter((d) => d.document_id !== documentId));
    } catch (err) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  const handleInspect = async (doc, e) => {
    e.stopPropagation();
    setSelectedDocForInspect(doc);
    setLoadingChunks(true);
    try {
      const chunks = await documentService.getDocumentChunks(doc.document_id);
      setInspectChunks(chunks);
    } catch (err) {
      console.error('Failed to inspect chunks:', err);
      setInspectChunks([]);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleChatWithDoc = (documentId, e) => {
    e.stopPropagation();
    navigate(`/chat?docId=${documentId}`);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="docs-page-container">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.docx,.doc,.txt,.md"
      />

      {/* Header */}
      <div className="docs-header-bar">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>Document Library</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Upload, index into MongoDB Atlas Vector Search (BAAI/bge-small-en-v1.5), and query with Qwen RAG.
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        className="docs-upload-dropzone"
        onClick={() => !isUploading && fileInputRef.current?.click()}
        style={{ cursor: isUploading ? 'not-allowed' : 'pointer', position: 'relative' }}
      >
        <div className="upload-icon-circle">
          {isUploading ? (
            <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <UploadCloud size={24} />
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', display: 'block' }}>
            {isUploading ? 'Extracting text & generating 384-d vector embeddings...' : 'Click to upload and index document'}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Supports PDF, DOCX, TXT. Documents are securely vectorized into MongoDB.
          </span>
        </div>
        {uploadError && (
          <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={14} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="docs-filter-toolbar">
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search documents by name..."
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
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          Loading documents from MongoDB...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', background: '#0e1526', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 600 }}>No documents found</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Upload your first document above to begin intelligent RAG analysis!</p>
        </div>
      ) : (
        <div className="docs-grid-catalog">
          {filteredDocs.map((doc) => (
            <div key={doc.document_id} className="doc-card-box">
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
                  <span className="doc-card-author">{doc.uploaded_at || 'Indexed'}</span>
                </div>
              </div>

              <div className="doc-stats-pills-row">
                <span>{doc.pages || 1} pages</span>
                <span>•</span>
                <span>{doc.chunks} chunks</span>
                <span>•</span>
                <span>{doc.size}</span>
              </div>

              <div className="doc-card-footer">
                <span className={`doc-status-chip ${doc.status?.toLowerCase() || 'ready'}`}>
                  {doc.status || 'Ready'}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {/* Chat With This Document */}
                  <button
                    onClick={(e) => handleChatWithDoc(doc.document_id, e)}
                    style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      color: '#818cf8',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Ask Questions About This Document"
                  >
                    <Sparkles size={12} />
                    <span>Ask AI</span>
                  </button>

                  {/* Inspect Vector Chunks */}
                  <button
                    onClick={(e) => handleInspect(doc, e)}
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

                  {/* Delete Document */}
                  <button
                    onClick={(e) => handleDelete(doc.document_id, e)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      color: '#f87171',
                      cursor: 'pointer'
                    }}
                    title="Delete Document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vector Inspect Modal */}
      {selectedDocForInspect && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
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
            width: '680px',
            maxWidth: '92%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '85vh'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                Vector Inspect: {selectedDocForInspect.name}
              </span>
              <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setSelectedDocForInspect(null)} />
            </div>

            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Extracted <strong>{selectedDocForInspect.chunks}</strong> semantic vector chunks (384-dimensional BGE embeddings stored in MongoDB).
            </div>

            <div style={{
              background: '#090e17',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '12px',
              color: '#38bdf8',
              maxHeight: '380px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {loadingChunks ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  Loading vector chunks from MongoDB...
                </div>
              ) : inspectChunks.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  No vector chunks found for this document.
                </div>
              ) : (
                inspectChunks.map((chunk, idx) => (
                  <div key={chunk.chunk_id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#818cf8', marginBottom: '4px' }}>
                      {chunk.chunk_id} • {chunk.title} {chunk.page ? `(Page ${chunk.page})` : ''}
                    </div>
                    <div style={{ color: '#cbd5e1', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '6px' }}>
                      {chunk.text}
                    </div>
                    {chunk.embedding_sample && (
                      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                        Embedding [dim 0..4]: [{chunk.embedding_sample.map((n) => n.toFixed(4)).join(', ')}, ...]
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={(e) => {
                  setSelectedDocForInspect(null);
                  handleChatWithDoc(selectedDocForInspect.document_id, e);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid #6366f1',
                  color: '#818cf8',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} />
                Ask Questions on this Document
              </button>

              <button
                onClick={() => setSelectedDocForInspect(null)}
                style={{
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
        </div>
      )}
    </div>
  );
}

export default Documents;
