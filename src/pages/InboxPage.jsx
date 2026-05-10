import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useInterests } from '../hooks/useInterests';
import TopNav from '../components/ui/TopNav';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import { interestService } from '../services/interestService';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Heart,
  Check,
  X,
  Clock,
  Users,
  CheckCircle,
  Lock
} from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import { toast } from 'react-hot-toast';
import RightSidebar from '../components/ui/RightSidebar';
import Footer from '../components/ui/Footer';

export default function InboxPage() {
  const navigate = useNavigate();
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
    <div className="js-dashboard-wrapper inbox-page">
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

        {/* MIDDLE CONTENT: MESSENGER */}
        <div className="js-content-area">
          <div className="js-inbox-card">
            <header className="js-inbox-header">
              <div className="js-inbox-title">
                <MessageSquare className="js-icon-red" size={20} />
                <h2>Interests & Messages</h2>
              </div>
              <div className="js-inbox-tabs">
                <button className={`js-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                  Pending {received.filter(i => i.status === 'pending').length > 0 && <span className="js-count">{received.filter(i => i.status === 'pending').length}</span>}
                </button>
                <button className={`js-tab ${filter === 'accepted' ? 'active' : ''}`} onClick={() => setFilter('accepted')}>
                  Accepted
                </button>
                <button className={`js-tab ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
                  Declined
                </button>
              </div>
            </header>

            <div className="js-inbox-body">
              {filteredInterests.length > 0 ? (
                <div className="js-interest-list">
                  {filteredInterests.map((item) => (
                    <div key={item.id} className="js-interest-row">
                      <div className="js-user-info">
                        <Avatar src={null} name={item.profiles?.name} size="lg" />
                        <div className="js-meta">
                          <h3>{item.profiles?.name}</h3>
                          <p>{item.profiles?.city} • {item.profiles?.caste}</p>
                          <span className="js-time"><Clock size={12} /> {formatDistanceToNow(new Date(item.created_at))} ago</span>
                        </div>
                      </div>

                      <div className="js-actions">
                        {filter === 'pending' && (
                          <>
                            <button className="js-btn-accept" onClick={() => handleAction(item.id, 'accept')} disabled={loading}>
                              <Check size={16} /> Accept
                            </button>
                            <button className="js-btn-decline" onClick={() => handleAction(item.id, 'reject')} disabled={loading}>
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {filter === 'accepted' && (
                          <div className="js-accepted-badge">
                            <CheckCircle size={16} /> <span>Connected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="js-empty-inbox">
                  <Heart size={40} className="js-icon-muted" />
                  <h3>No {filter} interests</h3>
                  <p>Discover more people who share your values.</p>
                  <button className="js-discover-btn" onClick={() => navigate('/search')}>Find Matches</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <RightSidebar profile={profile} />
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Inbox Card */
        .js-inbox-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .js-inbox-header { border-bottom: 1px solid #f1f5f9; }
        .js-inbox-title { display: flex; align-items: center; gap: 10px; padding: 16px; }
        .js-inbox-title h2 { font-size: 16px; font-weight: 800; color: #1e293b; }
        .js-icon-red { color: #D63447; }
        
        @media (min-width: 768px) {
          .js-inbox-title { padding: 20px; }
          .js-inbox-title h2 { font-size: 18px; }
        }
        
        .js-inbox-tabs { display: flex; padding: 0 16px; overflow-x: auto; }
        .js-tab {
          padding: 10px 16px; border: none; background: none; font-size: 13px;
          font-weight: 700; color: #64748b; cursor: pointer; position: relative;
          white-space: nowrap; font-family: inherit;
        }
        .js-tab.active { color: #D63447; }
        .js-tab.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: #D63447; border-radius: 2px; }
        .js-count { background: #D63447; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 10px; margin-left: 6px; }

        .js-interest-list { display: flex; flex-direction: column; }
        .js-interest-row {
          display: flex; flex-direction: column; gap: 12px;
          padding: 16px; border-bottom: 1px solid #f8fafc; transition: background 0.2s;
        }
        .js-interest-row:hover { background: #fcfcfd; }

        @media (min-width: 480px) {
          .js-interest-row { flex-direction: row; justify-content: space-between; align-items: center; gap: 0; }
          .js-interest-row { padding: 20px; }
        }

        .js-user-info { display: flex; gap: 12px; align-items: center; }
        .js-meta h3 { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
        .js-meta p { font-size: 12px; color: #64748b; }
        .js-time { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #94a3b8; margin-top: 4px; }

        .js-actions { display: flex; gap: 8px; }

        /* On mobile, action buttons go full width */
        @media (max-width: 479px) {
          .js-actions { flex-direction: row; }
          .js-btn-accept { flex: 1; justify-content: center; }
        }

        .js-btn-accept {
          background: #D63447; color: #fff; border: none; padding: 10px 16px;
          border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 6px; font-family: inherit;
        }
        .js-btn-decline {
          background: #f1f5f9; color: #64748b; border: none; padding: 8px 12px;
          border-radius: 8px; cursor: pointer; font-family: inherit;
        }
        .js-accepted-badge { display: flex; align-items: center; gap: 6px; color: #10b981; font-size: 12px; font-weight: 700; }

        .js-empty-inbox { padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .js-icon-muted { color: #cbd5e1; }
        .js-empty-inbox h3 { font-size: 18px; font-weight: 800; color: #64748b; }
        .js-empty-inbox p { font-size: 14px; color: #94a3b8; }
        .js-discover-btn {
          margin-top: 15px; background: #D63447; color: #fff; border: none;
          padding: 10px 24px; border-radius: 20px; font-weight: 700; cursor: pointer;
          font-family: inherit;
        }
      `}} />
      <Footer />
    </div>
  );
}

