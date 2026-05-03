import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Search, Heart, User, Bell, ChevronDown, LogOut, Settings, Shield } from 'lucide-react';
import Avatar from './Avatar';

export default function TopNav() {
  const { user, profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const navLinks = [
    { name: 'My Dashboard', path: '/dashboard' },
    { name: 'My Matches', path: '/matches' },
    { name: 'Search', path: '/search' },
    { name: 'Inbox', path: '/inbox' }
  ];

  return (
    <nav className="topnav-wrapper">
      <div className="topnav-container">
        {/* Logo Area */}
        <Link to="/dashboard" className="topnav-brand">
          <img src="/images/logo.png" alt="SakharPuda" style={{ height: '30px' }} />
        </Link>

        {/* Primary Navigation */}
        <div className="topnav-links">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`topnav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions & Profile */}
        <div className="topnav-actions">
          <Link to="/upgrade" className="upgrade-btn">Upgrade</Link>
          
          <button className="icon-btn">
            <Bell size={20} />
            <span className="badge">3</span>
          </button>

          <div className="profile-menu-container">
            <button 
              className="profile-trigger" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
            >
              <Avatar src={null} name={profile?.name || 'User'} size="sm" />
              <ChevronDown size={16} />
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <strong>{profile?.name}</strong>
                  <span className="account-type">{profile?.admin_verified ? 'Premium Member' : 'Free Member'}</span>
                </div>
                
                <Link to={`/profile/${user?.id}`} className="dropdown-item">
                  <User size={16} /> View Profile
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <Settings size={16} /> Account Settings
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="dropdown-item">
                    <Shield size={16} /> Admin Panel
                  </Link>
                )}
                
                <div className="dropdown-divider"></div>
                
                <button onClick={handleLogout} className="dropdown-item logout">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .topnav-wrapper {
          background: #fff;
          border-bottom: 1px solid #eaeaea;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .topnav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          padding: 0 20px;
        }

        .topnav-links {
          display: flex;
          gap: 30px;
          height: 100%;
        }

        .topnav-link {
          text-decoration: none;
          color: #555;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          position: relative;
          height: 100%;
          transition: color 0.2s;
        }

        .topnav-link:hover { color: #D63447; }
        
        .topnav-link.active { color: #D63447; }
        .topnav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #D63447;
          border-radius: 3px 3px 0 0;
        }

        .topnav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .upgrade-btn {
          background: #ffb822;
          color: #fff;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .upgrade-btn:hover { background: #e5a41c; }

        .icon-btn {
          background: transparent;
          border: none;
          color: #666;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-btn:hover { color: #D63447; }

        .badge {
          position: absolute;
          top: -5px;
          right: -8px;
          background: #D63447;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 5px;
          border-radius: 10px;
          border: 2px solid #fff;
        }

        .profile-menu-container {
          position: relative;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          color: #555;
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          min-width: 200px;
          padding: 8px 0;
          border: 1px solid #eee;
        }

        .dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
        }
        .dropdown-header strong { font-size: 14px; color: #333; }
        .account-type { font-size: 12px; color: #D63447; font-weight: 600; margin-top: 2px; }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          color: #555;
          text-decoration: none;
          font-size: 14px;
          transition: background 0.2s;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .dropdown-item:hover { background: #f9f9f9; color: #D63447; }
        .dropdown-divider { height: 1px; background: #eee; margin: 4px 0; }
        .logout { color: #e53e3e; }
        .logout:hover { background: #fff5f5; color: #c53030; }

        @media (max-width: 768px) {
          .topnav-links { display: none; }
        }
      `}} />
    </nav>
  );
}
