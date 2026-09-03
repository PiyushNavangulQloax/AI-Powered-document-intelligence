import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Eye,
  Trash2,
  Cpu,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import './DocumentComponents.css';

/**
 * Helper to pick icon & color class based on document file extension
 */
function getDocumentIconMeta(type = '') {
  const t = type.toUpperCase();
  if (t === 'PDF') {
    return {
      icon: FileText,
      className: 'doc-icon-pdf',
      label: 'PDF'
    };
  }
  if (t === 'DOCX' || t === 'DOC') {
    return {
      icon: FileText,
      className: 'doc-icon-docx',
      label: 'DOCX'
    };
  }
  if (t === 'XLSX' || t === 'XLS' || t === 'CSV') {
    return {
      icon: FileSpreadsheet,
      className: 'doc-icon-xlsx',
      label: 'EXCEL'
    };
  }
  if (t === 'TXT' || t === 'MD') {
    return {
      icon: FileCode,
      className: 'doc-icon-txt',
      label: 'TEXT'
    };
  }
  return {
    icon: File,
    className: 'doc-icon-docx',
    label: t || 'FILE'
  };
}

/**
 * DocumentCard - Renders a single document card with metadata, status, and action buttons.
 */
function DocumentCard({
  document,
  onView,
  onInspect,
  onDelete
}) {
  if (!document) return null;

  const {
    id,
    name = 'Untitled Document',
    type = 'PDF',
    size = '0 KB',
    pages = 0,
    chunks = 0,
    status = 'Processed',
    uploadedAt = 'Recently',
    author = 'System'
  } = document;

  const iconMeta = getDocumentIconMeta(type);
  const IconComponent = iconMeta.icon;
  const statusLower = (status || '').toLowerCase();

  return (
    <div className="doc-card-root" data-testid={`doc-card-${id}`}>
      {/* Top Section: Icon, Title & Author */}
      <div className="doc-card-top">
        <div className={`doc-icon-container ${iconMeta.className}`}>
          <IconComponent size={22} />
        </div>

        <div className="doc-card-headings">
          <span
            className="doc-card-title-text"
            title={name}
            onClick={() => onView?.(document)}
          >
            {name}
          </span>
          <div className="doc-card-meta-line">
            <span>{author}</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={11} /> {uploadedAt}
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Metrics row */}
      <div className="doc-card-metrics-row">
        {pages > 0 && (
          <>
            <div className="doc-metric-item" title="Page count">
              <span>{pages} pages</span>
            </div>
            <span className="doc-metric-divider">•</span>
          </>
        )}
        <div className="doc-metric-item" title="Indexed vector chunks">
          <Layers size={12} style={{ color: '#818cf8' }} />
          <span>{chunks} chunks</span>
        </div>
        <span className="doc-metric-divider">•</span>
        <div className="doc-metric-item" title="File size">
          <span>{size}</span>
        </div>
      </div>

      {/* Bottom Section: Status & Action Icons */}
      <div className="doc-card-bottom-actions">
        <span className={`doc-status-badge ${statusLower}`}>
          {statusLower === 'processed' && <CheckCircle2 size={12} />}
          {statusLower === 'processing' && <Loader2 size={12} className="btn-spinner" />}
          {statusLower === 'failed' && <AlertTriangle size={12} />}
          <span>{status}</span>
        </span>

        <div className="doc-action-btn-group">
          {onInspect && (
            <button
              type="button"
              className="doc-action-icon-btn"
              onClick={() => onInspect(document)}
              title="Inspect Semantic Vector Chunks"
            >
              <Cpu size={14} />
            </button>
          )}

          {onView && (
            <button
              type="button"
              className="doc-action-icon-btn"
              onClick={() => onView(document)}
              title="View Document Details"
            >
              <Eye size={14} />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className="doc-action-icon-btn delete"
              onClick={() => onDelete(document)}
              title="Delete Document & Vectors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
