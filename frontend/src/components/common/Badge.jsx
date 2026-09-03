import React from 'react';
import './Badge.css';

function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  // Auto-map status text to variants if convenient
  let resolvedVariant = variant;
  if (typeof children === 'string') {
    const lower = children.toLowerCase();
    if (lower === 'processed' || lower === 'completed' || lower === 'healthy' || lower === 'active') {
      resolvedVariant = 'success';
    } else if (lower === 'processing' || lower === 'indexing' || lower === 'in-progress' || lower === 'pending') {
      resolvedVariant = 'warning';
    } else if (lower === 'failed' || lower === 'error') {
      resolvedVariant = 'danger';
    } else if (lower === 'pdf' || lower === 'docx' || lower === 'txt') {
      resolvedVariant = 'primary';
    }
  }

  return (
    <span className={`badge badge-${resolvedVariant} badge-${size} ${className}`} {...props}>
      {dot && <span className="badge-dot" />}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
