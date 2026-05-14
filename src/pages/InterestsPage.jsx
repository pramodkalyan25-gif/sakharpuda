import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { interestService } from '../services/interestService';
import { formatDistanceToNow } from 'date-fns';
import { Star, Clock, CheckCircle2, XCircle, CheckCircle, Users, Lock } from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import RightSidebar from '../components/ui/RightSidebar';
import Footer from '../components/ui/Footer';

export default function InterestsPage() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState('received'); // 'received', 'accepted', 'sent'
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInterests = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      let data = [];
      if (tab === 'received') {
        data = await interestService.getReceivedInterests(user.id);
      } else if (tab === 'accepted') {
        data = await interestService.getMutualConnections(user.id);
      } else {
        data = await interestService.getSentInterests(user.id);
      }
      setInterests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, tab]);

  useEffect(() => {
    loadInterests();
  }, [loadInterests]);

  const handleAccept = async (interestId) => {
    try {
      await interestService.acceptInterest(interestId);
      toast.success('Interest accepted!');
      loadInterests();
    } catch (err) {
      toast.error('Failed to accept interest.');
    }
  };

  const handleReject = async (interestId) => {
    try {
      await interestService.rejectInterest(interestId);
      toast.success('Interest declined.');
      loadInterests();
    } catch (err) {
      toast.error('Failed to decline interest.');
    }
  };

  return (
    <div className="js-dashboard-wrapper interests-page">
      <TopNav />

      <main className="js-layout-container js-main-grid">
        <Sidebar>
          <div className="js-community-trust-wrapper">
            <span className="js-trust-label">COMMUNITY & TRUST</span>
            <div className="js-trust-cards-stack">
              <div className="js-trust-card">
                <div className="js-trust-icon green"><CheckCircle size={22} /></div>
                <h5>Verified profiles</h5>
                <p>We verify phone & email of every member</p>
              </div>
              <div className="js-trust-card">
                <div className="js-trust-icon purple"><Users size={22} /></div>
                <h5>Community first</h5>
                <p>Premium matchmaking for serious match-seekers</p>
              </div>
              <div className="js-trust-card">
                <div className="js-trust-icon orange"><Lock size={22} /></div>
                <h5>Privacy protected</h5>
                <p>Contact details hidden until you connect</p>
              </div>
            </div>
          </div>
        </Sidebar>

        <div className="js-content-area">
          <section className="js-dashboard-section">
            <header className="interests-header">
              <div className="header-title">
                <Star className="header-icon" />
                <h1>Interests</h1>
              </div>
              
              <div className="js-tab-switcher">
                <button 
                  className={`js-tab-btn ${tab === 'received' ? 'active' : ''}`}
                  onClick={() => setTab('received')}
                >
                  Pending ({interests.filter(i => i.status === 'pending').length})
                </button>
                <button 
                  className={`js-tab-btn ${tab === 'accepted' ? 'active' : ''}`}
                  onClick={() => setTab('accepted')}
                >
                  Accepted
                </button>
                <button 
                  className={`js-tab-btn ${tab === 'sent' ? 'active' : ''}`}
                  onClick={() => setTab('sent')}
                >
                  Sent
                </button>
              </div>
            </header>

            {loading ? (
              <div className="loading-center"><Spinner size="lg" /></div>
            ) : interests.length > 0 ? (
              <div className="sent-list">
                {interests
                  .filter(item => {
                    if (tab === 'received') return item.status === 'pending';
                    return true; // Show all for 'accepted' and 'sent' (already filtered by service)
                  })
                  .map((item) => (
                    <div key={item.id} className="sent-item-card">
                    <div className="sent-user-info">
                      <Avatar src={null} name={item.profiles?.name} size="lg" />
                      <div className="user-meta">
                        <h3>{item.profiles?.name}</h3>
                        <p>{item.profiles?.city} • {item.profiles?.caste}</p>
                        <span className="time-ago">
                          <Clock size={12} /> {tab === 'received' ? 'Received' : 'Updated'} {formatDistanceToNow(new Date(item.created_at))} ago
                        </span>
                      </div>
                    </div>

                    <div className="sent-status">
                      {tab === 'received' && item.status === 'pending' && (
                        <div className="js-action-group">
                          <Button size="sm" variant="primary" onClick={() => handleAccept(item.id)}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(item.id)}>Decline</Button>
                        </div>
                      )}
                      {tab === 'accepted' && (
                        <div className="status-pill accepted">
                          <CheckCircle2 size={14} /> <span>Mutual Match</span>
                        </div>
                      )}
                      {tab === 'sent' && (
                        <div className={`status-pill ${item.status || 'pending'}`}>
                          {(item.status === 'pending' || !item.status) ? <Clock size={14} /> : item.status === 'accepted' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          <span>{(item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {tab === 'received' && interests.filter(i => i.status === 'pending').length === 0 && (
                  <div className="empty-state-card">
                    <div className="empty-icon-box"><Star size={40} /></div>
                    <h2>No pending interests</h2>
                    <p>When someone expresses interest in your profile, it will appear here.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state-card">
                <div className="empty-icon-box"><Star size={40} /></div>
                <h2>No {tab} interests</h2>
                <p>Start searching and express interest in profiles that match your preferences.</p>
                <Button onClick={() => window.location.href = '/search'}>Explore Profiles</Button>
              </div>
            )}
          </section>
        </div>

        <RightSidebar profile={profile} />
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .interests-page { min-height: 100vh; background: #f8fafc; }
        .interests-header { margin-bottom: 20px; }
        .header-title { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .header-title h1 { font-size: 22px; font-weight: 800; color: #1e293b; }
        .header-icon { color: #C9956C; width: 28px; height: 28px; }
        
        .js-tab-switcher {
          display: flex; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;
        }
        .js-tab-btn {
          padding: 10px 16px; border: none; background: none; font-size: 14px;
          font-weight: 600; color: #64748b; cursor: pointer; position: relative;
          transition: all 0.2s;
        }
        .js-tab-btn:hover { color: #1e293b; }
        .js-tab-btn.active { color: #D63447; }
        .js-tab-btn.active::after {
          content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
          height: 2px; background: #D63447;
        }

        .sent-list { display: flex; flex-direction: column; gap: 12px; }
        .sent-item-card {
          background: #fff; border-radius: 14px; padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #edf2f7;
        }
        @media (min-width: 480px) {
          .sent-item-card { flex-direction: row; justify-content: space-between; align-items: center; gap: 0; }
        }
        .sent-user-info { display: flex; gap: 14px; align-items: center; }
        .user-meta h3 { font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 2px; }
        .js-action-group { display: flex; gap: 8px; }
        .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .status-pill.accepted { background: #dcfce7; color: #15803d; }
        .status-pill.pending { background: #fef3c7; color: #d97706; }
        .status-pill.rejected { background: #fee2e2; color: #dc2626; }
        .empty-state-card { padding: 60px 20px; text-align: center; background: #fff; border-radius: 20px; border: 1px dashed #cbd5e0; margin-top: 20px; }
        .empty-icon-box { width: 70px; height: 70px; background: #fffbeb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #C9956C; }
      `}} />
      <Footer />
    </div>
  );
}
