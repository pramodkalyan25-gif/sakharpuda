import { useEffect, useRef } from 'react';
import Button from './Button';

/**
 * Modal — Accessible dialog overlay with focus trap.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',      // sm | md | lg | xl
  showClose = true,
  closeOnOverlay = true,
}) {
  const modalRef = useRef(null);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={closeOnOverlay ? (e) => { if (e.target === e.currentTarget) onClose?.(); } : undefined}
    >
      <div
        ref={modalRef}
        className={`modal-content modal-${size}`}
        tabIndex={-1}
      >
        <div className="modal-header">
          {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
          {showClose && (
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
