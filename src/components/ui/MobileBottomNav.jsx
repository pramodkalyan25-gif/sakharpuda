import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Search, Star, MessageCircle, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { interestService } from '../../services/interestService';
import { chatService } from '../../services/chatService';

const navItems = [
  { to: '/search',     icon: <Search size={22} />,         label: 'Search' },
  { to: '/shortlisted', icon: <Star size={22} fill="#D63447" />, label: 'Shortlisted' },
  { to: '/interests',  icon: <Heart size={22} />,           label: 'Interests', key: 'pending' },
  { to: '/inbox',      icon: <MessageCircle size={22} />,  label: 'Inbox', key: 'unread' },
  { to: '/my-matches', icon: <Users size={22} />,          label: 'Matches' },
];

// Pages where the bottom nav should be visible
const AUTHENTICATED_ROUTES = ['/dashboard', '/search', '/interests', '/inbox', '/my-matches', '/shortlisted', '/settings', '/profile'];

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated, profile } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profile?.user_id) {
      Promise.all([
        interestService.getPendingCount(profile.user_id),
        chatService.getUnreadCount(profile.user_id)
      ]).then(([pc, uc]) => {
        setPendingCount(pc);
        setUnreadCount(uc);
      });
    }
  }, [profile?.user_id, location.pathname]);

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
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {item.icon}
              {item.key === 'pending' && pendingCount > 0 && <span className="mobile-nav-badge">{pendingCount}</span>}
              {item.key === 'unread' && unreadCount > 0 && <span className="mobile-nav-badge">{unreadCount}</span>}
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
