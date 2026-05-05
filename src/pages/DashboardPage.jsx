import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import Footer from '../components/ui/Footer';
import { useAuth } from '../hooks/useAuth';
import { useInterests } from '../hooks/useInterests';
import { searchService } from '../services/searchService';
import { photoService } from '../services/photoService';
import { profileService } from '../services/profileService';
import { formatDistanceToNow } from 'date-fns';
import Sidebar from '../components/ui/Sidebar';
import { SUB_COMMUNITIES } from './wizardData';
import RegistrationWizard from '../components/profile/RegistrationWizard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, logout, refreshProfile } = useAuth();
  const { received, remainingToday, refresh } = useInterests();
  const [searchParams] = useSearchParams();
  const showEditModal = searchParams.get('edit') === 'true';

  const [dailyMatches, setDailyMatches] = useState([]);
  const [newMatches, setNewMatches] = useState([]);
  const [communityMatches, setCommunityMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileViewers, setViewers] = useState([]);

  const loadData = useCallback(async () => {
    if (!user?.id || !profile) return;
    setLoading(true);
    try {
      const oppositeGender = (profile.gender || '').toLowerCase() === 'male' ? 'female' : 'male';
      
      const [newest, viewers, photo, recommendations, community] = await Promise.all([
        searchService.getNewMatches(user.id, oppositeGender, 8),
        profileService.getProfileViewers(user.id),
        photoService.getPrimaryPhoto(user.id),
        searchService.getRecommendedProfiles(user.id, profile),
        searchService.searchProfiles({
          gender: oppositeGender,
          religion: profile.religion,
          caste: profile.caste,
          limit: 8
        }, user.id)
      ]);
      
      setDailyMatches(recommendations?.profiles || []);
      setNewMatches(newest || []);
      setCommunityMatches(community?.profiles || []);
      setViewers(viewers || []);
      if (photo?.signed_url) {
        // We don't need setAvatarUrl here anymore as AuthContext handles it,
        // but we could refresh it if needed. For now, just leave it.
      }
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
        <Sidebar>
          <div className="js-verification-card">
            <Shield size={24} className="js-shield-icon" />
            <h4>Trust & Safety</h4>
            <p>Verified profiles receive 3x more interests.</p>
            <Link to="/verify" className="js-btn-verify">Get Verified</Link>
          </div>
        </Sidebar>

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

          {/* Community Matches Section */}
          <section className="js-dashboard-section community-section">
            <div className="js-section-header">
              <div className="js-title-row">
                <Users size={20} className="purple" />
                <h2>From Your Community: {profile.caste || profile.religion}</h2>
              </div>
              <Link to={`/search?caste=${profile.caste}`} className="js-view-all">View More</Link>
            </div>
            
            <div className="js-community-grid">
              {loading ? <Spinner /> : (
                communityMatches.length > 0 ? (
                  communityMatches.slice(0, 4).map(p => (
                    <div key={p.user_id} className="js-community-card" onClick={() => navigate(`/profile/${p.user_id}`)}>
                      <Avatar src={null} name={p.name} size="lg" />
                      <div className="js-comm-info">
                        <span className="js-comm-name">{p.name.split(' ')[0]}</span>
                        <span className="js-comm-detail">{p.city || 'Location N/A'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="js-empty-text">Invite more members from your community to join!</p>
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

          {/* Browse by Community Widget */}
          <div className="js-community-widget">
            <h3>Browse by Community</h3>
            <div className="js-comm-tags">
              {profile.religion && SUB_COMMUNITIES[profile.religion]?.slice(0, 8).map(c => (
                <Link 
                  key={c} 
                  to={`/search?caste=${c}`} 
                  className="js-comm-tag"
                >
                  {c}
                </Link>
              ))}
              <Link to="/search" className="js-comm-tag more">View All Communities</Link>
            </div>
          </div>
        </aside>
      </main>

      {showEditModal && (
        <RegistrationWizard 
          isEditMode={true} 
          initialStep={parseInt(searchParams.get('step')) || 1}
          onClose={() => navigate('/dashboard')} 
        />
      )}

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .js-dashboard-wrapper, .my-matches-page, .search-page, .inbox-page {
          min-height: 100vh;
          background: #f1f2f5;
          padding-bottom: 50px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .js-main-grid {
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          gap: 20px;
          margin-top: 20px;
          align-items: flex-start;
        }

        /* Verification Card (Still unique to sidebar) */
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

        /* Community Section Styles */
        .js-community-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 15px;
          margin-top: 10px;
        }
        .js-community-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .js-community-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
          background: #fff;
        }
        .js-comm-info { text-align: center; }
        .js-comm-name { display: block; font-size: 14px; font-weight: 700; color: #1e293b; }
        .js-comm-detail { display: block; font-size: 11px; color: #64748b; margin-top: 2px; }
        .purple { color: #9333ea; }

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

        .js-community-widget {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-community-widget h3 {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 15px;
        }
        .js-comm-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .js-comm-tag {
          font-size: 12px;
          background: #f1f5f9;
          color: #475569;
          padding: 6px 12px;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }
        .js-comm-tag:hover {
          background: #e2e8f0;
          color: #D63447;
        }
        .js-comm-tag.more {
          background: transparent;
          color: #D63447;
          border: 1px dashed #D63447;
        }
        .js-comm-tag.more:hover {
          background: #fff5f5;
        }

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
