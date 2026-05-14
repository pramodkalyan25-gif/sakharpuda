import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp } from 'lucide-react';
import ProfileCard from '../components/profile/ProfileCard';
import TopNav from '../components/ui/TopNav';
import Footer from '../components/ui/Footer';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/ui/Sidebar';
import RightSidebar from '../components/ui/RightSidebar';
import Spinner from '../components/ui/Spinner';
import { shortlistService } from '../services/shortlistService';

export default function ShortlistedPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [shortlisted, setShortlisted] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadShortlisted = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await shortlistService.getShortlistedProfiles(user.id);
      setShortlisted(data);
    } catch (err) {
      console.error('Error loading shortlists:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadShortlisted();
  }, [loadShortlisted]);

  if (!profile) {
    return (
      <div className="js-loader">
        <Spinner size="lg" />
        <p>Loading your shortlisted profiles...</p>
      </div>
    );
  }

  return (
    <div className="js-dashboard-wrapper shortlisted-page">
      <TopNav />

      <main className="js-main-grid js-layout-container">
        <Sidebar />

        <div className="js-content-area">
          <section className="js-dashboard-section">
            <div className="js-section-header">
              <div className="js-title-row">
                <Star size={20} className="red" fill="#D63447" />
                <h2>Shortlisted Profiles</h2>
              </div>
              <span className="js-count-badge">{shortlisted.length} Profiles</span>
            </div>

            <div className="js-matches-stack">
              {loading ? (
                <div className="loading-center"><Spinner size="lg" /></div>
              ) : shortlisted.length > 0 ? (
                shortlisted.map((p) => (
                  <ProfileCard 
                    key={p.user_id} 
                    profile={p} 
                    onInterestSent={() => {}} 
                    onShortlistToggle={(isNowShortlisted) => {
                      if (!isNowShortlisted) {
                        setShortlisted(prev => prev.filter(item => item.user_id !== p.user_id));
                      }
                    }}
                  />
                ))
              ) : (
                <div className="js-empty-state">
                  <div className="js-empty-icon-box">
                    <Star size={40} color="#cbd5e1" />
                  </div>
                  <h3>No Shortlisted Profiles</h3>
                  <p>You haven't shortlisted anyone yet. Start exploring profiles to save your favorites!</p>
                  <button className="js-discover-btn" onClick={() => navigate('/dashboard')}>Discover Matches</button>
                </div>
              )}
            </div>
          </section>
        </div>

        <RightSidebar profile={profile} />
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .js-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .js-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .js-title-row h2 {
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .js-count-badge {
          background: #f1f5f9;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .js-matches-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .js-empty-state {
          padding: 60px 20px;
          text-align: center;
          background: #fff;
          border-radius: 20px;
          border: 1px dashed #cbd5e0;
        }
        .js-empty-icon-box {
          margin-bottom: 16px;
          color: #cbd5e1;
        }
        .js-empty-state h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .js-empty-state p {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 24px;
        }
        .js-discover-btn {
          background: #D63447;
          color: #fff;
          border: none;
          padding: 12px 30px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .red { color: #D63447; }
        .loading-center { padding: 80px 0; text-align: center; }
      `}} />
      <Footer />
    </div>
  );
}
