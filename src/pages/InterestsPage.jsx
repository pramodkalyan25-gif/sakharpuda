import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useInterests } from '../hooks/useInterests';
import TopNav from '../components/ui/TopNav';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { interestService } from '../services/interestService';
import { formatDistanceToNow } from 'date-fns';
import { Star, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function InterestsPage() {
  const { user } = useAuth();
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      interestService.getSentInterests(user.id)
        .then(setSent)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  return (
    <div className="interests-page">
      <TopNav />
      
      <main className="container interests-main">
        <header className="interests-header">
          <div className="header-title">
            <Star className="header-icon" />
            <h1>Sent Interests</h1>
          </div>
          <p className="subtitle">Track the status of interests you've sent to other members.</p>
        </header>

        {loading ? (
          <div className="loading-center"><Spinner size="lg" /></div>
        ) : sent.length > 0 ? (
          <div className="sent-list">
            {sent.map((item) => (
              <div key={item.id} className="sent-item-card">
                <div className="sent-user-info">
                  <Avatar src={null} name={item.profiles?.name} size="lg" />
                  <div className="user-meta">
                    <h3>{item.profiles?.name}</h3>
                    <p>{item.profiles?.city} • {item.profiles?.caste}</p>
                    <span className="time-ago"><Clock size={12} /> Sent {formatDistanceToNow(new Date(item.created_at))} ago</span>
                  </div>
                </div>
                
                <div className="sent-status">
                  {item.status === 'pending' && (
                    <div className="status-pill pending">
                      <Clock size={14} /> <span>Awaiting Response</span>
                    </div>
                  )}
                  {item.status === 'accepted' && (
                    <div className="status-pill accepted">
                      <CheckCircle2 size={14} /> <span>Accepted</span>
                    </div>
                  )}
                  {item.status === 'rejected' && (
                    <div className="status-pill rejected">
                      <XCircle size={14} /> <span>Declined</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <div className="empty-icon-box">
              <Star size={40} />
            </div>
            <h2>You haven't sent any interests yet</h2>
            <p>Start searching and express interest in profiles that match your preferences.</p>
            <Button onClick={() => window.location.href = '/search'}>Explore Profiles</Button>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .interests-page { min-height: 100vh; background: #f8fafc; }
        .interests-main { padding: 40px 20px; max-width: 900px; margin: 0 auto; }
        
        .interests-header { margin-bottom: 30px; }
        .header-title { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .header-title h1 { font-size: 28px; font-weight: 800; color: #1e293b; }
        .header-icon { color: #C9956C; width: 32px; height: 32px; }
        .subtitle { color: #64748b; font-size: 15px; }

        .loading-center { padding: 100px 0; text-align: center; }

        .sent-list { display: flex; flex-direction: column; gap: 16px; }
        .sent-item-card {
          background: #fff; border-radius: 16px; padding: 20px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #edf2f7;
        }

        .sent-user-info { display: flex; gap: 16px; align-items: center; }
        .user-meta h3 { font-size: 17px; font-weight: 800; color: #1e293b; margin-bottom: 2px; }
        .user-meta p { font-size: 13px; color: #64748b; margin-bottom: 6px; }
        .time-ago { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #94a3b8; }

        .status-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;
        }
        .status-pill.pending { background: #fef3c7; color: #d97706; }
        .status-pill.accepted { background: #dcfce7; color: #15803d; }
        .status-pill.rejected { background: #fee2e2; color: #dc2626; }

        .empty-state-card {
          padding: 80px 20px; text-align: center; background: #fff;
          border-radius: 24px; border: 1px dashed #cbd5e0; margin-top: 20px;
        }
        .empty-icon-box {
          width: 80px; height: 80px; background: #fffbeb; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
          color: #C9956C;
        }
        .empty-state-card h2 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .empty-state-card p { font-size: 14px; color: #64748b; margin-bottom: 24px; }
      `}} />
    </div>
  );
}
