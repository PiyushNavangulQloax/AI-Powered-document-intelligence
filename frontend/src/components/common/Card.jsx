import React from 'react';
import './Card.css';

function Card({
  children,
  title,
  subtitle,
  icon: Icon = null,
  action = null,
  footer = null,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  ...props
}) {
  const hasHeader = title || subtitle || action || Icon;

  return (
    <div
      className={`card card-variant-${variant} card-pad-${padding} ${hoverable ? 'card-hoverable' : ''} ${className}`}
      {...props}
    >
      {hasHeader && (
        <div className="card-header">
          <div className="card-title-group">
            {Icon && (
              <div className="card-header-icon">
                <Icon size={20} />
              </div>
            )}
            <div>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="card-header-action">{action}</div>}
        </div>
      )}

      <div className="card-content">{children}</div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

export default Card;