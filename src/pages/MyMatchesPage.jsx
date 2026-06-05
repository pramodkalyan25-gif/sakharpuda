import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import ProfileCard from '../components/profile/ProfileCard';
import Spinner from '../components/ui/Spinner';
import { searchService } from '../services/searchService';
import { 
  Users, 
  CheckCircle, 
  Lock, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import RightSidebar from '../components/ui/RightSidebar';
import BirthDetailsModal from '../components/profile/BirthDetailsModal';
import MyPatrikaModal from '../components/profile/MyPatrikaModal';
import GunMilanModal from '../components/profile/GunMilanModal';
import { profileService } from '../services/profileService';

export default function MyMatchesPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setShowPatrikaModal(true);
  };

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        // Fetch all registered profiles without any filters
        const result = await searchService.searchProfiles({
          limit: 20
        }, user?.id);

        setMatches(result.profiles);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMatches();
    }
  }, [user?.id, profile?.gender]);


  return (
    <div className="js-dashboard-wrapper my-matches-page">
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

          {/* ── GENERATE BIODATA & PATRIKA CTA CARDS ── */}
          <div className="dashboard-cta-container">
            {/* Generate Bio-Data CTA Card */}
            <div className="patrika-cta-card biodata-cta" onClick={() => navigate(`/profile/${profile?.user_id}?biodata=true`)}>
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

          {loading ? (
            <div className="js-loader"><Spinner size="lg" /></div>
          ) : (
            <section className="js-dashboard-section">
              <div className="js-section-header">
                <div className="js-title-row">
                  <Users size={20} className="red" />
                  <h2>All Matches</h2>
                </div>
              </div>
              <div className="js-matches-list">
                {matches.length > 0 ? (
                  matches.map((p) => (
                    <ProfileCard 
                      key={p.user_id} 
                      profile={p} 
                      onMatchPatrika={(cand) => setSelectedMatchProfile(cand)} 
                    />
                  ))
                ) : (
                  <div className="js-empty-state">
                    <Users size={48} color="#cbd5e1" />
                    <h3>No matches found yet</h3>
                    <p>Keep exploring and sending interests to find your perfect match.</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <RightSidebar profile={profile} />
      </main>

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
        .js-matches-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .js-loader { padding: 100px 0; text-align: center; }
        .js-empty-state {
          background: #fff; border-radius: 12px; padding: 60px;
          text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px;
        }
        .js-empty-state h3 { font-size: 20px; font-weight: 800; color: #1e293b; }
        .js-empty-state p { color: #64748b; font-size: 14px; max-width: 300px; }
        
        .red { color: #D63447; }
        .js-section-header { margin-bottom: 20px; }
        .js-title-row { display: flex; align-items: center; gap: 10px; }
        .js-title-row h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; }

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
          white-space: nowrap;
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
        .patrika-cta-warning-highlighted {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          background: #dc2626;
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
          color: #fecdd3 !important;
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
          .patrika-cta-warning-highlighted, .patrika-cta-ready {
            font-size: 8px;
            padding: 2px 4px;
            gap: 2px;
          }
          .patrika-cta-warning-highlighted svg, .patrika-cta-ready svg {
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
    </div>
  );
}
