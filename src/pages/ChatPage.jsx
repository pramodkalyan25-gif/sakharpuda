import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { chatService } from '../services/chatService';
import { interestService } from '../services/interestService';
import { photoService } from '../services/photoService';
import { ChevronLeft, MoreVertical, Send, Ban, AlertTriangle } from 'lucide-react';
import { differenceInYears, parseISO, format } from 'date-fns';
import { toast } from 'react-hot-toast';
import './ChatPage.css';
import Spinner from '../components/ui/Spinner';

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile: myProfile } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [interestStatus, setInterestStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Report UI States
  const [reportStep, setReportStep] = useState(0); // 0=None, 1=ReasonList, 2=Details
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  // NOTE: hasBlockedLocally removed — we now rely on sender_id === user.id invariant
  // (blockUserById guarantees sender_id = blocker after Phase-1 fix)

  const messagesEndRef = useRef(null);

  const age = profile?.dob ? differenceInYears(new Date(), parseISO(profile.dob)) : '';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [p, photo, interest, msgs] = await Promise.all([
          profileService.getPublicProfile(id),
          photoService.getPrimaryPhoto(id).catch(() => null),
          interestService.getInterestStatus(user.id, id).catch(() => null),
          chatService.getMessages(user.id, id).catch(() => [])
        ]);

        setProfile(p);
        if (photo?.signed_url) {
          setAvatarUrl(photo.signed_url);
        }
        setInterestStatus(interest);
        setMessages(msgs || []);
      } catch (err) {
        toast.error('Could not load chat');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && id) {
      loadData();
    }
  }, [user?.id, id, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages AND latest interest status every 5 seconds
  useEffect(() => {
    if (!user?.id || !id) return;
    const interval = setInterval(async () => {
      try {
        const [msgs, interest] = await Promise.all([
          chatService.getMessages(user.id, id).catch(() => null),
          interestService.getInterestStatus(user.id, id).catch(() => null),
        ]);
        if (msgs) setMessages(msgs);
        // Only update if interest changed (avoid unnecessary re-renders)
        if (interest !== undefined) setInterestStatus(interest);
      } catch (e) {
        // ignore polling errors silently
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.id, id]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    // Safety guard: never send a message if blocked (footer hides input, but be safe)
    if (interestStatus?.is_blocked) return;

    setSending(true);
    try {
      const msg = await chatService.sendMessage(user.id, id, newMessage.trim());
      setMessages([...messages, msg]);
      setNewMessage('');
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (interestId) => {
    setLoading(true);
    try {
      await interestService.acceptInterest(interestId);
      const updated = await interestService.getInterestStatus(user.id, id);
      setInterestStatus(updated);
      toast.success('Interest accepted!');
    } catch (err) {
      toast.error('Failed to accept interest');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (interestId) => {
    setLoading(true);
    try {
      await interestService.rejectInterest(interestId);
      const updated = await interestService.getInterestStatus(user.id, id);
      setInterestStatus(updated);
      toast.success('Interest declined.');
    } catch (err) {
      toast.error('Failed to decline interest');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async () => {
    if (!myProfile) return toast.error('Complete your profile first.');
    setSending(true);
    try {
      if (interestStatus?.id && isRejected && iAmSender) {
        // Case A: I sent interest, they rejected — update same row back to pending
        await interestService.resendInterest(interestStatus.id);
      } else if (interestStatus?.id && isRejected && iAmReceiver) {
        // Case B (Scenario 13): I rejected their interest, now I want to initiate
        // Delete old row + re-insert with me as sender
        await interestService.switchAndSendInterest(user.id, id, myProfile);
      } else {
        // Case C: No row exists — fresh send
        await interestService.sendInterest(user.id, id, myProfile);
      }
      const updated = await interestService.getInterestStatus(user.id, id);
      setInterestStatus(updated);
      toast.success('Interest sent!');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('DUPLICATE')) {
        toast.error('You have already sent interest to this profile.');
      } else if (msg.includes('DAILY_LIMIT_REACHED')) {
        toast.error(`Daily limit reached. You can send up to ${10} interests per day.`);
      } else {
        toast.error(msg || 'Failed to send interest.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleBlock = async () => {
    if (!window.confirm('Are you sure you want to block this profile?')) return;
    setShowMenu(false);
    setLoading(true);
    try {
      const updated = await interestService.blockUserById(user.id, id);
      setInterestStatus(updated);
      toast.success('Profile blocked.');
    } catch (err) {
      toast.error('Failed to block profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    try {
      const updated = await interestService.unblockUserById(user.id, id);
      setInterestStatus(updated);
      toast.success('Profile unblocked.');
    } catch (err) {
      toast.error('Failed to unblock profile');
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = () => {
    setReportStep(1); // Open the report reason list
  };

  const handleReasonSelect = (reason) => {
    setReportReason(reason);
    setReportStep(2); // Go to details step
  };

  const submitReport = async () => {
    if (!reportReason || !reportDescription.trim()) return toast.error('Please provide details');
    
    setSubmittingReport(true);
    try {
      // We import reportService at the top
      const { reportService } = await import('../services/reportService');
      await reportService.submitReport(user.id, id, reportReason, reportDescription, reportFile);
      
      const updated = await interestService.getInterestStatus(user.id, id);
      setInterestStatus(updated);
      
      toast.success('Report submitted successfully. We will review it shortly.');
      setShowMenu(false);
      setReportStep(0);
      setReportReason('');
      setReportDescription('');
      setReportFile(null);
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading && !profile) return <div className="page-loading"><Spinner size="lg" /></div>;
  if (!profile) return null;

  // Who blocked whom?
  // INVARIANT (guaranteed by blockUserById Phase-1 fix):
  //   when is_blocked=true, sender_id = the user who blocked
  const isBlocked    = !!interestStatus?.is_blocked;
  const weBlockedThem = isBlocked && interestStatus?.sender_id === user.id;
  const weAreBlocked  = isBlocked && !weBlockedThem;

  const isConnected = interestStatus?.status === 'accepted';

  // Determine who sent the interest (if any row exists)
  const iAmSender   = !!interestStatus && interestStatus.sender_id === user.id;
  const iAmReceiver = !!interestStatus && interestStatus.sender_id !== user.id;
  const isPending   = interestStatus?.status === 'pending';
  const isRejected  = interestStatus?.status === 'rejected';

  // Top bar buttons
  // — Show "Send Interest" / "Re-send Interest" when: no row, OR rejected
  const showSendInterestBtn  = !isBlocked && !isConnected && (!interestStatus || isRejected);
  // — Show "Interest Sent – Waiting" pill only when I am the pending sender
  const showInterestSentPill = !isBlocked && !isConnected && isPending && iAmSender;
  // — Label for the send button
  const sendBtnLabel = (isRejected && iAmSender) ? 'Re-send Interest' : 'Send Interest';

  // REPORT REASONS
  const reportReasons = [
    "User is using abusive/indecent language",
    "User has no intention to marry",
    "User is stalking me with messages/calls",
    "User is asking for money",
    "Photo on profile does not belong to the person",
    "User is already engaged/married",
    "Profile is fake or publishes incorrect information"
  ];

  return (
    <div className="chat-page-container">
      {/* HEADER */}
      <header className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="chat-header-avatar" onClick={() => navigate(`/profile/${id}`)}>
          <img src={avatarUrl || '/images/default-avatar.png'} alt={profile.name} />
          {profile.is_top_profile && <span className="pro-badge">Pro</span>}
        </div>
        <div className="chat-header-info" onClick={() => navigate(`/profile/${id}`)}>
          <div className="chat-name-row">
            <h2>{profile.name}, {age}</h2>
          </div>
          <div className="chat-last-seen">Last seen recently</div>
          <div className="chat-sub-details">
            {profile.height ? `${Math.floor(profile.height / 30.48)}' ${Math.round((profile.height % 30.48) / 2.54)}"` : 'N/A'} • {profile.profession || 'Student'}
          </div>
          <div className="chat-sub-details">
            {profile.caste || 'Caste N/A'} • {profile.salary || 'No Income'}
          </div>
        </div>
        {/* ⋯ Menu button — always visible (not just when connected) to allow blocking/reporting */}
        {!weAreBlocked && (
          <button className="chat-menu-btn" onClick={() => setShowMenu(true)}>
            <MoreVertical size={24} />
          </button>
        )}
      </header>

      {/* SEND INTEREST / INTEREST SENT BAR */}
      {showSendInterestBtn && (
        <div className="chat-interest-bar">
          <button
            className="send-interest-btn-top"
            onClick={handleSendInterest}
            disabled={sending}
          >
            <Send size={16} /> {sendBtnLabel}
          </button>
        </div>
      )}
      {showInterestSentPill && (
        <div className="chat-interest-bar">
          <button className="send-interest-btn-top" disabled style={{ opacity: 0.75, cursor: 'default' }}>
            <Send size={16} /> Interest Sent – Waiting for {profile.name?.split(' ')[0]} to Accept
          </button>
        </div>
      )}

      {/* MESSAGES AREA */}
      <div className="chat-messages-area">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <p>Start the conversation with {profile.name}!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            const msgDate = format(parseISO(msg.created_at), 'yyyy-MM-dd');
            const prevMsgDate = idx > 0 ? format(parseISO(messages[idx - 1].created_at), 'yyyy-MM-dd') : null;
            const showDateDivider = msgDate !== prevMsgDate;

            return (
              <div key={msg.id || idx} style={{ display: 'flex', flexDirection: 'column' }}>
                {showDateDivider && (
                  <div className="date-divider">
                    <span className="date-label">
                      {format(parseISO(msg.created_at), 'EEEE, MMM do')}
                    </span>
                  </div>
                )}
                <div className={`chat-bubble-wrap ${isMe ? 'me' : 'them'}`}>
                  <div className="chat-bubble">
                    {msg.content}
                  </div>
                  <div className="chat-time">
                    {msg.created_at ? format(parseISO(msg.created_at), 'h:mm a') : 'Now'}
                    {isMe && (
                      <span className="msg-ticks" style={{ color: msg.read_status ? '#C9956C' : '#94a3b8' }}>
                        {msg.read_status ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER INPUT */}
      <footer className="chat-footer">
        {weBlockedThem ? (
          <div className="chat-blocked-state">
            <p className="blocked-text"><strong>You blocked this candidate</strong></p>
            <button className="unblock-btn" onClick={handleUnblock} disabled={loading}>
              Unblock
            </button>
          </div>
        ) : weAreBlocked ? (
           <div className="chat-blocked-state">
            <p className="blocked-text" style={{ color: '#ef4444' }}><strong>You cannot reply to this conversation.</strong></p>
          </div>
        ) : !isConnected ? (
          <div className="chat-blocked-state interest-pending-notice">
            {/* Receiver sees Accept + Reject */}
            {isPending && iAmReceiver ? (
              <>
                <p className="blocked-text">Accept interest to start chatting</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    className="unblock-btn"
                    onClick={() => handleAccept(interestStatus.id)}
                    disabled={loading}
                    style={{ background: '#16a34a', color: '#fff', border: 'none' }}
                  >
                    ✓ Accept
                  </button>
                  <button
                    className="unblock-btn"
                    onClick={() => handleReject(interestStatus.id)}
                    disabled={loading}
                    style={{ background: '#dc2626', color: '#fff', border: 'none' }}
                  >
                    ✗ Reject
                  </button>
                </div>
              </>
            ) : isPending && iAmSender ? (
              <p className="blocked-text">Waiting for {profile.name?.split(' ')[0]} to accept your interest…</p>
            ) : isRejected && iAmSender ? (
              <p className="blocked-text">Interest not accepted. You can re-send above.</p>
            ) : isRejected && iAmReceiver ? (
              <p className="blocked-text">You declined this interest. You can send a new interest above.</p>
            ) : (
              <p className="blocked-text">Send interest above to start chatting.</p>
            )}
          </div>
        ) : (
          <div className="chat-input-wrapper">
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Write here ..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
              />
              <button type="submit" className="chat-send-btn" disabled={!newMessage.trim() || sending}>
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </footer>

      {/* BOTTOM SHEET MENU */}
      {(showMenu || reportStep > 0) && (
        <>
          <div className="chat-menu-overlay" onClick={() => { setShowMenu(false); setReportStep(0); }}></div>
          <div className="chat-bottom-sheet animate-slide-up">
            <div className="sheet-handle"></div>
            
            {reportStep === 0 && (
              <>
                <button className="sheet-action-item" onClick={handleBlock}>
                  <div className="sheet-icon"><Ban size={20} /></div>
                  <div className="sheet-text">
                    <h4>Block Profile</h4>
                    <p>Hide this profile permanently from your view; they won't be able to see or contact you either</p>
                  </div>
                </button>

                <button className="sheet-action-item" onClick={handleReportAction}>
                  <div className="sheet-icon"><AlertTriangle size={20} /></div>
                  <div className="sheet-text">
                    <h4>Report Profile</h4>
                    <p>Report this profile anonymously for suspicious or inappropriate behaviour, we'll take necessary action</p>
                  </div>
                  <ChevronLeft size={16} className="sheet-arrow" style={{ transform: 'rotate(180deg)' }} />
                </button>
              </>
            )}

            {reportStep === 1 && (
              <div className="report-step-1">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
                   <button onClick={() => setReportStep(0)} style={{ background: 'none', border: 'none', padding: '0', display: 'flex' }}><ChevronLeft size={24} /></button>
                   <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Help us understand what went wrong</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Your report remains anonymous & we'll take necessary actions if it goes against our guidelines</p>
                <div className="report-reasons-list">
                  {reportReasons.map(reason => (
                    <button key={reason} className="report-reason-pill" onClick={() => handleReasonSelect(reason)}>
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {reportStep === 2 && (
              <div className="report-step-2">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
                   <button onClick={() => setReportStep(1)} style={{ background: 'none', border: 'none', padding: '0', display: 'flex' }}><ChevronLeft size={24} /></button>
                   <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Help us understand what went wrong</h3>
                </div>
                
                <div className="selected-reason-pill">
                  {reportReason}
                  <button onClick={() => setReportStep(1)}>✕</button>
                </div>

                <div className="report-input-group">
                  <label>Write about it in detail</label>
                  <textarea 
                    placeholder="Enter details..." 
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="report-upload-box">
                  <div className="upload-box-text">
                    <strong>Attach Screenshot</strong>
                    <p>Uploading a screenshot will help bring clarity to the problem</p>
                  </div>
                  <label className="upload-btn">
                    <input type="file" accept="image/*" onChange={(e) => setReportFile(e.target.files[0])} hidden />
                    📎
                  </label>
                  {reportFile && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px', width: '100%' }}>Attached: {reportFile.name}</div>}
                </div>

                <button 
                  className="report-submit-btn" 
                  disabled={!reportDescription.trim() || submittingReport}
                  onClick={submitReport}
                >
                  {submittingReport ? <Spinner size="sm" /> : 'Next'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
