import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TopNav from '../components/ui/TopNav';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { interestService } from '../services/interestService';
import { formatDistanceToNow } from 'date-fns';
import {
  Star, Clock, CheckCircle2, XCircle, CheckCircle,
  Users, Lock, RefreshCw, Trash2, MessageCircle
} from 'lucide-react';
import Sidebar from '../components/ui/Sidebar';
import RightSidebar from '../components/ui/RightSidebar';
import Footer from '../components/ui/Footer';

export default function InterestsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('received'); // 'received', 'accepted', 'sent'
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  // Independent pending count — always accurate regardless of active tab
  const [pendingCount, setPendingCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null); // stores interestId being acted on

  // Load the pending count independently of tab so badge is always correct
  const refreshPendingCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const count = await interestService.getPendingCount(user.id);
      setPendingCount(count);
    } catch (e) {
      // silent — badge stays at last known value
    }
  }, [user?.id]);

  const loadInterests = useCallback(async (showSpinner = true) => {
    if (!user?.id) return;
    if (showSpinner) setLoading(true);
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
      toast.error('Failed to load interests.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [user?.id, tab]);

  // Set up polling interval to fetch data and counts in the background
  useEffect(() => {
    loadInterests(true);
    refreshPendingCount();

    const interval = setInterval(() => {
      loadInterests(false);
      refreshPendingCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadInterests, refreshPendingCount]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleAccept = async (interestId) => {
    setActionLoading(interestId);
    try {
      await interestService.acceptInterest(interestId);
      toast.success('Interest accepted! You can now chat.');
      await Promise.all([loadInterests(false), refreshPendingCount()]);
    } catch (err) {
      toast.error('Failed to accept interest.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (interestId) => {
    setActionLoading(interestId);
    try {
      await interestService.rejectInterest(interestId);
      toast.success('Interest declined.');
      await Promise.all([loadInterests(false), refreshPendingCount()]);
    } catch (err) {
      toast.error('Failed to decline interest.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async (interestId) => {
    if (!window.confirm('Withdraw this interest? The other person will no longer see it.')) return;
    setActionLoading(interestId);
    try {
      await interestService.withdrawInterest(interestId);
      toast.success('Interest withdrawn.');
      loadInterests(false);
    } catch (err) {
      toast.error('Failed to withdraw interest.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResend = async (item) => {
    setActionLoading(item.id);
    try {
      await interestService.resendInterest(item.id);
      toast.success('Interest re-sent!');
      loadInterests(false);
    } catch (err) {
      toast.error('Failed to re-send interest.');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="js-dashboard-wrapper interests-page">
      <TopNav />

      <main className="js-layout-container js-main-grid">
        <Sidebar>
          <div className="js-community-trust-wrapper">
            <span className="js-trust-label">COMMUNITY &amp; TRUST</span>
            <div className="js-trust-cards-stack">
              <div className="js-trust-card">
                <div className="js-trust-icon green"><CheckCircle size={22} /></div>
                <h5>Verified profiles</h5>
                <p>We verify phone &amp; email of every member</p>
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
                  {/* pendingCount comes from a separate query — always accurate */}
                  Pending {pendingCount > 0 && <span className="pending-badge">{pendingCount}</span>}
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
            ) : (
              <div className="sent-list">
                {/* ── RECEIVED (pending) tab ── */}
                {tab === 'received' && (() => {
                  const pending = interests.filter(i => i.status === 'pending');
                  if (pending.length === 0) return (
                    <div className="empty-state-card">
                      <div className="empty-icon-box"><Star size={40} /></div>
                      <h2>No pending interests</h2>
                      <p>When someone expresses interest in your profile, it will appear here.</p>
                    </div>
                  );
                  return pending.map((item) => (
                    <div key={item.id} className="sent-item-card">
                      <div className="sent-user-info">
                        <Avatar src={item.profiles?.photo_url} name={item.profiles?.name} size="lg" />
                        <div className="user-meta">
                          <h3>{item.profiles?.name}</h3>
                          <p>{item.profiles?.city}{item.profiles?.caste ? ` • ${item.profiles.caste}` : ''}</p>
                          <span className="time-ago">
                            <Clock size={12} /> Received {formatDistanceToNow(new Date(item.created_at))} ago
                          </span>
                        </div>
                      </div>
                      <div className="sent-status">
                        <div className="js-action-group">
                          <Button
                            size="sm" variant="primary"
                            onClick={() => handleAccept(item.id)}
                            disabled={actionLoading === item.id}
                          >
                            {actionLoading === item.id ? <Spinner size="sm" /> : '✓ Accept'}
                          </Button>
                          <Button
                            size="sm" variant="outline"
                            onClick={() => handleReject(item.id)}
                            disabled={actionLoading === item.id}
                          >
                            ✕ Decline
                          </Button>
                          <button
                            className="icon-action-btn chat"
                            title="Open chat"
                            onClick={() => navigate(`/chat/${item.sender_id}`)}
                          >
                            <MessageCircle size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ));
                })()}

                {/* ── ACCEPTED tab ── */}
                {tab === 'accepted' && (() => {
                  if (interests.length === 0) return (
                    <div className="empty-state-card">
                      <div className="empty-icon-box"><CheckCircle2 size={40} /></div>
                      <h2>No accepted interests yet</h2>
                      <p>When mutual interests are accepted, they'll appear here.</p>
                    </div>
                  );
                  return interests.map((item) => {
                    const otherId = item.sender_id === user.id ? item.receiver_id : item.sender_id;
                    return (
                      <div key={item.id} className="sent-item-card">
                        <div className="sent-user-info">
                          <Avatar src={item.profiles?.photo_url} name={item.profiles?.name} size="lg" />
                          <div className="user-meta">
                            <h3>{item.profiles?.name}</h3>
                            <p>{item.profiles?.city}{item.profiles?.profession ? ` • ${item.profiles.profession}` : ''}</p>
                            <span className="time-ago">
                              <Clock size={12} /> Connected {formatDistanceToNow(new Date(item.created_at))} ago
                            </span>
                          </div>
                        </div>
                        <div className="sent-status">
                          <div className="status-pill accepted">
                            <CheckCircle2 size={14} /> <span>Mutual Match</span>
                          </div>
                          <button
                            className="icon-action-btn chat"
                            title="Open chat"
                            onClick={() => navigate(`/chat/${otherId}`)}
                          >
                            <MessageCircle size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}

                {/* ── SENT tab ── */}
                {tab === 'sent' && (() => {
                  if (interests.length === 0) return (
                    <div className="empty-state-card">
                      <div className="empty-icon-box"><Star size={40} /></div>
                      <h2>No sent interests</h2>
                      <p>Start searching and express interest in profiles that match your preferences.</p>
                      <Button onClick={() => window.location.href = '/search'}>Explore Profiles</Button>
                    </div>
                  );
                  return interests.map((item) => (
                    <div key={item.id} className="sent-item-card">
                      <div className="sent-user-info">
                        <Avatar src={item.profiles?.photo_url} name={item.profiles?.name} size="lg" />
                        <div className="user-meta">
                          <h3>{item.profiles?.name}</h3>
                          <p>{item.profiles?.city}{item.profiles?.caste ? ` • ${item.profiles.caste}` : ''}</p>
                          <span className="time-ago">
                            <Clock size={12} /> Updated {formatDistanceToNow(new Date(item.created_at))} ago
                          </span>
                        </div>
                      </div>
                      <div className="sent-status">
                        {/* Status pill */}
                        <div className={`status-pill ${item.status || 'pending'}`}>
                          {item.status === 'accepted'
                            ? <CheckCircle2 size={14} />
                            : item.status === 'rejected'
                            ? <XCircle size={14} />
                            : <Clock size={14} />}
                          <span>{(item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1)}</span>
                        </div>

                        {/* Actions */}
                        <div className="js-action-group" style={{ marginTop: '6px' }}>
                          {/* Pending — can withdraw */}
                          {item.status === 'pending' && (
                            <button
                              className="icon-action-btn danger"
                              title="Withdraw interest"
                              disabled={actionLoading === item.id}
                              onClick={() => handleWithdraw(item.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                          {/* Rejected — can re-send */}
                          {item.status === 'rejected' && (
                            <button
                              className="icon-action-btn resend"
                              title="Re-send interest"
                              disabled={actionLoading === item.id}
                              onClick={() => handleResend(item)}
                            >
                              <RefreshCw size={15} />
                              <span style={{ fontSize: '11px', marginLeft: '4px' }}>Re-send</span>
                            </button>
                          )}
                          {/* Accepted — open chat */}
                          {item.status === 'accepted' && (
                            <button
                              className="icon-action-btn chat"
                              title="Open chat"
                              onClick={() => navigate(`/chat/${item.receiver_id}`)}
                            >
                              <MessageCircle size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
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

        .pending-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: #D63447; color: #fff; font-size: 11px; font-weight: 700;
          border-radius: 10px; min-width: 18px; height: 18px; padding: 0 5px;
          margin-left: 5px;
        }

        .js-tab-switcher {
          display: flex; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;
        }
        .js-tab-btn {
          display: flex; align-items: center;
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
        .user-meta p  { font-size: 13px; color: #64748b; margin: 0 0 2px; }
        .time-ago { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
        .sent-status { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .js-action-group { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

        .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .status-pill.accepted { background: #dcfce7; color: #15803d; }
        .status-pill.pending  { background: #fef3c7; color: #d97706; }
        .status-pill.rejected { background: #fee2e2; color: #dc2626; }

        .icon-action-btn {
          display: inline-flex; align-items: center; gap: 4px;
          border: none; border-radius: 8px; padding: 6px 10px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .icon-action-btn.chat   { background: #eff6ff; color: #2563eb; }
        .icon-action-btn.chat:hover   { background: #dbeafe; }
        .icon-action-btn.danger { background: #fee2e2; color: #dc2626; }
        .icon-action-btn.danger:hover { background: #fecaca; }
        .icon-action-btn.resend { background: #f0fdf4; color: #16a34a; }
        .icon-action-btn.resend:hover { background: #dcfce7; }
        .icon-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .empty-state-card { padding: 60px 20px; text-align: center; background: #fff; border-radius: 20px; border: 1px dashed #cbd5e0; margin-top: 20px; }
        .empty-icon-box { width: 70px; height: 70px; background: #fffbeb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #C9956C; }
        .loading-center { display: flex; justify-content: center; padding: 60px 0; }
      `}} />
      <Footer />
    </div>
  );
}
