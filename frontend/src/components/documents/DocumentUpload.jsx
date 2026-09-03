import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, X, Check, FileUp } from 'lucide-react';
import './DocumentComponents.css';

/**
 * DocumentUpload - Full Drag-and-Drop and File Picker UI for uploading documents
 * with format and size validation.
 */
function DocumentUpload({
  onUpload,
  isUploading = false,
  maxSizeMB = 50,
  allowedExtensions = ['pdf', 'docx', 'xlsx', 'txt'],
  multiple = true
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const validateAndProcessFiles = (fileList) => {
    setErrorMessage('');
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);
    const validFiles = [];

    for (const file of filesArray) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const fileSizeMB = file.size / (1024 * 1024);

      if (!allowedExtensions.includes(extension)) {
        setErrorMessage(
          `"${file.name}" has an unsupported format. Please upload ${allowedExtensions.map((e) => e.toUpperCase()).join(', ')} files.`
        );
        return;
      }

      if (fileSizeMB > maxSizeMB) {
        setErrorMessage(
          `"${file.name}" exceeds the ${maxSizeMB}MB file size limit (${fileSizeMB.toFixed(1)}MB).`
        );
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0 && onUpload) {
      onUpload(multiple ? validFiles : [validFiles[0]]);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
      // Reset input value so the same file can be re-uploaded if needed
      e.target.value = '';
    }
  };

  const handleZoneClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const acceptString = allowedExtensions.map((ext) => `.${ext}`).join(',');

  return (
    <div className="doc-upload-container">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptString}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        data-testid="doc-file-input"
      />

      {/* Drag & Drop Area */}
      <div
        className={`doc-upload-dropzone ${isDragActive ? 'drag-active' : ''}`}
        onClick={handleZoneClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload document dropzone"
      >
        <div className="doc-upload-icon-ring">
          {isUploading ? (
            <FileUp size={26} className="btn-spinner" />
          ) : (
            <UploadCloud size={26} />
          )}
        </div>

        <div className="doc-upload-text-group">
          <span className="doc-upload-title">
            {isDragActive
              ? 'Drop your files here to start indexing'
              : 'Click or drag documents to index into Vector RAG'}
          </span>
          <span className="doc-upload-subtext">
            Automatic text extraction, semantic chunking, and 1536-dim vector embeddings
          </span>
        </div>

        <div className="doc-upload-badges">
          {allowedExtensions.map((ext) => (
            <span key={ext} className="doc-upload-format-badge">
              .{ext.toUpperCase()}
            </span>
          ))}
          <span className="doc-upload-format-badge" style={{ color: '#818cf8' }}>
            Max {maxSizeMB}MB
          </span>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="doc-upload-error-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
