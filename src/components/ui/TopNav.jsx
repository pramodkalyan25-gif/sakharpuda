import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Search, Heart, User, Bell, ChevronDown, LogOut, Settings, Shield, Menu } from 'lucide-react';
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

  return (
    <nav className="js-header-wrapper">
      <div className="js-header-container container">
        {/* LEFT: LOGO */}
        <Link to="/dashboard" className="js-header-logo">
          <img src="/images/logo.png" alt="SakharPuda" />
        </Link>

        {/* RIGHT: ACTIONS */}
        <div className="js-header-actions">
          <button className="js-header-icon-btn">
            <User size={22} color="#64748b" />
          </button>
          
          <button className="js-header-icon-btn">
            <Bell size={22} color="#64748b" />
            <span className="js-header-dot"></span>
          </button>

          <div className="js-header-menu-wrap">
            <button 
              className="js-header-icon-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
            >
              <Menu size={22} color="#64748b" />
            </button>

            {dropdownOpen && (
              <div className="js-header-dropdown">
                <div className="js-dropdown-user">
                  <strong>{profile?.name}</strong>
                  <span>{profile?.admin_verified ? 'Premium Member' : 'Free Member'}</span>
                </div>
                <Link to="/create-profile" className="js-dropdown-item">Edit Profile</Link>
                <Link to="/settings" className="js-dropdown-item">Account Settings</Link>
                {isAdmin && <Link to="/admin" className="js-dropdown-item">Admin Panel</Link>}
                <div className="js-dropdown-divider"></div>
                <button onClick={handleLogout} className="js-dropdown-item logout">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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
          width: 100%;
        }

        .js-header-logo img {
          height: 30px;
          display: block;
        }

        .js-header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

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
          top: calc(100% + 10px);
          right: 0;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          min-width: 220px;
          padding: 10px 0;
          border: 1px solid #f1f5f9;
        }

        .js-dropdown-user {
          padding: 12px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
        }
        .js-dropdown-user strong { font-size: 14px; color: #1e293b; }
        .js-dropdown-user span { font-size: 12px; color: #D63447; font-weight: 600; }

        .js-dropdown-item {
          display: block;
          padding: 10px 20px;
          color: #475569;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        }
        .js-dropdown-item:hover { background: #f8fafc; color: #D63447; }
        .js-dropdown-divider { height: 1px; background: #f1f5f9; margin: 5px 0; }
        .js-dropdown-item.logout { width: 100%; text-align: left; border: none; background: none; cursor: pointer; color: #ef4444; }
        .js-dropdown-item.logout:hover { background: #fef2f2; }
      `}} />
    </nav>
  );
}
