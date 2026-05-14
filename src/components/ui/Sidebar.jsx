import { Link, useLocation } from 'react-router-dom';
import { Camera, CheckCircle, Users, Lock, Shield } from 'lucide-react';
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

        {/* Upgrade Nudge removed as requested */}

        <div className="js-community-trust-wrapper">
          <span className="js-trust-label">COMMUNITY & TRUST</span>
          <div className="js-trust-cards-stack">
            <div className="js-trust-card">
              <div className="js-trust-icon green">
                <CheckCircle size={22} />
              </div>
              <h5>Verified profiles</h5>
              <p>We verify phone & email of every member</p>
            </div>

            <div className="js-trust-card">
              <div className="js-trust-icon purple">
                <Users size={22} />
              </div>
              <h5>Community first</h5>
              <p>Premium matchmaking for serious match-seekers</p>
            </div>

            <div className="js-trust-card">
              <div className="js-trust-icon orange">
                <Lock size={22} />
              </div>
              <h5>Privacy protected</h5>
              <p>Contact details hidden until you connect</p>
            </div>

            <div className="js-trust-card">
              <div className="js-trust-icon blue">
                <Shield size={22} />
              </div>
              <h5>Family approved</h5>
              <p>Profiles vetted with families in mind</p>
            </div>
          </div>
        </div>
      </div>

      {children}
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .js-community-trust-wrapper {
          margin-top: 30px;
          padding: 0 10px;
        }
        .js-trust-label {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 20px;
        }
        .js-trust-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .js-trust-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .js-trust-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .js-trust-icon.green { background: #ecfdf5; color: #10b981; }
        .js-trust-icon.purple { background: #f5f3ff; color: #8b5cf6; }
        .js-trust-icon.orange { background: #fffbeb; color: #f59e0b; }
        .js-trust-icon.blue { background: #eff6ff; color: #3b82f6; }
        
        .js-trust-card h5 {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .js-trust-card p {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }
      `}} />
    </aside>
  );
}
