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
  UserPlus,
  Video,
  Phone,
  Search as SearchIcon
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import ProfileCard from '../components/profile/ProfileCard';
import TopNav from '../components/ui/TopNav';
import { useAuth } from '../hooks/useAuth';
import { useInterests } from '../hooks/useInterests';
import { searchService } from '../services/searchService';
import { photoService } from '../services/photoService';
import { profileService } from '../services/profileService';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, logout, refreshProfile } = useAuth();
  const { received, remainingToday, refresh } = useInterests();

  const [dailyMatches, setDailyMatches] = useState([]);
  const [newMatches, setNewMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileViewers, setViewers] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);

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
      <div className="js-loader">
        <Spinner size="lg" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="js-dashboard-wrapper">
      <TopNav />
      
      <main className="js-main-grid container">
        {/* LEFT SIDEBAR */}
        <aside className="js-left-sidebar">
          <div className="js-profile-brief">
            <div className="js-brief-avatar">
              <Avatar src={avatarUrl} name={profile?.name} size="lg" />
            </div>
            <div className="js-brief-info">
              <h3>Hi {profile?.name?.split(' ')[0]}!</h3>
              <p>{profile?.profile_id || profile?.user_id?.substring(0, 8)} <Link to="/create-profile" className="js-edit-link">Edit Profile</Link></p>
            </div>
            
            {/* Profile Completion Tracker */}
            <div className="js-completion-wrapper">
              <div className="js-completion-label">
                <span>Profile Strength</span>
                <span>{profileService.calculateCompletion(profile, !!avatarUrl)}%</span>
              </div>
              <div className="js-completion-bar">
                <div className="js-completion-fill" style={{ width: `${profileService.calculateCompletion(profile, !!avatarUrl)}%` }} />
              </div>
            </div>
          </div>

          <nav className="js-side-nav">
            <Link to="/my-matches" className="js-nav-item">
              <span className="js-nav-label">Matches</span>
              <span className="js-nav-arrow">›</span>
            </Link>
            <Link to="/dashboard" className="js-nav-item active">
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

          <div className="js-verification-card">
            <Shield size={24} className="js-shield-icon" />
            <h4>Trust & Safety</h4>
            <p>Verified profiles receive 3x more interests.</p>
            <Link to="/verify" className="js-btn-verify">Get Verified</Link>
          </div>
        </aside>

        {/* MIDDLE CONTENT */}
        <div className="js-content-area">
          {/* Activity Summary Stats */}
          <div className="js-activity-stats">
            <div className="js-stat-item">
              <span className="js-stat-num">{profileViewers.length}</span>
              <span className="js-stat-label">Profile Views</span>
            </div>
            <div className="js-stat-divider"></div>
            <div className="js-stat-item">
              <span className="js-stat-num">{received.length}</span>
              <span className="js-stat-label">Interests Received</span>
            </div>
            <div className="js-stat-divider"></div>
            <div className="js-stat-item">
              <span className="js-stat-num">{remainingToday}</span>
              <span className="js-stat-label">Daily Remaining</span>
            </div>
          </div>

          {/* Recent Viewers Section */}
          {profileViewers.length > 0 && (
            <section className="js-dashboard-section viewer-section">
              <div className="js-section-header">
                <div className="js-title-row">
                  <Users size={18} className="blue" />
                  <h2>Recently Viewed You</h2>
                </div>
              </div>
              <div className="js-viewer-avatars">
                {profileViewers.slice(0, 6).map(v => (
                  <div key={v.viewer_id} className="js-viewer-item" onClick={() => navigate(`/profile/${v.viewer_id}`)}>
                    <Avatar src={null} name={v.profiles?.name} size="md" />
                    <span className="js-viewer-name">{v.profiles?.name?.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="js-dashboard-section">
            <div className="js-section-header">
              <div className="js-title-row">
                <TrendingUp size={20} className="red" />
                <h2>Daily Recommendations</h2>
              </div>
              <Link to="/search" className="js-view-all">View All</Link>
            </div>
            
            <div className="js-matches-stack">
              {loading ? <Spinner /> : (
                dailyMatches.length > 0 ? (
                  dailyMatches.slice(0, 5).map(p => (
                    <ProfileCard key={p.user_id} profile={p} onInterestSent={refresh} />
                  ))
                ) : (
                  <p className="js-empty-text">No recommendations yet. Try adjusting your preferences.</p>
                )
              )}
            </div>
          </section>

          <section className="js-dashboard-section">
            <div className="js-section-header">
              <div className="js-title-row">
                <UserPlus size={20} className="orange" />
                <h2>New Members</h2>
              </div>
              <Link to="/search" className="js-view-all">View All</Link>
            </div>
            
            <div className="js-matches-stack">
              {loading ? <Spinner /> : (
                newMatches.slice(0, 3).map(p => (
                  <ProfileCard key={p.user_id} profile={p} onInterestSent={refresh} />
                ))
              )}
            </div>
          </section>
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
          
          <div className="js-tip-card">
            <Bell size={20} color="#d97706" />
            <p><strong>Pro Tip:</strong> Profiles with at least 3 photos receive 5x more responses!</p>
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

        /* Shared Components Styles (same as MyMatchesPage) */
        .js-left-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .js-profile-brief {
          background: #fff; border-radius: 8px; padding: 20px;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-brief-avatar { margin-bottom: 12px; }
        .js-brief-info h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
        .js-brief-info p { font-size: 12px; color: #64748b; }
        .js-edit-link { color: #D63447; font-weight: 700; text-decoration: none; margin-left: 4px; }

        .js-side-nav {
          background: #fff; border-radius: 8px; overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-nav-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; text-decoration: none; color: #475569;
          font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }
        .js-nav-item:hover { background: #f8fafc; }
        .js-nav-item.active { color: #D63447; border-left: 3px solid #D63447; background: #fff1f2; }
        .js-nav-badge { background: #10b981; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
        .js-nav-arrow { color: #cbd5e1; font-size: 18px; }

        .js-verification-card {
          background: #fff; border-radius: 8px; padding: 20px;
          text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-shield-icon { color: #3b82f6; margin-bottom: 10px; }
        .js-verification-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
        .js-verification-card p { font-size: 12px; color: #64748b; margin-bottom: 15px; }
        .js-btn-verify {
          display: block; background: #3b82f6; color: #fff; text-decoration: none;
          padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 700;
        }

        /* Middle Content */
        .js-content-area { display: flex; flex-direction: column; gap: 25px; }
        .js-dashboard-section {
          background: #fff; border-radius: 12px; padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .js-title-row { display: flex; align-items: center; gap: 10px; }
        .js-title-row h2 { font-size: 18px; font-weight: 800; color: #1e293b; }
        .js-title-row .red { color: #ef4444; }
        .js-title-row .orange { color: #f59e0b; }
        .js-view-all { color: #D63447; font-weight: 700; font-size: 13px; text-decoration: none; }
        
        .js-matches-stack { display: flex; flex-direction: column; gap: 0; }
        .js-empty-text { color: #94a3b8; font-size: 14px; text-align: center; padding: 40px 0; }

        /* Right Sidebar */
        .js-right-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .js-premium-nudge {
          background: #fff; border-radius: 12px; padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-premium-nudge h3 { font-size: 15px; font-weight: 700; color: #1e293b; line-height: 1.4; margin-bottom: 20px; text-align: center; }
        .js-premium-nudge .red { color: #D63447; }
        .js-benefit-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px; }
        .js-benefit-item { display: flex; align-items: center; gap: 12px; }
        .js-benefit-icon {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
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

        .js-tip-card {
          background: #fffbeb; border-radius: 12px; padding: 20px;
          display: flex; gap: 12px; border: 1px solid #fde68a;
        }
        .js-tip-card p { font-size: 13px; color: #92400e; line-height: 1.5; }

        /* Refinements */
        .js-completion-wrapper { width: 100%; margin-top: 15px; }
        .js-completion-label { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 5px; }
        .js-completion-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .js-completion-fill { height: 100%; background: #10b981; border-radius: 3px; transition: width 0.5s ease; }

        .js-activity-stats {
          background: #fff; border-radius: 12px; padding: 20px;
          display: flex; justify-content: space-around; align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .js-stat-num { font-size: 24px; font-weight: 800; color: #1e293b; }
        .js-stat-label { font-size: 12px; color: #64748b; font-weight: 600; }
        .js-stat-divider { width: 1px; height: 30px; background: #f1f5f9; }

        .js-viewer-avatars { display: flex; gap: 20px; overflow-x: auto; padding: 10px 0; }
        .js-viewer-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; min-width: 60px; }
        .js-viewer-name { font-size: 11px; font-weight: 700; color: #475569; }
        .js-dashboard-section.viewer-section { padding-bottom: 10px; }
        .js-title-row .blue { color: #3b82f6; }

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
