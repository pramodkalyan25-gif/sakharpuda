/**
 * Badge — Small status/label indicator pill.
 */
export default function Badge({
  children,
  variant = 'default',  // default | success | warning | danger | info | gold
  size = 'sm',
  className = '',
}) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {children}
    </span>
  );
}
