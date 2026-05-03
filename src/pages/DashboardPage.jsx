import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Settings, 
  Shield, 
  LogOut, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  Lock, 
  Heart,
  Search,
  MessageSquare,
  Users,
  Bell,
  Star,
  Check,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import ProfileCard from '../components/profile/ProfileCard';
import TopNav from '../components/ui/TopNav';
import EditProfileModal from '../components/profile/EditProfileModal';
import { useAuth } from '../hooks/useAuth';
import { useInterests } from '../hooks/useInterests';
import { searchService } from '../services/searchService';
import { photoService } from '../services/photoService';
import { profileService } from '../services/profileService';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, logout, isAdmin, refreshProfile } = useAuth();
  const { received, remainingToday, refresh } = useInterests();

  const [dailyMatches, setDailyMatches] = useState([]);
  const [newMatches, setNewMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileViewers, setViewers] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStep, setEditStep] = useState(1);

  const openEditModal = (step = 1) => {
    setEditStep(step);
    setIsEditModalOpen(true);
  };

  const handleProfileUpdate = async () => {
    await refreshProfile(); // Refresh AuthContext profile
    await loadData(); // Refresh dashboard specific data (matches, photos)
  };

  const loadData = useCallback(async () => {
    if (!user?.id || !profile) return;
    setLoading(true);
    try {
      const oppositeGender = (profile.gender || '').toLowerCase() === 'male' ? 'female' : 'male';
      
      const [newest, viewers, photo, recommendations] = await Promise.all([
        searchService.getNewMatches(user.id, oppositeGender, 8),
        profileService.getProfileViewers(user.id),
        photoService.getPrimaryPhoto(user.id),
        searchService.getRecommendedProfiles(user.id, profile)
      ]);
      
      setDailyMatches(recommendations?.profiles || []);
      setNewMatches(newest || []);
      setViewers(viewers || []);
      if (photo?.signed_url) setAvatarUrl(photo.signed_url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!profile) {
    return (
      <div className="loading-state">
        <Spinner size="lg" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const pendingReceived = received.filter(r => r.status === 'pending');

  return (
    <div className="dashboard-container">
      <TopNav />
      
      <div className="dashboard-hero">
        <div className="container hero-content">
          <div className="greeting-box">
            <h1>Namaste, {profile?.name?.split(' ')[0]}!</h1>
            <p>Welcome back to your SakharPuda dashboard. Here's what's happening today.</p>
          </div>
          <div className="hero-stats desktop-only">
            <div className="hero-stat-item">
              <span className="stat-num">{profileViewers.length}</span>
              <span className="stat-label">Profile Views</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">{pendingReceived.length}</span>
              <span className="stat-label">Interests</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">{remainingToday}</span>
              <span className="stat-label">Left Today</span>
            </div>
          </div>
        </div>
      </div>

      <main className="dashboard-grid container">
        {/* LEFT SIDEBAR: QUICK NAVIGATION */}
        <aside className="dashboard-sidebar">
          <div className="profile-snapshot">
            <div className="snapshot-avatar-wrap">
              <Avatar src={avatarUrl} name={profile?.name} size="xl" verified={profile?.admin_verified} />
              <button className="edit-overlay-btn" onClick={() => openEditModal(9)} title="Edit Photos">
                <Camera size={18} />
                <span>Edit</span>
              </button>
            </div>
            <div className="snapshot-details">
              <h3>{profile?.name}</h3>
              <p>{profile?.caste} • {profile?.city}</p>
              <button onClick={() => openEditModal(1)} className="text-link">Edit Profile</button>
            </div>
          </div>

          <nav className="side-nav">
            <Link to="/dashboard" className="side-nav-link active">
              <Heart size={18} /> <span>My Dashboard</span>
            </Link>
            <Link to="/search" className="side-nav-link">
              <Search size={18} /> <span>Find Matches</span>
            </Link>
            <Link to="/inbox" className="side-nav-link">
              <MessageSquare size={18} /> <span>Inbox</span>
              {pendingReceived.length > 0 && <span className="nav-badge">{pendingReceived.length}</span>}
            </Link>
            <Link to="/my-matches" className="side-nav-link">
              <Users size={18} /> <span>My Matches</span>
            </Link>
            <Link to="/interests" className="side-nav-link">
              <Star size={18} /> <span>Interests</span>
            </Link>
            <div className="nav-divider"></div>
            <Link to="/settings" className="side-nav-link">
              <Settings size={18} /> <span>Settings</span>
            </Link>
            <button onClick={logout} className="side-nav-link logout-btn">
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </nav>

          <div className="verification-card">
            <Shield size={24} className="shield-icon" />
            <h4>Trust & Safety</h4>
            <p>Verified profiles receive 3x more interests.</p>
            <Link to="/verify" className="btn-verify-mini">Get Verified Now</Link>
          </div>
        </aside>

        {/* MIDDLE CONTENT: MATCHES */}
        <div className="dashboard-content">
          
          {/* SECTION 1: DAILY RECOMMENDATIONS */}
          <section className="dashboard-section">
            <div className="section-header">
              <div className="title-with-icon">
                <TrendingUp size={20} className="header-icon red" />
                <h2>Daily Recommendations</h2>
              </div>
              <Link to="/search" className="view-all">View All</Link>
            </div>
            <div className="matches-scroll">
              {loading ? <Spinner /> : (
                <div className="matches-grid-horizontal">
                  {dailyMatches.map(p => (
                    <div className="match-card-wrapper" key={p.user_id}>
                      <ProfileCard profile={p} onInterestSent={refresh} />
                    </div>
                  ))}
                  {dailyMatches.length === 0 && <p className="empty-state">No recommendations yet. Try adjusting your preferences.</p>}
                </div>
              )}
            </div>
          </section>

          {/* SECTION 2: NEW MATCHES */}
          <section className="dashboard-section">
            <div className="section-header">
              <div className="title-with-icon">
                <UserPlus size={20} className="header-icon gold" />
                <h2>New Members</h2>
              </div>
              <Link to="/search" className="view-all">View All</Link>
            </div>
            <div className="matches-scroll">
              {loading ? <Spinner /> : (
                <div className="matches-grid-horizontal">
                  {newMatches.map(p => (
                    <div className="match-card-wrapper" key={p.user_id}>
                      <ProfileCard profile={p} onInterestSent={refresh} />
                    </div>
                  ))}
                  {newMatches.length === 0 && <p className="empty-state">No new members today.</p>}
                </div>
              )}
            </div>
          </section>

          {/* SECTION 3: RECENT ACTIVITY */}
          <section className="dashboard-section activity-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
            </div>
            <div className="activity-list">
              {profileViewers.length > 0 ? (
                profileViewers.slice(0, 3).map((v, i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-avatar">
                      <Avatar src={null} name={v.profiles?.name} size="sm" />
                    </div>
                    <div className="activity-text">
                      <span className="user-name">{v.profiles?.name || 'Someone'}</span>
                      <span className="action-text">viewed your profile</span>
                      <span className="time-text">{formatDistanceToNow(new Date(v.viewed_at))} ago</span>
                    </div>
                    <Link to={`/profile/${v.viewer_id}`} className="activity-btn">View Back</Link>
                  </div>
                ))
              ) : (
                <p className="empty-state">No recent activity found.</p>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR: NUDGES */}
        <aside className="dashboard-nudges">
          <div className="nudge-card premium">
            <div className="premium-badge">PREMIUM</div>
            <h3>Upgrade to Gold</h3>
            <p>Directly contact matches and see who viewed your profile.</p>
            <ul className="premium-list">
              <li><Check size={14} /> Unlimited Interests</li>
              <li><Check size={14} /> Priority Support</li>
              <li><Check size={14} /> Profile Boost</li>
            </ul>
            <button className="btn-premium-action">Upgrade Now</button>
          </div>

          <div className="nudge-card referral">
            <h3>Invite & Earn</h3>
            <p>Invite friends to SakharPuda and get premium benefits.</p>
            <button 
              className="btn-outline-mini"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin);
                toast.success('Referral link copied!');
              }}
            >
              Share Link
            </button>
          </div>

          <div className="tip-card">
            <Bell size={20} className="tip-icon" />
            <p><strong>Pro Tip:</strong> Profiles with at least 3 photos receive 5x more responses!</p>
          </div>
        </aside>
      </main>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleProfileUpdate} 
        defaultStep={editStep}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-container {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 60px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          gap: 15px;
          color: #64748b;
        }

        /* --- HERO SECTION --- */
        .dashboard-hero {
          background: linear-gradient(135deg, #D63447 0%, #a52837 100%);
          color: #fff;
          padding: 60px 0 100px;
          margin-bottom: -60px;
        }
        .hero-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .greeting-box h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        .greeting-box p { font-size: 16px; opacity: 0.9; }

        .hero-stats { display: flex; gap: 40px; }
        .hero-stat-item { text-align: center; }
        .stat-num { display: block; font-size: 24px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; opacity: 0.8; letter-spacing: 0.5px; }

        /* --- MAIN GRID --- */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          gap: 24px;
          padding-top: 20px;
        }

        /* --- SIDEBAR --- */
        .dashboard-sidebar { display: flex; flex-direction: column; gap: 20px; }
        
        .profile-snapshot {
          background: #fff;
          border-radius: 16px;
          padding: 30px 20px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border: 1px solid #edf2f7;
        }
        .snapshot-avatar-wrap {
          position: relative;
          display: inline-block;
          margin-bottom: 15px;
        }
        .avatar-edit-btn {
          position: absolute;
          bottom: 0; right: 0;
          background: #D63447; color: #fff;
          width: 32px; height: 32px; border-radius: 50%;
          border: 3px solid #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.2s;
        }
        .avatar-edit-btn:hover { transform: scale(1.1); }
        .snapshot-details h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
        .snapshot-details p { font-size: 13px; color: #64748b; margin-bottom: 10px; }
        .text-link { background: none; border: none; color: #D63447; font-weight: 700; font-size: 13px; cursor: pointer; text-decoration: underline; }

        .side-nav {
          background: #fff;
          border-radius: 16px;
          padding: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border: 1px solid #edf2f7;
        }
        .side-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #475569;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          border-radius: 10px;
          transition: 0.2s;
          position: relative;
        }
        .side-nav-link:hover { background: #f8fafc; color: #D63447; }
        .side-nav-link.active { background: #fff1f2; color: #D63447; }
        .nav-divider { height: 1px; background: #f1f5f9; margin: 10px 16px; }
        .nav-badge {
          position: absolute; right: 12px;
          background: #D63447; color: #fff;
          font-size: 10px; padding: 2px 6px; border-radius: 10px;
        }
        .logout-btn { width: 100%; border: none; background: none; cursor: pointer; }
        .logout-btn:hover { color: #dc2626; background: #fef2f2; }

        .verification-card {
          background: #fff; border-radius: 16px; padding: 20px;
          text-align: center; border: 1px dashed #cbd5e0;
        }
        .shield-icon { color: #3b82f6; margin-bottom: 12px; }
        .verification-card h4 { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
        .verification-card p { font-size: 12px; color: #64748b; margin-bottom: 15px; }
        .btn-verify-mini {
          display: block; background: #3b82f6; color: #fff;
          padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 700;
          text-decoration: none;
        }

        /* --- MIDDLE CONTENT --- */
        .dashboard-content { display: flex; flex-direction: column; gap: 30px; }
        
        .dashboard-section {
          background: #fff; border-radius: 16px; padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #edf2f7;
        }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .title-with-icon { display: flex; align-items: center; gap: 10px; }
        .title-with-icon h2 { font-size: 18px; font-weight: 800; color: #1e293b; }
        .header-icon { padding: 6px; border-radius: 8px; }
        .header-icon.red { background: #fff1f2; color: #D63447; }
        .header-icon.gold { background: #fffbeb; color: #C9956C; }
        .view-all { color: #D63447; font-weight: 700; font-size: 14px; text-decoration: none; }

        .matches-grid-horizontal {
          display: flex; overflow-x: auto; gap: 20px; padding-bottom: 15px;
          scrollbar-width: thin;
        }
        .match-card-wrapper { flex: 0 0 240px; }
        .empty-state { color: #94a3b8; font-size: 14px; padding: 20px; text-align: center; width: 100%; }

        .activity-list { display: flex; flex-direction: column; gap: 12px; }
        .activity-item {
          display: flex; align-items: center; gap: 15px;
          padding: 12px; border-radius: 12px; background: #f8fafc;
          transition: 0.2s;
        }
        .activity-item:hover { background: #f1f5f9; }
        .activity-text { flex: 1; font-size: 14px; }
        .user-name { font-weight: 700; color: #1e293b; margin-right: 6px; }
        .action-text { color: #64748b; margin-right: 6px; }
        .time-text { font-size: 12px; color: #94a3b8; display: block; }
        .activity-btn {
          font-size: 12px; font-weight: 700; color: #D63447;
          background: #fff; border: 1px solid #D63447;
          padding: 6px 12px; border-radius: 20px; text-decoration: none;
        }

        /* --- RIGHT SIDEBAR --- */
        .dashboard-nudges { display: flex; flex-direction: column; gap: 20px; }
        
        .nudge-card {
          background: #fff; border-radius: 16px; padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #edf2f7;
          position: relative; overflow: hidden;
        }
        .nudge-card.premium {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #fff;
        }
        .premium-badge {
          position: absolute; top: 12px; right: 12px;
          background: #C9956C; color: #000; font-size: 9px;
          font-weight: 800; padding: 2px 6px; border-radius: 4px;
        }
        .nudge-card h3 { font-size: 18px; font-weight: 800; margin-bottom: 10px; }
        .nudge-card p { font-size: 13px; opacity: 0.8; margin-bottom: 15px; }
        .premium-list { list-style: none; padding: 0; margin-bottom: 20px; }
        .premium-list li { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 6px; }
        .btn-premium-action {
          width: 100%; background: #C9956C; color: #000; border: none;
          padding: 12px; border-radius: 10px; font-weight: 800; cursor: pointer;
        }

        .btn-outline-mini {
          width: 100%; background: #fff; color: #D63447;
          border: 1.5px solid #D63447; padding: 10px;
          border-radius: 10px; font-weight: 700; cursor: pointer;
        }

        .tip-card {
          background: #fffbeb; border-radius: 16px; padding: 20px;
          display: flex; gap: 12px; align-items: flex-start;
          border: 1px solid #fde68a;
        }
        .tip-icon { color: #d97706; }
        .tip-card p { font-size: 13px; color: #92400e; line-height: 1.5; }

        @media (max-width: 1100px) {
          .dashboard-grid { grid-template-columns: 240px 1fr; }
          .dashboard-nudges { display: none; }
        }

        @media (max-width: 850px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .dashboard-sidebar { display: none; }
          .hero-content { flex-direction: column; text-align: center; }
          .greeting-box { margin-bottom: 20px; }
        }
      `}} />
    </div>
  );
}
