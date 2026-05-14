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
  const [hasBlockedLocally, setHasBlockedLocally] = useState(false);

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

  // Optional polling for new messages (every 5 seconds)
  useEffect(() => {
    if (!user?.id || !id) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await chatService.getMessages(user.id, id);
        if (msgs) setMessages(msgs);
      } catch (e) {
        // ignore polling errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.id, id]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // If no interest exists or it's not accepted, send one automatically!
      if (!interestStatus || interestStatus.status !== 'accepted') {
        if (!interestStatus) {
           await interestService.sendInterest(user.id, id, myProfile);
           setInterestStatus({ status: 'pending', sender_id: user.id });
        }
      }

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

  const handleSendInterest = async () => {
    if (!myProfile) return toast.error('Complete your profile first.');
    setSending(true);
    try {
      await interestService.sendInterest(user.id, id, myProfile);
      setInterestStatus({ status: 'pending', sender_id: user.id });
      toast.success('Interest sent!');
    } catch (err) {
      toast.error(err.message);
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
      setHasBlockedLocally(true);
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
      setHasBlockedLocally(false);
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
  // isBlocked is true if a block exists. weAreBlocked is true if the other person blocked us.
  const isBlocked = interestStatus?.is_blocked;
  
  // If we just clicked block, we definitely blocked them. 
  // Otherwise, we guess based on sender_id (though imperfect, it's what we have without DB changes).
  const weBlockedThem = hasBlockedLocally || (isBlocked && interestStatus.sender_id === user.id);
  const weAreBlocked = isBlocked && !weBlockedThem;

  const isConnected = interestStatus?.status === 'accepted';
  const showInterestHint = !isConnected && !isBlocked;

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
        {isConnected && (
          <button className="chat-menu-btn" onClick={() => setShowMenu(true)}>
            <MoreVertical size={24} />
          </button>
        )}
      </header>

      {/* SEND INTEREST BAR */}
      {(!interestStatus || interestStatus.status === 'pending') && !isBlocked && (
        <div className="chat-interest-bar">
          <button 
            className="send-interest-btn-top" 
            onClick={handleSendInterest} 
            disabled={interestStatus?.status === 'pending'}
          >
            <Send size={16} /> 
            {interestStatus?.status === 'pending' ? 'Interest Sent' : 'Send Interest'}
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
            <p className="blocked-text">
              {interestStatus?.sender_id === user.id 
                ? "Waiting for candidate to accept your interest..." 
                : "Accept interest to start chatting"}
            </p>
            {interestStatus?.sender_id !== user.id && interestStatus?.status === 'pending' && (
              <button className="unblock-btn" onClick={() => handleAccept(interestStatus.id)} disabled={loading}>
                Accept Interest
              </button>
            )}
          </div>
        ) : (
          <div className="chat-input-wrapper">
            {showInterestHint && (
              <div className="chat-interest-hint">
                Sending message will also send this member your interest
              </div>
            )}
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
