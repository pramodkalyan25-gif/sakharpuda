import { Link, useLocation } from 'react-router-dom';
import { Camera } from 'lucide-react';
import Avatar from './Avatar';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ children }) {
  const { profile, avatarUrl } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;


  return (
    <aside className="js-sidebar-v3">
      {/* Profile Header Section */}
      <div className="js-sidebar-profile-card">
        <div className="js-profile-centered">
          <div className="js-avatar-container">
            <Avatar src={avatarUrl} name={profile?.name} size="xl" />
            <Link to="/dashboard?edit=true&step=9" className="js-avatar-photo-btn" title="Edit Photos">
              <Camera size={14} />
            </Link>
          </div>
          
          <h3 className="js-profile-name">{profile?.name || 'Guest User'}</h3>
          
          <div className="js-brand-tag">
            <img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="js-brand-logo-small" />
          </div>

          <div className="js-profile-id-box">
            <span className="js-profile-id-val">{profile?.profile_id || 'ID Pending'}</span>
            <span className="js-membership-status">{profile?.admin_verified ? 'Premium member' : 'Free member'}</span>
          </div>
        </div>

        {/* Upgrade Nudge */}
        {!profile?.admin_verified && (
          <div className="js-upgrade-box">
            <div className="js-upgrade-content">
              <p>Upgrade membership to call or message with matches</p>
              <Link to="/settings" className="js-upgrade-btn-small">Upgrade now</Link>
            </div>
            <div className="js-crown-icon">
              <svg viewBox="0 0 100 100" className="js-crown-svg">
                <path d="M20 80 L80 80 L90 40 L70 55 L50 20 L30 55 L10 40 Z" fill="none" stroke="#fbd38d" strokeWidth="2" opacity="0.4" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {children}

      <style dangerouslySetInnerHTML={{ __html: `
        .js-sidebar-v3 {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 280px;
          flex-shrink: 0;
          position: sticky;
          top: 90px;
          height: fit-content;
        }

        /* Profile Card Styles */
        .js-sidebar-profile-card {
          background: #fff;
          border-radius: 12px;
          padding: 30px 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .js-profile-centered {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .js-avatar-container { 
          position: relative; 
          margin-bottom: 16px; 
        }
        
        .js-avatar-photo-btn {
          position: absolute; 
          bottom: 5px; 
          right: 5px;
          background: #fff; 
          color: #334155;
          width: 28px; 
          height: 28px; 
          border-radius: 50%;
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.2s; 
          z-index: 10;
          border: 1px solid #e2e8f0;
        }
        .js-avatar-photo-btn:hover { transform: scale(1.1); background: #f8fafc; }

        .js-profile-name {
          font-size: 22px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 8px;
          line-height: 1.2;
        }

        .js-brand-tag {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 15px;
          color: #475569;
          font-weight: 600;
          font-size: 14px;
        }
        .js-brand-logo-small {
          height: 18px;
          width: auto;
        }

        .js-profile-id-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .js-profile-id-val {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
        }
        .js-membership-status {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 500;
        }

        /* Upgrade Box */
        .js-upgrade-box {
          background: #fff5f5;
          border-radius: 16px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          border: 1px solid #fee2e2;
        }
        .js-upgrade-content {
          position: relative;
          z-index: 2;
        }
        .js-upgrade-content p {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
          line-height: 1.4;
          max-width: 160px;
        }
        .js-upgrade-btn-small {
          display: inline-block;
          background: #D63447;
          color: #fff;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          transition: background 0.2s;
        }
        .js-upgrade-btn-small:hover { background: #b91c1c; }

        .js-crown-icon {
          position: absolute;
          bottom: -10px;
          right: -10px;
          width: 80px;
          height: 80px;
          pointer-events: none;
        }

        @media (max-width: 1024px) {
          .js-sidebar-v3 { width: 100%; }
        }
      `}} />
    </aside>
  );
}
