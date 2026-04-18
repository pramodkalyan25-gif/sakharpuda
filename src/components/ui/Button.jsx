/**
 * Button — Primary UI component with variants and loading state.
 */
export default function Button({
  children,
  variant = 'primary',  // primary | secondary | ghost | danger | outline
  size = 'md',          // sm | md | lg
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    loading ? 'btn-loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      <span className={loading ? 'btn-text-hidden' : ''}>{children}</span>
    </button>
  );
}
