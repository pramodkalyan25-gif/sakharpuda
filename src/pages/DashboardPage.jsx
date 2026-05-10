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
  Search as SearchIcon,
  Copy,
  Share2
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
import RightSidebar from '../components/ui/RightSidebar';
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
    <div className="js-dashboard-wrapper dashboard-page">
      <TopNav />

      <main className="js-main-grid js-layout-container">
        {/* LEFT SIDEBAR */}
        <Sidebar>
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
            </div>
          </div>
        </Sidebar>

        {/* MIDDLE CONTENT */}
        <div className="js-content-area">
          <section className="js-dashboard-section">
            <div className="js-section-header">
              <div className="js-title-row">
                <TrendingUp size={20} className="red" />
                <h2>Recommended Profiles</h2>
              </div>
            </div>

            <div className="js-matches-stack">
              {loading ? <Spinner /> : (
                [...dailyMatches, ...newMatches].length > 0 ? (
                  [...dailyMatches, ...newMatches].slice(0, 10).map((p, index) => (
                    <ProfileCard key={p.user_id + '-' + index} profile={p} onInterestSent={refresh} />
                  ))
                ) : (
                  <p className="js-empty-text">No recommendations available at the moment.</p>
                )
              )}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <RightSidebar profile={profile} />
      </main>

      {showEditModal && (
        <RegistrationWizard
          isEditMode={true}
          initialStep={parseInt(searchParams.get('step')) || 1}
          onClose={() => navigate('/dashboard')}
        />
      )}

      <Footer />

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Section Headers */
        .js-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .js-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .js-title-row h2 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .js-view-all {
          font-size: 13px;
          font-weight: 700;
          color: #D63447;
          text-decoration: none;
        }

        /* Match Stacks */
        .js-matches-stack {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .js-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 15px;
        }
        .js-empty-text {
          text-align: center;
          padding: 40px;
          color: #64748b;
          font-size: 14px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
        }
        
        /* Icon colors */
        .red { color: #D63447; }
        .blue { color: #3b82f6; }
        .purple { color: #8b5cf6; }
        .orange { color: #f59e0b; }
      `}} />
      <Footer />
    </div>
  );
}
