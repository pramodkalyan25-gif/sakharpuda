import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  Share2,
  Sparkles,
  Download,
  FileText,
  X as CloseIcon
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import ProfileCard from '../components/profile/ProfileCard';
import GunMilanModal from '../components/profile/GunMilanModal';
import BirthDetailsModal from '../components/profile/BirthDetailsModal';
import MyPatrikaModal from '../components/profile/MyPatrikaModal';
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
import { buildPatrika, NAKSHATRAS, RASHIS, LABELS } from '../services/gunMilanService';
import { calculateFullKundali, VEDIC_PLANETS } from '../services/kundaliService';
import KundaliChart from '../components/profile/KundaliChart';

// ─────────────────────────────────────────────────────────────
// BIRTH DETAILS POPUP MODAL
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// MY PATRIKA MODAL (Full Kundali Chart)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────
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

  // Patrika modals
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [showPatrikaModal, setShowPatrikaModal] = useState(false);
  const [selectedMatchProfile, setSelectedMatchProfile] = useState(null);

  const hasBirthDetails = !!(profile?.time_of_birth && profile?.place_of_birth);

  const handleGeneratePatrika = () => {
    if (hasBirthDetails) {
      setShowPatrikaModal(true);
    } else {
      setShowBirthModal(true);
    }
  };

  const handleBirthDetailsSave = async (details) => {
    await profileService.updateProfile(user.id, details);
    await refreshProfile();
    setShowBirthModal(false);
    // After saving, open the Patrika modal
    setShowPatrikaModal(true);
  };

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
        // AuthContext handles avatarUrl
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
        <Sidebar />

        {/* MIDDLE CONTENT */}
        <div className="js-content-area">

          {/* ── GENERATE BIODATA & PATRIKA CTA CARDS ── */}
          <div className="dashboard-cta-container">
            {/* Generate Bio-Data CTA Card */}
            <div className="patrika-cta-card biodata-cta" onClick={() => navigate(`/profile/${profile.user_id}?biodata=true`)}>
              <div className="patrika-cta-left">
                <div className="patrika-cta-icon-wrapper">
                  <FileText size={24} className="patrika-icon-svg" />
                </div>
                <div className="patrika-cta-text">
                  <h3>Generate Your Bio-Data</h3>
                  <p>Create & download your premium marriage bio-data</p>
                </div>
              </div>
              <div className="patrika-cta-right">
                <ChevronRight size={20} />
              </div>
            </div>

            {/* Generate Your Janma Patrika CTA Card */}
            <div className="patrika-cta-card patrika-cta" onClick={handleGeneratePatrika}>
              <div className="patrika-cta-left">
                <div className="patrika-cta-icon-wrapper">
                  <Sparkles size={24} className="patrika-icon-svg" />
                </div>
                <div className="patrika-cta-text">
                  <h3>Generate Your Janma Patrika</h3>
                  <div className="patrika-cta-status-row">
                    {!hasBirthDetails ? (
                      <span className="patrika-cta-warning-highlighted">
                        <AlertCircle size={12} /> ⚠️ Missing Birth Details
                      </span>
                    ) : (
                      <span className="patrika-cta-ready">
                        <CheckCircle size={12} /> Ready
                      </span>
                    )}
                  </div>
                  <p>Enter birth time and place for getting 5x response</p>
                </div>
              </div>
              <div className="patrika-cta-right">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>

          <section className="js-dashboard-section">
            <div className="js-section-header">
              <div className="js-title-row" style={{ cursor: 'default' }}>
                <TrendingUp size={20} className="red" />
                <h2>Daily Matches</h2>
              </div>
            </div>

            <div className="js-matches-stack">
              {loading ? <Spinner /> : (
                [...dailyMatches, ...newMatches].length > 0 ? (
                  [...dailyMatches, ...newMatches].slice(0, 10).map((p, index) => (
                    <ProfileCard 
                      key={p.user_id + '-' + index} 
                      profile={p} 
                      onInterestSent={refresh} 
                      onMatchPatrika={(cand) => setSelectedMatchProfile(cand)} 
                    />
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

      {/* BIRTH DETAILS POPUP */}
      {showBirthModal && (
        <BirthDetailsModal
          profile={profile}
          onSave={handleBirthDetailsSave}
          onClose={() => setShowBirthModal(false)}
        />
      )}

      {/* MY PATRIKA MODAL */}
      {showPatrikaModal && (
        <MyPatrikaModal
          profile={profile}
          onClose={() => setShowPatrikaModal(false)}
        />
      )}

      {/* KUNDALI MATCHING MODAL */}
      {selectedMatchProfile && (
        <GunMilanModal
          profile={selectedMatchProfile}
          myProfile={profile}
          defaultTab="milan"
          onClose={() => setSelectedMatchProfile(null)}
        />
      )}

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

        /* ── GENERATE PATRIKA & BIODATA CTA CARDS ── */
        .dashboard-cta-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
          position: sticky;
          top: 70px;
          z-index: 850;
          background: #f1f2f5;
          padding: 8px 0;
        }
        @media (max-width: 768px) {
          .dashboard-cta-container {
            top: 60px;
            gap: 8px;
          }
        }
        .patrika-icon-svg {
          display: block;
        }
        .patrika-cta-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 16px;
          padding: 16px 20px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .patrika-cta-card.biodata-cta {
          background: linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%);
          border: 1px solid rgba(225, 29, 72, 0.3);
        }
        .patrika-cta-card.biodata-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(225, 29, 72, 0.25);
          border-color: rgba(225, 29, 72, 0.5);
        }
        .patrika-cta-card.patrika-cta {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .patrika-cta-card.patrika-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(79, 70, 229, 0.25);
          border-color: rgba(139, 92, 246, 0.5);
        }
        .patrika-cta-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }
        .patrika-cta-text {
          min-width: 0;
        }
        .patrika-cta-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .patrika-cta-text h3 {
          font-size: 15px;
          font-weight: 800;
          color: #fff;
          margin: 0;
          line-height: 1.2;
          white-space: normal;
        }
        .patrika-cta-status-row {
          margin-top: 4px;
          display: flex;
        }
        .patrika-cta-text p {
          font-size: 11px;
          color: rgba(255,255,255,0.75);
          margin: 0;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .patrika-cta-card:hover .patrika-cta-text p {
          max-height: 40px;
          opacity: 1;
          margin-top: 4px;
        }
        .patrika-cta-right {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.5);
        }
        .patrika-cta-warning {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #fbbf24;
          background: rgba(251, 191, 36, 0.15);
          padding: 4px 10px;
          border-radius: 20px;
          animation: pulseBadge 2s infinite;
        }
        @keyframes pulseBadge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .patrika-cta-warning-highlighted {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          background: #dc2626; /* Warning red */
          padding: 5px 12px;
          border-radius: 20px;
          box-shadow: 0 0 12px rgba(220, 38, 38, 0.5);
          animation: criticalPulse 1.5s infinite;
        }
        @keyframes criticalPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(220, 38, 38, 0.5); }
          50% { transform: scale(1.04); box-shadow: 0 0 20px rgba(220, 38, 38, 0.9); }
        }
        .patrika-cta-warning-desc {
          display: block !important;
          max-height: 80px !important;
          opacity: 1 !important;
          margin-top: 6px !important;
          color: #fecdd3 !important; /* Soft rose pink text for contrast */
          font-weight: 700 !important;
          line-height: 1.4 !important;
        }
        .patrika-cta-ready {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #34d399;
          background: rgba(52, 211, 153, 0.15);
          padding: 4px 10px;
          border-radius: 20px;
        }
        
        /* Mobile responsive refinements to fit in one line */
        @media (max-width: 580px) {
          .patrika-cta-card {
            padding: 8px 10px;
            border-radius: 12px;
          }
          .patrika-cta-left {
            gap: 8px;
          }
          .patrika-cta-icon-wrapper {
            width: 32px;
            height: 32px;
            border-radius: 8px;
          }
          .patrika-cta-icon-wrapper svg {
            width: 18px;
            height: 18px;
          }
          .patrika-cta-text h3 {
            font-size: 11px;
          }
          .patrika-cta-right {
            gap: 4px;
          }
          .patrika-cta-right svg {
            width: 16px;
            height: 16px;
          }
          .patrika-cta-warning, .patrika-cta-ready, .patrika-cta-warning-highlighted {
            font-size: 8px;
            padding: 2px 4px;
            gap: 2px;
          }
          .patrika-cta-warning svg, .patrika-cta-ready svg, .patrika-cta-warning-highlighted svg {
            width: 10px;
            height: 10px;
          }
        }

        /* ── BIRTH DETAILS MODAL ── */
        .bd-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(6px);
        }
        .bd-modal {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          padding: 28px;
          position: relative;
          box-shadow: 0 30px 80px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .bd-close {
          position: absolute;
          top: 16px; right: 16px;
          background: #f1f5f9;
          border: none;
          border-radius: 50%;
          padding: 6px;
          cursor: pointer;
          color: #64748b;
          display: flex;
        }
        .bd-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .bd-header h3 {
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
          margin: 10px 0 6px;
        }
        .bd-header p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
        .bd-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .bd-field label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 6px;
        }
        .bd-field input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          transition: border-color 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .bd-field input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }
        .bd-hint {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
          display: block;
        }
        .bd-save-btn {
          padding: 14px;
          border-radius: 12px;
          border: none;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .bd-save-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #6d28d9, #4338ca);
          transform: translateY(-1px);
        }
        .bd-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}} />
      <Footer />
    </div>
  );
}
