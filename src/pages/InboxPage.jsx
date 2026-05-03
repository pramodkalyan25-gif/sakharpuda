import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useInterests } from '../hooks/useInterests';
import TopNav from '../components/ui/TopNav';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { interestService } from '../services/interestService';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, Check, X, Clock, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function InboxPage() {
  const { user, profile } = useAuth();
  const { received, refresh } = useInterests();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending'); // pending | accepted | rejected

  const filteredInterests = received.filter(i => i.status === filter);

  const handleAction = async (id, action) => {
    setLoading(true);
    try {
      if (action === 'accept') {
        await interestService.acceptInterest(id);
        toast.success('Interest accepted!');
      } else {
        await interestService.rejectInterest(id);
        toast('Interest declined', { icon: '👋' });
      }
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inbox-page">
      <TopNav />
      
      <main className="container inbox-main">
        <header className="inbox-header">
          <div className="header-title">
            <MessageSquare className="header-icon" />
            <h1>Messages & Interests</h1>
          </div>
          <div className="inbox-tabs">
            <button className={`tab-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
              Pending {received.filter(i => i.status === 'pending').length > 0 && <span className="count-badge">{received.filter(i => i.status === 'pending').length}</span>}
            </button>
            <button className={`tab-btn ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}>
              Accepted
            </button>
            <button className={`tab-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
              Declined
            </button>
          </div>
        </header>

        <div className="inbox-content">
          {filteredInterests.length > 0 ? (
            <div className="interest-list">
              {filteredInterests.map((item) => (
                <div key={item.id} className="interest-item-card animate-fade-in">
                  <div className="interest-user-info">
                    <Avatar src={null} name={item.profiles?.name} size="lg" verified={item.profiles?.admin_verified} />
                    <div className="user-meta">
                      <h3>{item.profiles?.name || 'Anonymous User'}</h3>
                      <p>{item.profiles?.city} • {item.profiles?.caste}</p>
                      <span className="time-ago"><Clock size={12} /> {formatDistanceToNow(new Date(item.created_at))} ago</span>
                    </div>
                  </div>
                  
                  <div className="interest-actions">
                    {filter === 'pending' && (
                      <>
                        <button className="btn-accept" onClick={() => handleAction(item.id, 'accept')} disabled={loading}>
                          <Check size={18} /> Accept
                        </button>
                        <button className="btn-decline" onClick={() => handleAction(item.id, 'reject')} disabled={loading}>
                          <X size={18} /> Decline
                        </button>
                      </>
                    )}
                    {filter === 'accepted' && (
                      <div className="accepted-status">
                        <CheckCircleIcon />
                        <span>Connected! You can now view contact details.</span>
                        <Button size="sm" variant="outline" onClick={() => toast.success('Contact details shared!')}>View Contact</Button>
                      </div>
                    )}
                    {filter === 'rejected' && <span className="status-label declined">Declined</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="inbox-empty">
              <div className="empty-icon-wrap">
                <Heart size={48} className="empty-icon" />
              </div>
              <h2>No {filter} interests yet</h2>
              <p>Keep your profile updated to attract more attention!</p>
              <Button onClick={() => window.location.href = '/search'}>Find More Matches</Button>
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .inbox-page { min-height: 100vh; background: #f8fafc; }
        .inbox-main { padding: 40px 20px; max-width: 900px; margin: 0 auto; }
        
        .inbox-header { margin-bottom: 30px; }
        .header-title { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .header-title h1 { font-size: 28px; font-weight: 800; color: #1e293b; }
        .header-icon { color: #D63447; width: 32px; height: 32px; }

        .inbox-tabs { display: flex; gap: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 1px; }
        .tab-btn {
          padding: 12px 24px; font-weight: 700; font-size: 14px; color: #64748b;
          border: none; background: none; cursor: pointer; position: relative;
          transition: 0.2s;
        }
        .tab-btn:hover { color: #1e293b; }
        .tab-btn.active { color: #D63447; }
        .tab-btn.active::after {
          content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
          height: 3px; background: #D63447; border-radius: 3px 3px 0 0;
        }
        .count-badge {
          background: #D63447; color: #fff; font-size: 10px;
          padding: 2px 6px; border-radius: 10px; margin-left: 6px;
        }

        .interest-list { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
        .interest-item-card {
          background: #fff; border-radius: 16px; padding: 20px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #edf2f7;
          transition: 0.2s;
        }
        .interest-item-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.05); }

        .interest-user-info { display: flex; gap: 16px; align-items: center; }
        .user-meta h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 2px; }
        .user-meta p { font-size: 13px; color: #64748b; margin-bottom: 6px; }
        .time-ago { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #94a3b8; }

        .interest-actions { display: flex; gap: 10px; align-items: center; }
        .btn-accept {
          background: #D63447; color: #fff; border: none; padding: 10px 20px;
          border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;
        }
        .btn-decline {
          background: #f1f5f9; color: #64748b; border: none; padding: 10px 20px;
          border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;
        }
        .btn-accept:hover { background: #a52837; }
        .btn-decline:hover { background: #e2e8f0; color: #1e293b; }

        .accepted-status { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #059669; font-weight: 600; }
        .status-label.declined { background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }

        .inbox-empty {
          padding: 80px 20px; text-align: center; background: #fff;
          border-radius: 24px; border: 1px dashed #cbd5e0; margin-top: 40px;
        }
        .empty-icon-wrap {
          width: 80px; height: 80px; background: #fff1f2; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
        }
        .empty-icon { color: #D63447; }
        .inbox-empty h2 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .inbox-empty p { font-size: 14px; color: #64748b; margin-bottom: 24px; }

        @media (max-width: 600px) {
          .interest-item-card { flex-direction: column; align-items: flex-start; gap: 20px; }
          .interest-actions { width: 100%; justify-content: space-between; }
          .btn-accept, .btn-decline { flex: 1; justify-content: center; }
        }
      `}} />
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#059669' }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
