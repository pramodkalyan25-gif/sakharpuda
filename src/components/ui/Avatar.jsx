/**
 * Avatar — Profile picture display with fallback initials.
 */
export default function Avatar({
  src,
  name,
  size = 'md',   // xs | sm | md | lg | xl
  verified = false,
  className = '',
}) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className={`avatar avatar-${size} ${className}`} title={name}>
      {src ? (
        <img src={src} alt={name || 'Profile'} className="avatar-img" />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
      {verified && <span className="avatar-verified-badge" title="Verified" aria-label="Verified">✓</span>}
    </div>
  );
}
