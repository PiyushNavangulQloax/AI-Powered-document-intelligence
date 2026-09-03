import React from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCw,
  Loader2,
  UploadCloud
} from 'lucide-react';
import './DocumentComponents.css';

/**
 * UploadProgress - Displays individual or multiple active upload tasks with animated progress bars,
 * stage status indicators, and cancel/retry actions.
 */
function UploadProgress({
  uploads = [],
  onCancel,
  onRetry,
  onDismiss,
  onClearCompleted
}) {
  if (!uploads || uploads.length === 0) return null;

  const hasCompleted = uploads.some((u) => u.status === 'completed');

  return (
    <div className="upload-progress-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UploadCloud size={15} style={{ color: '#818cf8' }} />
          Active Uploads ({uploads.length})
        </span>

        {hasCompleted && onClearCompleted && (
          <button
            type="button"
            onClick={onClearCompleted}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Clear Completed
          </button>
        )}
      </div>

      {uploads.map((task) => {
        const {
          id,
          name = 'Document',
          size = '',
          progress = 0,
          status = 'uploading', // 'uploading' | 'processing' | 'completed' | 'error'
          errorMsg = ''
        } = task;

        const isCompleted = status === 'completed';
        const isError = status === 'error';
        const isProcessing = status === 'processing';

        return (
          <div key={id} className="upload-progress-card">
            {/* Header info */}
            <div className="upload-progress-header">
              <div className="upload-progress-info">
                <FileText size={18} style={{ color: isCompleted ? '#10b981' : isError ? '#ef4444' : '#818cf8', flexShrink: 0 }} />
                <div>
                  <span className="upload-progress-name">{name}</span>
                  {size && <span className="upload-progress-size"> • {size}</span>}
                </div>
              </div>

              {/* Status icon or action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isCompleted && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> Ready
                  </span>
                )}

                {isProcessing && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>
                    <Loader2 size={14} className="btn-spinner" /> Indexing
                  </span>
                )}

                {isError && onRetry && (
                  <button
                    type="button"
                    onClick={() => onRetry(id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      color: '#f87171',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RotateCw size={11} /> Retry
                  </button>
                )}

                {(onCancel || onDismiss) && (
                  <button
                    type="button"
                    onClick={() => (isCompleted || isError ? onDismiss?.(id) : onCancel?.(id))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={isCompleted || isError ? 'Dismiss' : 'Cancel upload'}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar track */}
            <div className="upload-progress-bar-track">
              <div
                className={`upload-progress-bar-fill ${isCompleted ? 'completed' : ''} ${isError ? 'error' : ''}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>

            {/* Meta text row */}
            <div className="upload-progress-meta">
              <span>
                {isError
                  ? errorMsg || 'Upload failed. Check file integrity or network.'
                  : isCompleted
                  ? 'Processed & Vector Indexed'
                  : isProcessing
                  ? 'Extracting text and computing vectors...'
                  : `Uploading... ${Math.round(progress)}%`}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default UploadProgress;
