import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Search as SearchIcon, Home, User, Bell, ChevronDown, LogOut, Settings, Shield, Menu, Users, Star, MessageCircle, HelpCircle, PlusCircle } from 'lucide-react';
import Avatar from './Avatar';

export default function TopNav() {
  const navigate = useNavigate();
  const { profile, logout, isAdmin, avatarUrl } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const finalAvatarUrl = avatarUrl || '/images/default-avatar.png';

  return (
    <nav className="js-header-wrapper">
      <div className="js-header-container js-layout-container">
        {/* LEFT: LOGO */}
        <div className="js-header-left">
          <Link to="/dashboard" className="js-header-logo">
            <img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="logo-img" />
          </Link>
        </div>

        {/* MIDDLE: MAIN NAV */}
        <div className="js-header-main-nav desktop-only">
          <Link to="/dashboard" className={`js-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <Home size={18} /> <span>Home</span>
          </Link>
          <Link to="/interests" className={`js-nav-link ${location.pathname === '/interests' ? 'active' : ''}`}>
            <Star size={18} /> <span>Interests</span>
          </Link>
          <Link to="/inbox" className={`js-nav-link ${location.pathname === '/inbox' ? 'active' : ''}`}>
            <MessageCircle size={18} /> <span>Messages</span>
          </Link>
          <Link to="/search" className={`js-nav-link ${location.pathname === '/search' ? 'active' : ''}`}>
            <SearchIcon size={18} /> <span>Search</span>
          </Link>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="js-header-actions">
          {/* Notification Icon */}
          <button className="js-header-icon-btn">
            <Bell size={22} color="#64748b" />
            <span className="js-header-dot"></span>
          </button>

          <div className="js-help-dropdown-wrap">
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

          <div className="js-header-menu-wrap">
            <button
              className="js-header-avatar-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Avatar src={finalAvatarUrl} name={profile?.name} size="sm" />
              <ChevronDown size={14} color="#64748b" />
            </button>

            {dropdownOpen && (
              <div className="js-header-dropdown">
                {/* Identity Header (Matches Sidebar style) */}
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
                        <Link to="/settings" className="js-dropdown-upgrade-btn">Upgrade now</Link>
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

                <Link to="/dashboard?edit=true" className="js-dropdown-item with-icon">
                  <User size={16} /> <span>Edit profile</span>
                </Link>
                <Link to="/settings" className="js-dropdown-item with-icon">
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
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .js-header-wrapper {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          height: 70px;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .js-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 100%;
          padding: 0 40px;
          max-width: 100%;
        }

        .js-header-left { 
          flex: 1; 
          display: flex;
          justify-content: flex-start;
        }

        .js-header-logo {
          position: relative;
          left: -290px; /* Adjust this to move logo independently */
        }

        .js-header-logo img {
          height: 28px;
          display: block;
        }

        .js-header-main-nav {
          display: flex;
          gap: 40px;
          flex: 0 0 auto;
          justify-content:   center;
          position: relative;
          left: 0; /* Adjust this to move middle section independently */
        }

        .js-nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 0;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
        }
        .js-nav-link:hover { color: #D63447; }
        .js-nav-link.active { color: #D63447; border-bottom-color: #D63447; }
        .js-nav-link svg { color: #64748b; transition: color 0.2s; }
        .js-nav-link:hover svg, .js-nav-link.active svg { color: #D63447; }

        .js-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 20px;
        }

        /* Help Dropdown */
        .js-help-dropdown-wrap { position: relative; }
        .js-help-trigger {
          background: none; border: none; color: #64748b;
          font-size: 14px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          padding: 8px 0;
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

        .js-header-icon-btn {
          background: #f8fafc;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
        }
        .js-header-icon-btn:hover { background: #f1f5f9; }

        .js-header-icon-btn.profile { padding: 0; overflow: hidden; border: 1px solid #e2e8f0; }
        
        .js-header-avatar-trigger {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 20px;
          transition: background 0.2s;
        }
        .js-header-avatar-trigger:hover { background: #f8fafc; }

        .js-header-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border: 2px solid #fff;
          border-radius: 50%;
        }

        .js-header-menu-wrap {
          position: relative;
        }

        .js-header-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 320px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          margin-top: 10px;
          z-index: 100;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          padding: 10px 0;
        }

        .js-dropdown-profile-header {
          padding: 24px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #fff;
        }
        .js-dropdown-name {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 12px;
          text-transform: capitalize;
        }
        .js-dropdown-brand { 
          margin-bottom: 15px;
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .js-dropdown-logo-img { 
          height: 12px; 
          width: auto;
          max-width: 180px;
          object-fit: contain;
        }
        .js-dropdown-id-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 20px;
        }
        .js-dropdown-id-val { 
          font-size: 16px; 
          font-weight: 800; 
          color: #1e293b; 
        }
        .js-dropdown-membership { 
          font-size: 13px; 
          color: #D63447; 
          font-weight: 700; 
        }

        .js-dropdown-upgrade-box {
          background: #fff8f1;
          border-radius: 12px;
          padding: 15px;
          position: relative;
          overflow: hidden;
          border: 1px solid #ffedd5;
          text-align: left;
          width: 100%;
        }
        .js-dropdown-upgrade-text { position: relative; z-index: 2; }
        .js-dropdown-upgrade-text p {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
          line-height: 1.4;
          max-width: 150px;
        }
        .js-dropdown-upgrade-btn {
          display: inline-block;
          background: #ea580c;
          color: #fff;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }
        .js-dropdown-crown {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 60px;
          height: 60px;
        }

        .js-dropdown-section-title {
          padding: 10px 20px 5px;
          font-size: 12px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .js-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          color: #475569;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .js-dropdown-item:hover { background: #f8fafc; color: #D63447; }
        .js-dropdown-item.with-icon svg { color: #64748b; }
        .js-dropdown-item:hover svg { color: #D63447; }

        .js-dropdown-more-wrap { position: relative; }
        .js-dropdown-sub-menu {
          background: #f8fafc;
          padding: 5px 0;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }
        .js-dropdown-sub-item {
          display: block;
          padding: 8px 52px;
          color: #64748b;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .js-dropdown-sub-item:hover { color: #D63447; }

        .js-dropdown-divider { height: 1px; background: #f1f5f9; margin: 5px 0; }
        .js-dropdown-item.logout { width: 100%; text-align: left; border: none; background: none; cursor: pointer; color: #ef4444; }
        .js-dropdown-item.logout:hover { background: #fef2f2; }
      `}} />
    </nav>
  );
}
