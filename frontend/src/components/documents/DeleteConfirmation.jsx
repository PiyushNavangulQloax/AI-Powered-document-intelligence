import React from 'react';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import './DocumentComponents.css';

/**
 * DeleteConfirmation - Confirmation dialog before permanently deleting a document and its vector embeddings.
 */
function DeleteConfirmation({
  isOpen,
  document,
  onClose,
  onConfirm,
  loading = false
}) {
  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Document"
      size="sm"
      closeOnBackdrop={!loading}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            loading={loading}
            onClick={() => onConfirm?.(document)}
          >
            Delete Permanently
          </Button>
        </div>
      }
    >
      <div className="delete-confirm-box">
        <div className="delete-warning-icon">
          <ShieldAlert size={28} />
        </div>

        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
            Remove "{document.name}"?
          </h4>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
            This action is irreversible. All associated data will be deleted immediately:
          </p>
        </div>

        <div className="delete-impact-list">
          <div>• Original binary file from secure document storage</div>
          <div>• <strong>{document.chunks || 0}</strong> vector embeddings from RAG index</div>
          <div>• Citation reference cache and metadata</div>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirmation;
