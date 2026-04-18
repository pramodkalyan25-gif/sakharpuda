/**
 * Spinner — Animated loading indicator.
 */
export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      className={`spinner spinner-${size} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
