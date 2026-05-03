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
  ShieldCheck, 
  Users, 
  Phone, 
  Video, 
  CheckCircle,
  Search as SearchIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
    <div className="js-dashboard-wrapper">
      <TopNav />
      
      <main className="js-main-grid container">
        {/* LEFT SIDEBAR */}
        <aside className="js-left-sidebar">
          <div className="js-profile-brief">
            <div className="js-brief-avatar">
              <Avatar src={null} name={profile?.name} size="lg" />
            </div>
            <div className="js-brief-info">
              <h3>Hi {profile?.name?.split(' ')[0]}!</h3>
              <p>{profile?.profile_id || profile?.user_id?.substring(0, 8)} <Link to="/create-profile" className="js-edit-link">Edit Profile</Link></p>
            </div>
          </div>

          <nav className="js-side-nav">
            <Link to="/my-matches" className="js-nav-item">
              <span className="js-nav-label">Matches</span>
              <span className="js-nav-arrow">›</span>
            </Link>
            <Link to="/dashboard" className="js-nav-item">
              <span className="js-nav-label">Activity</span>
              <span className="js-nav-arrow">›</span>
            </Link>
            <Link to="/search" className="js-nav-item">
              <span className="js-nav-label">Search</span>
              <span className="js-nav-arrow">›</span>
            </Link>
            <Link to="/inbox" className="js-nav-item active">
              <span className="js-nav-label">Messenger</span>
              <span className="js-nav-arrow">›</span>
            </Link>
            <Link to="/upgrade" className="js-nav-item upgrade">
              <span className="js-nav-label">Upgrade</span>
              <span className="js-nav-badge">54% Off</span>
              <span className="js-nav-arrow">›</span>
            </Link>
          </nav>
        </aside>

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
        <aside className="js-right-sidebar">
          <div className="js-premium-nudge">
            <h3>You are <span className="red">missing</span> out on the premium benefits!</h3>
            <div className="js-benefit-list">
              <div className="js-benefit-item">
                <div className="js-benefit-icon purple"><Users size={16} /></div>
                <p>Get upto 3x more profile views</p>
              </div>
              <div className="js-benefit-item">
                <div className="js-benefit-icon orange">
                  <div className="js-icon-stack">
                    <Phone size={10} />
                    <Video size={10} />
                  </div>
                </div>
                <p>Unlimited voice & video calls</p>
              </div>
              <div className="js-benefit-item">
                <div className="js-benefit-icon green"><CheckCircle size={16} /></div>
                <p>Get access to contact details</p>
              </div>
            </div>
            <div className="js-promo-footer">
              <button className="js-upgrade-btn" onClick={() => navigate('/upgrade')}>
                Upgrade now <span>→</span>
              </button>
            </div>
          </div>
        </aside>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .js-dashboard-wrapper { min-height: 100vh; background: #f1f2f5; padding-bottom: 50px; }
        .js-main-grid { display: grid; grid-template-columns: 240px 1fr 280px; gap: 20px; margin-top: 20px; align-items: flex-start; }

        /* Sidebar styles (Shared) */
        .js-left-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .js-profile-brief {
          background: #fff; border-radius: 8px; padding: 20px;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-brief-avatar { margin-bottom: 12px; }
        .js-brief-info h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
        .js-brief-info p { font-size: 12px; color: #64748b; }
        .js-edit-link { color: #D63447; font-weight: 700; text-decoration: none; margin-left: 4px; }

        .js-side-nav { background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .js-nav-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; text-decoration: none; color: #475569;
          font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9; transition: background 0.2s;
        }
        .js-nav-item:hover { background: #f8fafc; }
        .js-nav-item.active { color: #D63447; border-left: 3px solid #D63447; background: #fff1f2; }

        /* Inbox Card */
        .js-inbox-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .js-inbox-header { border-bottom: 1px solid #f1f5f9; }
        .js-inbox-title { display: flex; align-items: center; gap: 10px; padding: 20px; }
        .js-inbox-title h2 { font-size: 18px; font-weight: 800; color: #1e293b; }
        .js-icon-red { color: #D63447; }
        
        .js-inbox-tabs { display: flex; padding: 0 20px; }
        .js-tab {
          padding: 12px 20px; border: none; background: none; font-size: 13px;
          font-weight: 700; color: #64748b; cursor: pointer; position: relative;
        }
        .js-tab.active { color: #D63447; }
        .js-tab.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: #D63447; }
        .js-count { background: #D63447; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 10px; margin-left: 6px; }

        .js-interest-list { display: flex; flex-direction: column; }
        .js-interest-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px; border-bottom: 1px solid #f8fafc; transition: background 0.2s;
        }
        .js-interest-row:hover { background: #fcfcfd; }
        .js-user-info { display: flex; gap: 15px; align-items: center; }
        .js-meta h3 { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
        .js-meta p { font-size: 12px; color: #64748b; }
        .js-time { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #94a3b8; margin-top: 4px; }

        .js-actions { display: flex; gap: 8px; }
        .js-btn-accept {
          background: #D63447; color: #fff; border: none; padding: 8px 16px;
          border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;
        }
        .js-btn-decline {
          background: #f1f5f9; color: #64748b; border: none; padding: 8px;
          border-radius: 8px; cursor: pointer;
        }
        .js-accepted-badge { display: flex; align-items: center; gap: 6px; color: #10b981; font-size: 12px; font-weight: 700; }

        .js-empty-inbox { padding: 80px 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .js-icon-muted { color: #cbd5e1; }
        .js-empty-inbox h3 { font-size: 18px; font-weight: 800; color: #64748b; }
        .js-empty-inbox p { font-size: 14px; color: #94a3b8; }
        .js-discover-btn {
          margin-top: 15px; background: #D63447; color: #fff; border: none;
          padding: 10px 24px; border-radius: 20px; font-weight: 700; cursor: pointer;
        }

        /* Right Sidebar nudge */
        .js-right-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .js-premium-nudge {
          background: #fff; border-radius: 12px; padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-premium-nudge h3 { font-size: 15px; font-weight: 700; color: #1e293b; line-height: 1.4; margin-bottom: 20px; text-align: center; }
        .js-premium-nudge .red { color: #D63447; }
        .js-benefit-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px; }
        .js-benefit-item { display: flex; align-items: center; gap: 12px; }
        .js-benefit-icon {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .js-benefit-icon.purple { background: #f3e8ff; color: #9333ea; }
        .js-benefit-icon.orange { background: #fff7ed; color: #ea580c; }
        .js-benefit-icon.green { background: #f0fdf4; color: #16a34a; }
        .js-upgrade-btn {
          width: 100%; background: #D63447; color: #fff; border: none;
          padding: 12px; border-radius: 8px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        @media (max-width: 1024px) {
          .js-main-grid { grid-template-columns: 200px 1fr; }
          .js-right-sidebar { display: none; }
        }
        @media (max-width: 768px) {
          .js-main-grid { grid-template-columns: 1fr; }
          .js-left-sidebar { display: none; }
        }
      `}} />
    </div>
  );
}
