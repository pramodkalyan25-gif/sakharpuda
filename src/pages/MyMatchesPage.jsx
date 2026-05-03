import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import ProfileCard from '../components/profile/ProfileCard';
import Spinner from '../components/ui/Spinner';
import Avatar from '../components/ui/Avatar';
import { interestService } from '../services/interestService';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Star, 
  Settings, 
  Bell, 
  Menu,
  Filter,
  CheckCircle,
  Video,
  Phone,
  Search as SearchIcon
} from 'lucide-react';

export default function MyMatchesPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (user?.id) {
      interestService.getMutualConnections(user.id)
        .then(setMatches)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const filters = ['Filters', 'Verified', 'Just Joined', 'Nearby'];

  return (
    <div className="js-dashboard-wrapper">
      <TopNav />
      
      <main className="js-main-grid container">
        {/* LEFT SIDEBAR */}
        <aside className="js-left-sidebar">
          <div className="js-profile-brief">
            <div className="js-brief-avatar">
              <Avatar src={null} name={profile?.name} size="lg" />
            </div>
            <div className="js-brief-info">
              <h3>Hi {profile?.name?.split(' ')[0]}!</h3>
              <p>{profile?.user_id?.substring(0, 8)} <Link to="/create-profile" className="js-edit-link">Edit Profile</Link></p>
            </div>
          </div>

          <nav className="js-side-nav">
            <Link to="/my-matches" className="js-nav-item active">
              <span className="js-nav-label">Matches</span>
              <span className="js-nav-arrow">›</span>
            </Link>
            <Link to="/dashboard" className="js-nav-item">
              <span className="js-nav-label">Activity</span>
              <span className="js-nav-arrow">›</span>
            </Link>
            <Link to="/search" className="js-nav-item">
              <span className="js-nav-label">Search</span>
              <span className="js-nav-arrow">›</span>
            </Link>
            <Link to="/inbox" className="js-nav-item">
              <span className="js-nav-label">Messenger</span>
              <span className="js-nav-arrow">›</span>
            </Link>
            <Link to="/upgrade" className="js-nav-item upgrade">
              <span className="js-nav-label">Upgrade</span>
              <span className="js-nav-badge">54% Off</span>
              <span className="js-nav-arrow">›</span>
            </Link>
          </nav>
        </aside>

        {/* MIDDLE CONTENT */}
        <div className="js-content-area">
          <div className="js-filter-bar">
            <button className="js-filter-btn main">
              <Filter size={14} /> <span>Filters</span>
            </button>
            {filters.slice(1).map(f => (
              <button key={f} className="js-filter-btn">
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="js-loader"><Spinner size="lg" /></div>
          ) : (
            <div className="js-matches-list">
              {matches.length > 0 ? (
                matches.map((item) => (
                  <ProfileCard key={item.id} profile={item.profiles} />
                ))
              ) : (
                <div className="js-empty-state">
                  <Users size={48} color="#cbd5e1" />
                  <h3>No matches found yet</h3>
                  <p>Keep exploring and sending interests to find your perfect match.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="js-right-sidebar">
          <div className="js-premium-nudge">
            <h3>You are <span className="red">missing</span> out on the premium benefits!</h3>
            
            <div className="js-benefit-list">
              <div className="js-benefit-item">
                <div className="js-benefit-icon purple"><Users size={16} /></div>
                <p>Get upto 3x more profile views</p>
              </div>
              <div className="js-benefit-item">
                <div className="js-benefit-icon orange">
                  <div className="js-icon-stack">
                    <Phone size={10} />
                    <Video size={10} />
                  </div>
                </div>
                <p>Unlimited voice & video calls</p>
              </div>
              <div className="js-benefit-item">
                <div className="js-benefit-icon green"><CheckCircle size={16} /></div>
                <p>Get access to contact details</p>
              </div>
              <div className="js-benefit-item">
                <div className="js-benefit-icon blue"><SearchIcon size={16} /></div>
                <p>Perform unlimited searches</p>
              </div>
            </div>

            <div className="js-promo-footer">
              <p>Flat 54% OFF till 07 May</p>
              <button className="js-upgrade-btn" onClick={() => navigate('/upgrade')}>
                Upgrade now <span>→</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .js-dashboard-wrapper {
          min-height: 100vh;
          background: #f1f2f5;
          padding-bottom: 50px;
        }

        .js-main-grid {
          display: grid;
          grid-template-columns: 240px 1fr 280px;
          gap: 20px;
          margin-top: 20px;
          align-items: flex-start;
        }

        /* Left Sidebar */
        .js-left-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .js-profile-brief {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-brief-avatar { margin-bottom: 12px; }
        .js-brief-info h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
        .js-brief-info p { font-size: 12px; color: #64748b; }
        .js-edit-link { color: #D63447; font-weight: 700; text-decoration: none; margin-left: 4px; }

        .js-side-nav {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-nav-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          text-decoration: none;
          color: #475569;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }
        .js-nav-item:hover { background: #f8fafc; }
        .js-nav-item.active { color: #D63447; border-left: 3px solid #D63447; background: #fff1f2; }
        .js-nav-badge { background: #10b981; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
        .js-nav-arrow { color: #cbd5e1; font-size: 18px; }

        /* Middle Content */
        .js-content-area {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .js-filter-bar {
          background: #fff;
          border-radius: 20px;
          padding: 8px 15px;
          display: flex;
          gap: 10px;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-filter-btn {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .js-filter-btn.main { border-color: #D63447; color: #D63447; }
        .js-filter-btn:hover { background: #f8fafc; }

        .js-matches-list {
          display: flex;
          flex-direction: column;
        }

        .js-loader { padding: 100px 0; text-align: center; }
        .js-empty-state {
          background: #fff; border-radius: 12px; padding: 60px;
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px;
        }
        .js-empty-state h3 { font-size: 20px; font-weight: 800; color: #1e293b; }
        .js-empty-state p { color: #64748b; font-size: 14px; max-width: 300px; }

        /* Right Sidebar */
        .js-right-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .js-premium-nudge {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-premium-nudge h3 { font-size: 15px; font-weight: 700; color: #1e293b; line-height: 1.4; margin-bottom: 20px; text-align: center; }
        .js-premium-nudge .red { color: #D63447; }

        .js-benefit-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px; }
        .js-benefit-item { display: flex; align-items: center; gap: 12px; }
        .js-benefit-icon {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .js-benefit-icon.purple { background: #f3e8ff; color: #9333ea; }
        .js-benefit-icon.orange { background: #fff7ed; color: #ea580c; }
        .js-benefit-icon.green { background: #f0fdf4; color: #16a34a; }
        .js-benefit-icon.blue { background: #eff6ff; color: #2563eb; }
        .js-benefit-item p { font-size: 13px; color: #475569; font-weight: 500; }

        .js-icon-stack { display: flex; flex-direction: column; align-items: center; gap: 2px; }

        .js-promo-footer { text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .js-promo-footer p { font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 12px; }
        .js-upgrade-btn {
          width: 100%; background: #D63447; color: #fff; border: none;
          padding: 12px; border-radius: 8px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        @media (max-width: 1024px) {
          .js-main-grid { grid-template-columns: 200px 1fr; }
          .js-right-sidebar { display: none; }
        }
        @media (max-width: 768px) {
          .js-main-grid { grid-template-columns: 1fr; }
          .js-left-sidebar { display: none; }
        }
      `}} />
    </div>
  );
}
