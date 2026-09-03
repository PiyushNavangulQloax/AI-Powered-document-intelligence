import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    error = '',
    helperText = '',
    disabled = false,
    required = false,
    icon: Icon = null,
    suffixIcon: SuffixIcon = null,
    onSuffixClick = null,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`input-group ${disabled ? 'input-group-disabled' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}

      <div className={`input-wrapper ${Icon ? 'has-prefix-icon' : ''} ${SuffixIcon ? 'has-suffix-icon' : ''} ${error ? 'is-invalid' : ''}`}>
        {Icon && (
          <span className="input-prefix-icon">
            <Icon size={18} />
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="input-field"
          {...props}
        />

        {SuffixIcon && (
          <button
            type="button"
            className="input-suffix-btn"
            onClick={onSuffixClick}
            tabIndex={onSuffixClick ? 0 : -1}
          >
            <SuffixIcon size={18} />
          </button>
        )}
      </div>

      {error ? (
        <p className="input-feedback-message input-error-message">{error}</p>
      ) : helperText ? (
        <p className="input-feedback-message input-helper-text">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;