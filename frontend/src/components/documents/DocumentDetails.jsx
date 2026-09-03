import React from 'react';
import {
  FileText,
  Clock,
  Layers,
  Database,
  Cpu,
  User,
  Hash,
  MessageSquare,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import './DocumentComponents.css';

/**
 * DocumentDetails - Modal / Drawer showing comprehensive document information,
 * metadata, semantic vector embeddings stats, and vector chunk preview.
 */
function DocumentDetails({
  document,
  isOpen,
  onClose,
  onDelete,
  onInspect,
  onAskInChat
}) {
  if (!document) return null;

  const {
    id,
    name = 'Document',
    type = 'PDF',
    size = '0 KB',
    pages = 0,
    chunks = 0,
    status = 'Processed',
    uploadedAt = 'Recently',
    author = 'System',
    embeddingModel = 'text-embedding-3-small',
    dimensions = 1536,
    chunkSize = '512 tokens (50 token overlap)'
  } = document;

  const statusLower = (status || '').toLowerCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document Intelligence Details"
      subtitle={`Metadata & RAG Vector Status for ${name}`}
      size="lg"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {onDelete ? (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => {
                onClose?.();
                onDelete?.(document);
              }}
            >
              Delete Document
            </Button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '8px' }}>
            {onInspect && (
              <Button
                variant="secondary"
                size="sm"
                icon={Cpu}
                onClick={() => {
                  onClose?.();
                  onInspect?.(document);
                }}
              >
                Inspect Chunks
              </Button>
            )}

            {onAskInChat && (
              <Button
                variant="primary"
                size="sm"
                icon={MessageSquare}
                onClick={() => onAskInChat?.(document)}
              >
                Query in Chat
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="doc-details-container">
        {/* Document Header Card */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>{name}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Doc ID: {id}</div>
            </div>
          </div>

          <span className={`doc-status-badge ${statusLower}`}>
            {statusLower === 'processed' && <CheckCircle2 size={12} />}
            {statusLower === 'processing' && <Loader2 size={12} className="btn-spinner" />}
            {statusLower === 'failed' && <AlertTriangle size={12} />}
            <span>{status}</span>
          </span>
        </div>

        {/* Metadata Grid */}
        <div className="doc-details-grid">
          <div className="doc-details-field">
            <span className="doc-details-label">File Type & Format</span>
            <span className="doc-details-val">{type} Document</span>
          </div>

          <div className="doc-details-field">
            <span className="doc-details-label">File Size & Length</span>
            <span className="doc-details-val">{size} {pages ? `• ${pages} pages` : ''}</span>
          </div>

          <div className="doc-details-field">
            <span className="doc-details-label">Uploaded By</span>
            <span className="doc-details-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={13} style={{ color: '#818cf8' }} /> {author}
            </span>
          </div>

          <div className="doc-details-field">
            <span className="doc-details-label">Upload Timestamp</span>
            <span className="doc-details-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} style={{ color: '#818cf8' }} /> {uploadedAt}
            </span>
          </div>

          <div className="doc-details-field">
            <span className="doc-details-label">Vector Embedding Model</span>
            <span className="doc-details-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={13} style={{ color: '#06b6d4' }} /> {embeddingModel}
            </span>
          </div>

          <div className="doc-details-field">
            <span className="doc-details-label">Vector Dimensions</span>
            <span className="doc-details-val">{dimensions} dims (Cosine Metric)</span>
          </div>

          <div className="doc-details-field">
            <span className="doc-details-label">Semantic Chunks</span>
            <span className="doc-details-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} style={{ color: '#10b981' }} /> {chunks} indexed chunks
            </span>
          </div>

          <div className="doc-details-field">
            <span className="doc-details-label">Chunking Strategy</span>
            <span className="doc-details-val">{chunkSize}</span>
          </div>
        </div>

        {/* Sample Vector Chunk Preview */}
        <div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'block', marginBottom: '8px' }}>
            Semantic Vector Chunks Preview
          </span>
          <div className="doc-chunks-preview-box">
            <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
              // Sample extracted chunk #1 (Cosine Sim: 0.9412)
            </div>
            "{name.replace(/\.[^/.]+$/, '')} content extraction completed. All semantic entities and paragraphs normalized for retrieval augmented generation (RAG)."
            <br /><br />
            <span style={{ color: '#818cf8' }}>
              Vector Embedding: [-0.0214, 0.0891, 0.0034, -0.0412, 0.0712, 0.0129, ...]
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default DocumentDetails;
