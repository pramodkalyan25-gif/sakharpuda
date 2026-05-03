import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import ProfileCard from '../components/profile/ProfileCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { interestService } from '../services/interestService';
import { Users, Heart, ShieldCheck } from 'lucide-react';

export default function MyMatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      interestService.getMutualConnections(user.id)
        .then(setMatches)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  return (
    <div className="matches-page">
      <TopNav />
      
      <main className="container matches-main">
        <header className="matches-header">
          <div className="header-title">
            <Users className="header-icon" />
            <h1>My Matches</h1>
          </div>
          <p className="subtitle">These are the people you have connected with. You can now view each other's contact details.</p>
        </header>

        {loading ? (
          <div className="loading-center"><Spinner size="lg" /></div>
        ) : matches.length > 0 ? (
          <div className="matches-grid">
            {matches.map((item) => (
              <ProfileCard key={item.id} profile={item.profiles} />
            ))}
          </div>
        ) : (
          <div className="empty-matches">
            <div className="heart-circle">
              <Heart size={40} fill="#D63447" color="#D63447" />
            </div>
            <h2>No matches found yet</h2>
            <p>Don't worry! Keep interacting with profiles and your matches will appear here once they accept your interest.</p>
            <Button onClick={() => window.location.href = '/search'}>Explore More Profiles</Button>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .matches-page { min-height: 100vh; background: #f8fafc; }
        .matches-main { padding: 40px 20px; max-width: 1200px; margin: 0 auto; }
        
        .matches-header { margin-bottom: 40px; }
        .header-title { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .header-title h1 { font-size: 28px; font-weight: 800; color: #1e293b; }
        .header-icon { color: #D63447; width: 32px; height: 32px; }
        .subtitle { color: #64748b; font-size: 15px; max-width: 600px; }

        .loading-center { padding: 100px 0; text-align: center; }

        .matches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .empty-matches {
          padding: 100px 20px; text-align: center; background: #fff;
          border-radius: 24px; border: 1px dashed #cbd5e0; margin-top: 20px;
        }
        .heart-circle {
          width: 80px; height: 80px; background: #fff1f2; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
        }
        .empty-matches h2 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .empty-matches p { font-size: 14px; color: #64748b; margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto; }
      `}} />
    </div>
  );
}
