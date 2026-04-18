import { forwardRef } from 'react';

/**
 * Input — Styled form input with label, helper text and error state.
 */
const Input = forwardRef(function Input(
  {
    label,
    id,
    error,
    helperText,
    prefix,
    suffix,
    className = '',
    containerClass = '',
    ...props
  },
  ref
) {
  return (
    <div className={`input-group ${containerClass}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          ref={ref}
          id={id}
          className={`input-field ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error && (
        <span id={`${id}-error`} className="input-error-msg" role="alert">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${id}-helper`} className="input-helper">
          {helperText}
        </span>
      )}
    </div>
  );
});

export default Input;
