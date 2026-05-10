import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import ProfileCard from '../components/profile/ProfileCard';
import Spinner from '../components/ui/Spinner';
import { searchService } from '../services/searchService';
import { Users, CheckCircle, Lock } from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import RightSidebar from '../components/ui/RightSidebar';

export default function MyMatchesPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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
                    <ProfileCard key={p.user_id} profile={p} />
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
      `}} />
    </div>
  );
}
