import React, { useState } from 'react';
import {
  LayoutGrid,
  List,
  FileText,
  Search,
  Eye,
  Trash2,
  Cpu,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import DocumentCard from './DocumentCard';
import './DocumentComponents.css';

/**
 * DocumentList - Renders a collection of documents with interactive view switching (Grid / Table),
 * empty state handling, and action delegates.
 */
function DocumentList({
  documents = [],
  onView,
  onInspect,
  onDelete,
  loading = false,
  emptyMessage = 'No documents found matching your criteria.',
  onClearFilters
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  if (loading) {
    return (
      <div className="doc-empty-state">
        <div className="doc-empty-icon">
          <Loader2 size={24} className="btn-spinner" />
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
          Loading documents...
        </span>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="doc-empty-state">
        <div className="doc-empty-icon">
          <FileText size={24} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
            No Documents Found
          </h4>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            {emptyMessage}
          </p>
        </div>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#818cf8',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="doc-list-wrapper">
      {/* List Toolbar / View Switcher */}
      <div className="doc-list-controls">
        <span className="doc-list-count">
          Showing <strong>{documents.length}</strong> {documents.length === 1 ? 'document' : 'documents'}
        </span>

        <div className="doc-view-switch">
          <button
            type="button"
            className={`doc-view-switch-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            className={`doc-view-switch-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Grid View Mode */}
      {viewMode === 'grid' ? (
        <div className="docs-grid-catalog">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={onView}
              onInspect={onInspect}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        /* Table View Mode */
        <div className="doc-table-wrapper">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Author</th>
                <th>Size</th>
                <th>Chunks</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const statusLower = (doc.status || '').toLowerCase();
                return (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
                        <span
                          style={{ fontWeight: 600, color: '#f8fafc', cursor: 'pointer' }}
                          onClick={() => onView?.(doc)}
                        >
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1' }}>
                        {doc.type}
                      </span>
                    </td>
                    <td>{doc.author}</td>
                    <td>{doc.size}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Layers size={12} style={{ color: '#818cf8' }} /> {doc.chunks}
                      </span>
                    </td>
                    <td>
                      <span className={`doc-status-badge ${statusLower}`}>
                        {statusLower === 'processed' && <CheckCircle2 size={11} />}
                        {statusLower === 'processing' && <Loader2 size={11} className="btn-spinner" />}
                        {statusLower === 'failed' && <AlertTriangle size={11} />}
                        <span>{doc.status}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="doc-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        {onInspect && (
                          <button
                            type="button"
                            className="doc-action-icon-btn"
                            onClick={() => onInspect(doc)}
                            title="Inspect Chunks"
                          >
                            <Cpu size={14} />
                          </button>
                        )}
                        {onView && (
                          <button
                            type="button"
                            className="doc-action-icon-btn"
                            onClick={() => onView(doc)}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="doc-action-icon-btn delete"
                            onClick={() => onDelete(doc)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DocumentList;
