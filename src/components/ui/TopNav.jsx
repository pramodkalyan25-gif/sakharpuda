import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { interestService } from '../../services/interestService';
import { chatService } from '../../services/chatService';
import {
  Search as SearchIcon,
  Home,
  User,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  Menu,
  X,
  Users,
  Star,
  MessageCircle,
  HelpCircle,
  PlusCircle
} from 'lucide-react';
import Avatar from './Avatar';

export default function TopNav() {
  const navigate = useNavigate();
  const { profile, logout, isAdmin, avatarUrl } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const finalAvatarUrl = avatarUrl || '/images/default-avatar.png';

  const navLinks = [
    { to: '/dashboard', icon: <Users size={18} />, label: 'Matches' },
    { to: '/shortlisted', icon: <Star size={18} fill="#D63447" />, label: 'Shortlisted' },
    { to: '/interests', icon: <Star size={18} />, label: 'Interests', badge: pendingCount },
    { to: '/inbox', icon: <MessageCircle size={18} />, label: 'Messages', badge: unreadCount },
    { to: '/search', icon: <SearchIcon size={18} />, label: 'Search' },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', icon: <Settings size={18} />, label: 'Admin' });
  }

  return (
    <>
      <nav className="js-header-wrapper">
        <div className="js-header-container">
          {/* LEFT: LOGO */}
          <Link to="/dashboard" className="js-header-logo">
            <img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="js-header-logo-img" />
          </Link>

          {/* MIDDLE: MAIN NAV — desktop only */}
          <div className="js-header-main-nav desktop-only">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`js-nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {link.icon} 
                  <span>{link.label}</span>
                  {link.badge > 0 && <span className="js-nav-badge">{link.badge}</span>}
                </div>
              </Link>
            ))}
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="js-header-actions">
            {/* Notification Icon */}
            <button className="js-header-icon-btn" aria-label="Notifications">
              <Bell size={20} color="#64748b" />
              <span className="js-header-dot"></span>
            </button>

            {/* Help Dropdown — desktop only */}
            <div className="js-help-dropdown-wrap desktop-only">
              <button className="js-help-trigger">
                Help <ChevronDown size={14} />
              </button>
              <div className="js-help-menu">
                <div className="js-help-header">Customer Support</div>
                <a href="mailto:sakharpuda@zohomail.in" className="js-help-item">sakharpuda@zohomail.in</a>
                <Link to="/about" className="js-help-item">About Us</Link>
                <Link to="/contact" className="js-help-item">Contact Us</Link>
                <Link to="/safety-center" className="js-help-item">Safety Center</Link>
                <Link to="/help" className="js-help-item">Help Center / FAQ</Link>
                <Link to="/grievances" className="js-help-item">Grievances</Link>
              </div>
            </div>

            {/* Avatar Dropdown */}
            <div className="js-header-menu-wrap" ref={dropdownRef}>
              <button
                className="js-header-avatar-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
              >
                <Avatar src={finalAvatarUrl} name={profile?.name} size="sm" />
                <ChevronDown size={14} color="#64748b" className="js-chevron-hide-mobile" />
              </button>

              {dropdownOpen && (
                <div className="js-header-dropdown">
                  {/* Identity Header */}
                  <div className="js-dropdown-profile-header">
                    <h3 className="js-dropdown-name">{profile?.name}</h3>
                    <div className="js-dropdown-brand">
                      <img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="js-dropdown-logo-img" />
                    </div>
                    <div className="js-dropdown-id-row">
                      <span className="js-dropdown-id-val">{profile?.profile_id || 'ID Pending'}</span>
                      <span className="js-dropdown-membership">{profile?.admin_verified ? 'Premium member' : 'Free member'}</span>
                    </div>

                    {!profile?.admin_verified && (
                      <div className="js-dropdown-upgrade-box">
                        <div className="js-dropdown-upgrade-text">
                          <p>Upgrade membership to call or message with matches</p>
                          <Link to="/settings" className="js-dropdown-upgrade-btn" onClick={() => setDropdownOpen(false)}>Upgrade now</Link>
                        </div>
                        <div className="js-dropdown-crown">
                          <svg viewBox="0 0 100 100" className="js-dropdown-crown-svg">
                            <path d="M20 80 L80 80 L90 40 L70 55 L50 20 L30 55 L10 40 Z" fill="none" stroke="#fbd38d" strokeWidth="2" opacity="0.3" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="js-dropdown-divider"></div>

                  <Link to="/dashboard?edit=true" className="js-dropdown-item with-icon" onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> <span>Edit profile</span>
                  </Link>
                  <Link to="/settings" className="js-dropdown-item with-icon" onClick={() => setDropdownOpen(false)}>
                    <Settings size={16} /> <span>Account settings</span>
                  </Link>

                  <div className="js-dropdown-more-wrap">
                    <button className="js-dropdown-item with-icon" onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }}>
                      <PlusCircle size={16} /> <span>More</span>
                    </button>
                    {moreOpen && (
                      <div className="js-dropdown-sub-menu">
                        <Link to="/privacy" target="_blank" className="js-dropdown-sub-item">Privacy policy</Link>
                        <Link to="/safety-center" target="_blank" className="js-dropdown-sub-item">Safety Center</Link>
                      </div>
                    )}
                  </div>

                  <div className="js-dropdown-divider"></div>
                  <button onClick={handleLogout} className="js-dropdown-item logout">Logout</button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="js-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} color="#334155" />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="js-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="js-mobile-drawer" onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="js-drawer-header">
              <div className="js-drawer-user">
                <Avatar src={finalAvatarUrl} name={profile?.name} size="md" />
                <div className="js-drawer-user-info">
                  <span className="js-drawer-name">{profile?.name}</span>
                  <span className="js-drawer-id">{profile?.profile_id || 'ID Pending'}</span>
                </div>
              </div>
              <button className="js-drawer-close" onClick={() => setMobileMenuOpen(false)}>
                <X size={22} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="js-drawer-nav">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`js-drawer-nav-item ${location.pathname === link.to ? 'active' : ''}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="js-drawer-divider"></div>

            {/* Account Links */}
            <div className="js-drawer-section">
              <span className="js-drawer-section-label">Account</span>
              <Link to="/dashboard?edit=true" className="js-drawer-nav-item">
                <User size={18} /> <span>Edit Profile</span>
              </Link>
              <Link to="/settings" className="js-drawer-nav-item">
                <Settings size={18} /> <span>Settings</span>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="js-drawer-nav-item admin">
                  <Shield size={18} /> <span>Admin Panel</span>
                </Link>
              )}
            </div>

            <div className="js-drawer-divider"></div>

            {/* Support Links */}
            <div className="js-drawer-section">
              <span className="js-drawer-section-label">Support</span>
              <Link to="/help" className="js-drawer-nav-item">
                <HelpCircle size={18} /> <span>Help Center</span>
              </Link>
              <a href="mailto:sakharpuda@zohomail.in" className="js-drawer-nav-item">
                <MessageCircle size={18} /> <span>Contact Support</span>
              </a>
            </div>

            <div className="js-drawer-divider"></div>

            {/* Logout */}
            <button onClick={handleLogout} className="js-drawer-logout">
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        /* ===== HEADER ===== */
        .js-header-wrapper {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          height: 60px;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        @media (min-width: 768px) {
          .js-header-wrapper { height: 70px; }
        }

        .js-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 100%;
          padding: 0 16px;
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .js-header-container { padding: 0 24px; }
        }

        @media (min-width: 1200px) {
          .js-header-container { padding: 0 40px; }
        }

        /* Logo */
        .js-header-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .js-header-logo-img {
          height: 24px;
          width: auto;
          display: block;
        }

        @media (min-width: 768px) {
          .js-header-logo-img { height: 28px; }
        }

        /* Desktop Nav */
        .js-header-main-nav {
          display: none;
          gap: 8px;
          flex: 0 0 auto;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .js-header-main-nav {
            display: flex;
            gap: 20px;
          }
        }

        @media (min-width: 1100px) {
          .js-header-main-nav { gap: 40px; }
        }

        .js-nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 0;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
        }

        @media (min-width: 1100px) {
          .js-nav-link { font-size: 14px; gap: 8px; }
        }

        .js-nav-link:hover { color: #D63447; }
        .js-nav-link.active { color: #D63447; border-bottom-color: #D63447; }
        .js-nav-link svg { color: #64748b; transition: color 0.2s; }
        .js-nav-link:hover svg, .js-nav-link.active svg { color: #D63447; }

        .js-nav-badge {
          position: absolute;
          top: -4px;
          right: -12px;
          background: #ef4444;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 8px;
          min-width: 14px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }

        /* Header Actions */
        .js-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .js-header-actions { gap: 12px; }
        }

        @media (min-width: 1100px) {
          .js-header-actions { gap: 20px; }
        }

        /* Help Dropdown */
        .js-help-dropdown-wrap { position: relative; }
        .js-help-trigger {
          background: none; border: none; color: #64748b;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          padding: 8px 0; font-family: inherit;
        }
        .js-help-trigger:hover { color: #D63447; }
        
        .js-help-menu {
          display: none; position: absolute; top: 100%; right: 0;
          background: #fff; border-radius: 12px; min-width: 220px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #f1f5f9;
          padding: 8px 0; z-index: 1001; margin-top: 5px;
        }
        .js-help-menu::before { content: ''; position: absolute; top: -15px; left: 0; width: 100%; height: 15px; }
        .js-help-dropdown-wrap:hover .js-help-menu { display: block; }
        
        .js-help-item {
          display: block; padding: 10px 20px; color: #475569;
          text-decoration: none; font-size: 13px; font-weight: 500;
        }
        .js-help-item:hover { background: #f8fafc; color: #D63447; }
        .js-help-header { padding: 10px 20px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #f1f5f9; margin-bottom: 5px; }

        /* Notification Bell */
        .js-header-icon-btn {
          background: #f8fafc;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .js-header-icon-btn:hover { background: #f1f5f9; }

        @media (min-width: 768px) {
          .js-header-icon-btn { width: 40px; height: 40px; }
        }
        
        .js-header-dot {
          position: absolute;
          top: 8px; right: 8px;
          width: 7px; height: 7px;
          background: #ef4444;
          border: 2px solid #fff;
          border-radius: 50%;
        }

        /* Avatar Trigger */
        .js-header-menu-wrap { position: relative; }
        
        .js-header-avatar-trigger {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 3px 6px;
          border-radius: 20px;
          transition: background 0.2s;
        }
        .js-header-avatar-trigger:hover { background: #f8fafc; }

        .js-chevron-hide-mobile { display: none; }
        @media (min-width: 768px) {
          .js-chevron-hide-mobile { display: block; }
        }

        /* Hamburger — only on mobile */
        .js-hamburger-btn {
          background: #f8fafc;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .js-hamburger-btn:hover { background: #f1f5f9; }

        @media (min-width: 768px) {
          .js-hamburger-btn { display: none; }
        }

        /* ===== AVATAR DROPDOWN ===== */
        .js-header-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: min(320px, calc(100vw - 32px));
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          z-index: 1100;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          padding: 10px 0;
        }

        .js-dropdown-profile-header {
          padding: 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #fff;
        }
        .js-dropdown-name { font-size: 17px; font-weight: 800; color: #1e293b; margin-bottom: 10px; text-transform: capitalize; }
        .js-dropdown-brand { margin-bottom: 12px; display: flex; justify-content: center; width: 100%; }
        .js-dropdown-logo-img { height: 12px; width: auto; max-width: 180px; object-fit: contain; }
        .js-dropdown-id-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
        .js-dropdown-id-val { font-size: 15px; font-weight: 800; color: #1e293b; }
        .js-dropdown-membership { font-size: 13px; color: #D63447; font-weight: 700; }

        .js-dropdown-upgrade-box {
          background: #fff8f1; border-radius: 12px; padding: 14px;
          position: relative; overflow: hidden;
          border: 1px solid #ffedd5; text-align: left; width: 100%;
        }
        .js-dropdown-upgrade-text { position: relative; z-index: 2; }
        .js-dropdown-upgrade-text p { font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 10px; line-height: 1.4; max-width: 150px; }
        .js-dropdown-upgrade-btn {
          display: inline-block; background: #ea580c; color: #fff;
          padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; text-decoration: none;
        }
        .js-dropdown-crown { position: absolute; bottom: -5px; right: -5px; width: 55px; height: 55px; }

        .js-dropdown-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 20px; color: #475569;
          text-decoration: none; font-size: 14px; font-weight: 500;
          transition: background 0.2s; border: none; background: none;
          width: 100%; text-align: left; cursor: pointer; font-family: inherit;
        }
        .js-dropdown-item:hover { background: #f8fafc; color: #D63447; }
        .js-dropdown-item.with-icon svg { color: #64748b; }
        .js-dropdown-item:hover svg { color: #D63447; }

        .js-dropdown-more-wrap { position: relative; }
        .js-dropdown-sub-menu { background: #f8fafc; padding: 5px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
        .js-dropdown-sub-item { display: block; padding: 8px 52px; color: #64748b; text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.2s; }
        .js-dropdown-sub-item:hover { color: #D63447; }

        .js-dropdown-divider { height: 1px; background: #f1f5f9; margin: 5px 0; }
        .js-dropdown-item.logout { color: #ef4444; }
        .js-dropdown-item.logout:hover { background: #fef2f2; }

        /* ===== MOBILE DRAWER ===== */
        .js-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2000;
          backdrop-filter: blur(2px);
          animation: fadeInOverlay 0.2s ease;
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .js-mobile-drawer {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(320px, 85vw);
          background: #fff;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          animation: slideInDrawer 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideInDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .js-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 16px;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
          flex-shrink: 0;
        }

        .js-drawer-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .js-drawer-user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .js-drawer-name {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
          text-transform: capitalize;
        }

        .js-drawer-id {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .js-drawer-close {
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #475569;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .js-drawer-close:hover { background: #e2e8f0; }

        .js-drawer-nav {
          display: flex;
          flex-direction: column;
          padding: 12px 8px;
        }

        .js-drawer-nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 16px;
          border-radius: 10px;
          color: #475569;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
          font-family: inherit;
        }
        .js-drawer-nav-item:hover { background: #f8fafc; color: #D63447; }
        .js-drawer-nav-item svg { color: #94a3b8; flex-shrink: 0; }
        .js-drawer-nav-item:hover svg { color: #D63447; }
        .js-drawer-nav-item.active { background: #fff1f2; color: #D63447; font-weight: 700; }
        .js-drawer-nav-item.active svg { color: #D63447; }
        .js-drawer-nav-item.admin { color: #6366f1; }
        .js-drawer-nav-item.admin svg { color: #6366f1; }

        .js-drawer-section {
          display: flex;
          flex-direction: column;
          padding: 8px 8px;
        }

        .js-drawer-section-label {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 8px 16px 4px;
        }

        .js-drawer-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 4px 16px;
        }

        .js-drawer-logout {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 24px;
          margin: 8px;
          border-radius: 10px;
          color: #ef4444;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          transition: all 0.2s;
          border: none;
          background: none;
          cursor: pointer;
          font-family: inherit;
          width: calc(100% - 16px);
        }
        .js-drawer-logout:hover { background: #fef2f2; }
        .js-drawer-logout svg { color: #ef4444; }

        /* desktop-only class */
        .desktop-only { display: none !important; }
        @media (min-width: 768px) {
          .desktop-only { display: flex !important; }
        }
      `}} />
    </>
  );
}
