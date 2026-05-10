import { Link, useLocation } from 'react-router-dom';
import { Camera } from 'lucide-react';
import Avatar from './Avatar';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ children }) {
  const { profile, avatarUrl } = useAuth();
  const location = useLocation();

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
    </aside>
  );
}
