import React from 'react';
import './Loading.css';

function Loading({
  text = 'Loading...',
  type = 'spinner', // 'spinner' | 'dots' | 'skeleton' | 'full-page'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) {
  if (type === 'full-page') {
    return (
      <div className={`loading-full-page ${className}`}>
        <div className="loading-card">
          <div className="loading-ring-spinner loading-ring-lg" />
          <h4 className="loading-title">{text}</h4>
          <p className="loading-subtitle">DocMind AI Engine processing</p>
        </div>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={`skeleton-container ${className}`}>
        <div className="skeleton-bar skeleton-title" />
        <div className="skeleton-bar skeleton-line" />
        <div className="skeleton-bar skeleton-line skeleton-short" />
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`loading-dots-container ${className}`}>
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
        {text && <span className="loading-text">{text}</span>}
      </div>
    );
  }

  return (
    <div className={`loading-container ${className}`}>
      <div className={`loading-ring-spinner loading-ring-${size}`} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default Loading;