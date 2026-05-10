import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Star, MessageCircle, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard',  icon: <Home size={22} />,          label: 'Home' },
  { to: '/search',     icon: <Search size={22} />,         label: 'Search' },
  { to: '/interests',  icon: <Star size={22} />,           label: 'Interests' },
  { to: '/inbox',      icon: <MessageCircle size={22} />,  label: 'Inbox' },
  { to: '/my-matches', icon: <Users size={22} />,          label: 'Matches' },
];

// Pages where the bottom nav should be visible
const AUTHENTICATED_ROUTES = ['/dashboard', '/search', '/interests', '/inbox', '/my-matches', '/settings', '/profile'];

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Only show on authenticated dashboard pages
  const isVisible = isAuthenticated && AUTHENTICATED_ROUTES.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  if (!isVisible) return null;

  return (
    <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
      {navItems.map(item => {
        const isActive = location.pathname === item.to ||
          (item.to !== '/dashboard' && location.pathname.startsWith(item.to + '/'));
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`mobile-bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
