import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Home,
  Heart,
  Eye,
  Settings,
  Shield,
  LogOut,
  Search,
  Users,
  Mail,
  Zap,
  ChevronRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import InterestList from '../components/interests/InterestList';
import ProfileCard from '../components/profile/ProfileCard';
import PhoneVerifyModal from '../components/auth/PhoneVerifyModal';
import { useAuth } from '../hooks/useAuth';
import { useInterests } from '../hooks/useInterests';
import { searchService } from '../services/searchService';
import { photoService } from '../services/photoService';
import { profileService } from '../services/profileService';
import { authService } from '../services/authService';
import { differenceInYears, parseISO, formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, logout, isAdmin, refreshProfile } = useAuth();
  const { received, sent, loading: loadingInterests, remainingToday, refresh } = useInterests();

  const [tab, setTab] = useState('overview');
  const [recentProfiles, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [profileViewers, setViewers] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showPhoneModal, setShowPhone] = useState(false);
  const [stats, setStats] = useState({ viewers: 0, received: 0, sent: 0 });

  const age = profile?.dob ? differenceInYears(new Date(), parseISO(profile.dob)) : null;

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingRecent(true);
    try {
      const recent = await searchService.getRecentProfiles(12);
      setRecent(recent.filter((p) => p.user_id !== user.id));

      if (profile) {
        const [viewers, photo] = await Promise.all([
          profileService.getProfileViewers(user.id),
          photoService.getPrimaryPhoto(user.id),
        ]);
        setViewers(viewers);
        if (photo?.signed_url) setAvatarUrl(photo.signed_url);
      }
    } catch {
      // Fail silently
    } finally {
      setLoadingRecent(false);
    }
  }, [user?.id, profile]);

  useEffect(() => { loadData(); }, [loadData]);

  const completion = profileService.calculateCompletion(profile, !!avatarUrl);

  useEffect(() => {
    setStats({ viewers: profileViewers.length, received: received.length, sent: sent.length });
  }, [profileViewers, received, sent]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (!profile) {
    return (
      <div className="dashboard-no-profile-wrapper">
        <div className="incomplete-banner">
          ⚠️ Your profile is incomplete. <Link to="/create-profile" className="complete-link">Complete it now →</Link>
        </div>
        <div className="dashboard-no-profile-content container">
          <h2 className="dash-section-title">Discover Matches</h2>
          {loadingRecent ? <Spinner /> : (
            <div className="dash-profiles-grid">
              {recentProfiles.map((p) => <ProfileCard key={p.user_id} profile={p} />)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* PREMIUM SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <img src="/images/logo.png" alt="SakharPuda" style={{ height: '30px' }} />
          </div>
          <div className="sidebar-user">
            <Avatar src={avatarUrl} name={profile.name} size="md" verified={profile.admin_verified} />
            <div className="user-info">
              <span className="user-name">{profile.name?.split(' ')[0]}</span>
              <span className="user-status">{profile.admin_verified ? 'Premium Member' : 'Free Member'}</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button className={`menu-item ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            <Home size={18} className="icon" /> Dashboard
          </button>
          <button className={`menu-item ${tab === 'interests' ? 'active' : ''}`} onClick={() => setTab('interests')}>
            <Heart size={18} className="icon" /> Interests {stats.received > 0 && <span className="count">{stats.received}</span>}
          </button>
          <button className={`menu-item ${tab === 'viewers' ? 'active' : ''}`} onClick={() => setTab('viewers')}>
            <Eye size={18} className="icon" /> Profile Views
          </button>
          <button className={`menu-item ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
            <Settings size={18} className="icon" /> Settings
          </button>
          {isAdmin && (
            <Link to="/admin" className="menu-item admin-link">
              <Shield size={18} className="icon" /> Admin Panel
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* DASHBOARD CONTENT */}
      <main className="dash-main">
        {/* TOP BAR */}
        <header className="dash-header">
          <div className="header-left">
            <h1>Hello, {profile.name?.split(' ')[0]}!</h1>
            <p>Here are your matches for today.</p>
          </div>
          <div className="header-right">
            <Link to="/search" className="btn btn-primary btn-sm btn-icon">
              <Search size={16} /> Advanced Search
            </Link>
          </div>
        </header>

        {/* OVERVIEW CONTENT */}
        {tab === 'overview' && (
          <div className="overview-grid">
            {/* STATS ROW */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon-bg"><Eye className="pink" /></div>
                <div className="stat-details">
                  <span className="stat-val">{stats.viewers}</span>
                  <span className="stat-label">Profile Views</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-bg"><Mail className="pink" /></div>
                <div className="stat-details">
                  <span className="stat-val">{stats.received}</span>
                  <span className="stat-label">Interests Received</span>
                </div>
              </div>
              <div className="stat-card completion-card">
                <div className="completion-info">
                  <span className="stat-label">Profile Strength</span>
                  <span className="completion-val">{completion}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${completion}%` }}></div>
                </div>
              </div>
            </div>

            {/* PREMIUM UPGRADE BANNER */}
            {!profile.admin_verified && (
              <div className="premium-banner">
                <div className="banner-content">
                  <div className="banner-icon"><Zap size={32} /></div>
                  <div>
                    <h3>Get more with Premium</h3>
                    <p>View contact numbers and chat unlimitedly with your matches.</p>
                  </div>
                </div>
                <Link to="/membership" className="btn btn-gold">Explore Plans</Link>
              </div>
            )}

            {/* RECENT MATCHES SECTION */}
            <section className="dash-section">
              <div className="section-header">
                <h2>Daily Recommendations</h2>
                <Link to="/search" className="view-all">View All</Link>
              </div>
              {loadingRecent ? <Spinner /> : (
                <div className="dash-profiles-grid">
                  {recentProfiles.map((p) => (
                    <ProfileCard key={p.user_id} profile={p} onInterestSent={refresh} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* INTERESTS TAB */}
        {tab === 'interests' && (
          <div className="tab-content">
            <div className="content-card">
              <h2>Interests Received</h2>
              <InterestList interests={received} type="received" onUpdate={refresh} />
            </div>
            <div className="content-card" style={{ marginTop: '30px' }}>
              <h2>Interests Sent</h2>
              <InterestList interests={sent} type="sent" onUpdate={refresh} />
            </div>
          </div>
        )}

        {/* VIEWERS TAB */}
        {tab === 'viewers' && (
          <div className="tab-content">
            <div className="content-card">
              <h2>Who Viewed Your Profile</h2>
              {profileViewers.length === 0 ? (
                <div className="empty-state">
                  <span className="icon">👀</span>
                  <p>No views yet. Try completing your profile for better visibility!</p>
                </div>
              ) : (
                <div className="viewers-list">
                  {profileViewers.map((v) => (
                    <div key={v.viewer_id} className="viewer-item">
                      <Avatar name={v.profiles?.name} size="sm" />
                      <div className="viewer-info">
                        <strong>{v.profiles?.name}</strong>
                        <span>{v.profiles?.city} • {v.viewed_at && formatDistanceToNow(new Date(v.viewed_at), { addSuffix: true })}</span>
                      </div>
                      <Link to={`/profile/${v.viewer_id}`} className="btn btn-ghost btn-sm">View →</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <div className="tab-content">
            <div className="content-card settings-grid">
              <div className="settings-section">
                <h3>Account Information</h3>
                <div className="info-row"><span>Email</span> <strong>{user?.email}</strong></div>
                <div className="info-row"><span>Phone</span> <strong>{profile.mobile_verified ? 'Verified' : 'Not Verified'}</strong></div>
                <div className="info-row"><span>Interests Today</span> <strong>{remainingToday}/10</strong></div>
              </div>
              <div className="settings-section">
                <h3>Actions</h3>
                <div className="btn-group">
                  <Button variant="outline" onClick={() => setShowPhone(true)}>Verify Mobile</Button>
                  <Button variant="danger" size="sm" onClick={async () => {
                    if (window.confirm('Delete account permanently?')) {
                      await authService.deleteAccount();
                      logout();
                      navigate('/');
                    }
                  }}>Delete Account</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <PhoneVerifyModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhone(false)}
        onVerified={refreshProfile}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .dashboard-wrapper {
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: 100vh;
          background: #f8f9fb;
        }

        /* SIDEBAR */
        .dash-sidebar {
          background: #fff;
          border-right: 1px solid #eee;
          display: flex;
          flex-direction: column;
          padding: 30px 20px;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sidebar-brand {
          font-size: 24px;
          font-weight: 800;
          color: #D63447;
          margin-bottom: 40px;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 30px;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 30px;
        }

        .user-name { font-weight: 700; color: #333; display: block; }
        .user-status { font-size: 12px; color: #D63447; font-weight: 600; }

        .sidebar-menu { flex: 1; }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #666;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          margin-bottom: 4px;
          text-decoration: none;
        }

        .menu-item:hover, .menu-item.active {
          background: #fdf5f6;
          color: #D63447;
        }

        .menu-item .count {
          background: #D63447;
          color: #fff;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          margin-left: auto;
        }

        .logout-btn {
          width: 100%;
          padding: 12px;
          border: 1px solid #eee;
          background: #fff;
          border-radius: 8px;
          color: #888;
          font-weight: 600;
          cursor: pointer;
        }

        /* MAIN CONTENT */
        .dash-main { padding: 40px; }
        .dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .dash-header h1 { font-size: 28px; font-weight: 800; color: #333; }
        .dash-header p { color: #888; margin-top: 4px; }

        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 30px; }
        .stat-card {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .stat-icon-bg {
          width: 48px;
          height: 48px;
          background: #fdf5f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-val { font-size: 24px; font-weight: 800; color: #333; display: block; }
        .stat-label { font-size: 13px; color: #888; font-weight: 600; }

        .completion-card { flex-direction: column; align-items: stretch; justify-content: center; }
        .completion-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .progress-bar { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: #D63447; }

        .premium-banner {
          background: linear-gradient(to right, #D63447, #e04a5c);
          color: #fff;
          padding: 30px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .banner-icon {
          background: rgba(255, 255, 255, 0.2);
          padding: 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .banner-content { display: flex; align-items: center; gap: 20px; }
        .banner-content h3 { font-size: 20px; margin-bottom: 5px; }
        .btn-gold { background: #fff; color: #D63447; font-weight: 700; padding: 10px 24px; border-radius: 25px; text-decoration: none; }
        .btn-icon { display: flex; align-items: center; gap: 8px; }

        .dash-section h2 { font-size: 20px; font-weight: 700; margin-bottom: 20px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .view-all { color: #D63447; font-weight: 700; text-decoration: none; font-size: 14px; }

        .content-card { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .viewers-list { display: flex; flex-direction: column; gap: 15px; }
        .viewer-item { display: flex; align-items: center; gap: 15px; padding: 15px; border-bottom: 1px solid #f0f0f0; }
        .viewer-info { flex: 1; display: flex; flex-direction: column; }
        .viewer-info span { font-size: 12px; color: #888; }

        @media (max-width: 992px) {
          .dashboard-wrapper { grid-template-columns: 1fr; }
          .dash-sidebar { display: none; }
          .stats-row { grid-template-columns: 1fr; }
          .premium-banner { flex-direction: column; text-align: center; gap: 20px; }
        }
      `}} />
    </div>
  );
}
