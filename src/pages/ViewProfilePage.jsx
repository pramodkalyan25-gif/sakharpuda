import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Heart, 
  Star, 
  X, 
  MessageCircle, 
  CheckCircle, 
  Image as ImageIcon,
  MapPin,
  Briefcase,
  GraduationCap,
  Info,
  Calendar,
  User as UserIcon,
  Phone,
  Share2,
  Mail,
  ArrowLeft,
  Copy,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  Printer,
  Download,
  X as CloseIcon
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import TopNav from '../components/ui/TopNav';
import { profileService } from '../services/profileService';
import { interestService } from '../services/interestService';
import { contactService } from '../services/contactService';
import { photoService } from '../services/photoService';
import { shortlistService } from '../services/shortlistService';
import { useAuth } from '../hooks/useAuth';
import { differenceInYears, parseISO, format } from 'date-fns';

export default function ViewProfilePage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { user, profile: myProfile } = useAuth();

  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [avatarUrl, setAvatarUrl]       = useState(null);
  const [interestStatus, setInterestStatus] = useState(null);
  const [contactStatus, setContactStatus]   = useState(null);
  const [allPhotos, setAllPhotos]       = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [matchesList, setMatchesList]     = useState([]);
  const [prevId, setPrevId]               = useState(null);
  const [nextId, setNextId]               = useState(null);
  const [showBioDataModal, setShowBioDataModal] = useState(false);
  const [showKundaliModal, setShowKundaliModal] = useState(false);
  const [sending, setSending]           = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [shortlisting, setShortlisting] = useState(false);
  
  const aboutRef = useRef(null);
  const basicRef = useRef(null);
  const careerRef = useRef(null);
  const locationRef = useRef(null);
  const contactRef = useRef(null);

  const isOwn = user?.id === id;
  const age   = profile?.dob ? differenceInYears(new Date(), parseISO(profile.dob)) : null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1. Load Profile
        const [p, photo, photos] = await Promise.all([
          profileService.getPublicProfile(id),
          photoService.getPrimaryPhoto(id),
          photoService.getUserPhotos(id)
        ]);
        setProfile(p);
        setAllPhotos(photos || []);
        
        if (photo?.signed_url) {
          if (user?.id && !isOwn) {
            const wm = await photoService.applyWatermark(photo.signed_url, user.id).catch(() => photo.signed_url);
            setAvatarUrl(wm);
          } else {
            setAvatarUrl(photo.signed_url);
          }
        }
        
        // 2. Load Metadata
        if (user?.id && !isOwn) {
          try {
            const [interest, contact, shortlistMap, recs] = await Promise.all([
              interestService.getInterestStatus(user.id, id).catch(() => null),
              contactService.getContactAccessStatus(user.id, id).catch(() => 'not_requested'),
              shortlistService.getShortlistMap(user.id).catch(() => ({})),
              searchService.getRecommendedProfiles(user.id, p).catch(() => null)
            ]);
            
            setInterestStatus(interest);
            setContactStatus(contact);
            setIsShortlisted(!!shortlistMap[id]);
            
            // Handle Navigation List
            if (recs?.profiles) {
              const list = recs.profiles;
              setMatchesList(list);
              const idx = list.findIndex(m => m.user_id === id);
              if (idx !== -1) {
                setPrevId(idx > 0 ? list[idx - 1].user_id : null);
                setNextId(idx < list.length - 1 ? list[idx + 1].user_id : null);
              } else {
                setNextId(list[0]?.user_id || null);
              }
            }
            
            profileService.logProfileView(user.id, id).catch(() => {});
          } catch (e) {
            console.error('Non-critical load error:', e);
          }
        }
      } catch (err) {
        console.error('Load profile error:', err);
        toast.error('Profile not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user?.id, isOwn, navigate]);

  const handleSendInterest = async (e) => {
    e.stopPropagation();
    if (!myProfile) {
      toast.error('Please complete your profile first.');
      navigate('/create-profile');
      return;
    }
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

  const handleToggleShortlist = async (e) => {
    e.stopPropagation();
    if (!user) return;
    setShortlisting(true);
    try {
      const nowShortlisted = await shortlistService.toggleShortlist(user.id, id);
      setIsShortlisted(nowShortlisted);
      toast.success(nowShortlisted ? 'Added to shortlist' : 'Removed from shortlist');
    } catch (err) {
      toast.error('Error updating shortlist');
    } finally {
      setShortlisting(false);
    }
  };

  const getShareText = () => {
    const name = profile?.name || 'Candidate';
    const location = profile?.city ? `${profile.city}, ${profile.country}` : 'Maharashtra';
    const homeUrl = 'https://www.sakharpuda.com';
    const profileUrl = window.location.href;
    
    return `VISIT US AT:\n\n` +
           `${homeUrl}\n\n` +
           `------------------------------------\n` +
           `*SAKHARPUDA MATRIMONY*\n` +
           `_Built by Maharashtrians for Maharashtrians_\n` +
           `Finding perfect matches for the community\n` +
           `------------------------------------\n\n` +
           `Check out this profile on SakharPuda:\n\n` +
           `*Name:* ${name}\n` +
           `*Age:* ${age} Years\n` +
           `*Location:* ${location}\n\n` +
           `------------------------------------\n` +
           `VIEW FULL PROFILE HERE:\n\n\n` +
           `${profileUrl}`;
  };

  const handleNativeShare = async () => {
    const shareText = getShareText();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `SakharPuda: ${profile.name}`,
          text: shareText,
          url: window.location.href
        });
      } else {
        copyToClipboard();
      }
    } catch (err) {
      if (err.name !== 'AbortError') toast.error('Sharing failed');
    }
    setShowShareModal(false);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareText());
    toast.success('Profile card copied!');
    setShowShareModal(false);
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navigateToProfile = (targetId) => {
    if (!targetId) return;
    window.scrollTo(0, 0);
    navigate(`/profile/${targetId}`);
  };

  if (loading && !profile) return <div className="page-loading"><Spinner size="lg" /></div>;
  if (!profile) return <div className="page-loading"><h2>Profile not found</h2></div>;

  const maskEmail = (email) => {
    if (!email) return 'N/A';
    return '********@****.***';
  };

  const maskPhone = (phone) => {
    if (!phone) return 'N/A';
    return phone.length > 5 ? phone.substring(0, phone.length - 5) + '*****' : '*****';
  };

  return (
    <div className="vp-page-wrapper">
      <TopNav />

      {/* USP ACTION BAR */}
      <div className="js-usp-bar">
        <div className="js-usp-container">
          <button className="js-usp-btn bio" onClick={() => setShowBioDataModal(true)}>
            <FileText size={18} />
            <span>Generate Bio-Data</span>
          </button>
          <button className="js-usp-btn guna" onClick={() => setShowKundaliModal(true)}>
            <Sparkles size={18} />
            <span>Guna Milan Match</span>
          </button>
        </div>
      </div>

      {/* SWIPE NAVIGATION ARROWS */}
      {prevId && (
        <button className="js-swipe-arrow left" onClick={() => navigateToProfile(prevId)}>
          <ChevronLeft size={32} />
        </button>
      )}
      {nextId && (
        <button className="js-swipe-arrow right" onClick={() => navigateToProfile(nextId)}>
          <ChevronRight size={32} />
        </button>
      )}
      
      <div className="js-view-profile-container">
        {/* HERO SECTION */}
        <div className="js-profile-hero">
          <div className="js-hero-card">
            <div className="js-hero-photo-box">
              <img src={avatarUrl || '/images/default-avatar.png'} alt={profile.name} className="js-hero-img" />
              
              {/* Top Left: Back Arrow */}
              <div className="js-top-left-overlay">
                <div className="js-circle-back" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft size={24} color="#fff" />
                </div>
              </div>

              {/* Top Right: Badges */}
              <div className="js-top-right-overlay">
                <div className="js-badge-row">
                  {allPhotos.length > 0 && (
                    <div className="js-premium-badge" onClick={(e) => { e.stopPropagation(); setShowPhotoModal(true); }}>
                      <ImageIcon size={18} color="#1e293b" />
                      <span>{allPhotos.length}</span>
                    </div>
                  )}
                  <div className="js-premium-badge share" onClick={() => setShowShareModal(true)}>
                    <Share2 size={18} color="#1e293b" />
                  </div>
                </div>
              </div>

              {/* BOTTOM CONTENT OVERLAY (Matching ProfileCard) */}
              <div className="js-bottom-info-overlay">
                <div className="js-name-row">
                  <h2 className="js-candidate-name">{profile.name},</h2>
                  <span className="js-candidate-age">{age} yrs,</span>
                  <span className="js-candidate-id">{profile.profile_id}</span>
                </div>
                
                <div className="js-managed-by">
                  Profile managed by {profile.profile_for || 'Self'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ANCHOR NAVIGATION */}
        <div className="js-profile-anchors">
          <button onClick={() => scrollToSection(aboutRef)}>About</button>
          <button onClick={() => scrollToSection(basicRef)}>Basic</button>
          <button onClick={() => scrollToSection(careerRef)}>Career</button>
          <button onClick={() => scrollToSection(locationRef)}>Location</button>
          <button onClick={() => scrollToSection(contactRef)}>Contact</button>
        </div>

        {/* DETAILED CONTENT */}
        <div className="js-profile-details-content">
          <div ref={aboutRef} className="js-detail-card js-bio-card">
            <div className="js-card-header">
              <UserIcon size={18} />
              <h3>About {profile.name}</h3>
            </div>
            <p className="js-bio-text">{profile.bio || "No description provided."}</p>
          </div>

          <div ref={basicRef} className="js-detail-card">
            <div className="js-card-header">
              <Info size={18} />
              <h3>Basic Information</h3>
            </div>
            <div className="js-info-list">
              {[
                { label: 'Religion', value: profile.religion },
                { label: 'Caste', value: profile.caste },
                { label: 'Height', value: profile.height ? `${profile.height} cm` : null },
                { label: 'Mother Tongue', value: profile.mother_tongue },
                { label: 'Marital Status', value: profile.marital_status?.replace(/_/g, ' ') },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="js-info-item">
                  <span className="js-info-label">{item.label}</span>
                  <span className="js-info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={careerRef} className="js-detail-card">
            <div className="js-card-header">
              <Briefcase size={18} />
              <h3>Education & Career</h3>
            </div>
            <div className="js-info-list">
              {[
                { label: 'Education', value: profile.education },
                { label: 'Profession', value: profile.profession },
                { label: 'Income', value: profile.income },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="js-info-item">
                  <span className="js-info-label">{item.label}</span>
                  <span className="js-info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={locationRef} className="js-detail-card">
            <div className="js-card-header">
              <MapPin size={18} />
              <h3>Location & Lifestyle</h3>
            </div>
            <div className="js-info-list">
              {[
                { label: 'City', value: profile.city },
                { label: 'State', value: profile.state },
                { label: 'Country', value: profile.country },
                { label: 'Eating', value: profile.eating_habits },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="js-info-item">
                  <span className="js-info-label">{item.label}</span>
                  <span className="js-info-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={contactRef} className="js-detail-card js-contact-card">
            <div className="js-card-header">
              <Phone size={18} />
              <h3>Contact Details</h3>
            </div>
            <div className="js-info-list">
              <div className="js-info-item">
                <span className="js-info-label"><Mail size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Email ID</span>
                <span className="js-info-value blurred">{maskEmail(profile.email || profile.contact_details?.email)}</span>
              </div>
              <div className="js-info-item">
                <span className="js-info-label"><Phone size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Mobile Number</span>
                <span className="js-info-value blurred">{maskPhone(profile.mobile || profile.contact_details?.mobile)}</span>
              </div>
            </div>
            <p className="js-contact-hint">Visible after interest is accepted</p>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTIONS (Matching ProfileCard logic) */}
      {!isOwn && (
        <div className="js-sticky-action-bar">
          <button 
            className={`js-circle-action ${interestStatus?.status === 'pending' ? 'sent' : ''}`}
            onClick={handleSendInterest}
            disabled={sending || interestStatus?.status === 'pending'}
          >
            <div className="js-icon-circle">
              {interestStatus?.status === 'pending' ? <CheckCircle size={24} fill="#D63447" color="#fff" /> : <Heart size={24} color="#fff" />}
            </div>
            <span>{interestStatus?.status === 'pending' ? 'Interest Sent' : 'Interest'}</span>
          </button>

          <button 
            className={`js-circle-action ${isShortlisted ? 'active' : ''}`}
            onClick={handleToggleShortlist}
            disabled={shortlisting}
          >
            <div className="js-icon-circle">
              <Star size={24} fill={isShortlisted ? "#fff" : "none"} color="#fff" />
            </div>
            <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
          </button>

          <button className="js-circle-action" onClick={() => navigate('/dashboard')}>
            <div className="js-icon-circle"><X size={24} color="#fff" /></div>
            <span>Ignore</span>
          </button>

          <button className="js-circle-action" onClick={() => navigate(`/chat/${id}`)}>
            <div className="js-icon-circle"><MessageCircle size={24} color="#fff" /></div>
            <span>Chat</span>
          </button>
        </div>
      )}

      {/* TRADITIONAL BIO-DATA MODAL */}
      {showBioDataModal && (
        <div className="js-biodata-overlay" onClick={() => setShowBioDataModal(false)}>
          <div className="js-biodata-modal" onClick={e => e.stopPropagation()}>
            <div className="js-biodata-actions no-print">
              <button className="js-action-btn" onClick={() => window.print()}>
                <Printer size={18} /> Print / Save PDF
              </button>
              <button className="js-close-btn" onClick={() => setShowBioDataModal(false)}>
                <CloseIcon size={24} />
              </button>
            </div>

            <div className="js-biodata-content" id="biodata-to-print">
              <div className="js-biodata-header">
                <div className="js-biodata-symbol">🚩</div>
                <h1>|| विवाह बायो-डाटा ||</h1>
                <h2>Marriage Bio-Data</h2>
              </div>

              <div className="js-biodata-section">
                <h3 className="js-section-title">✨ Personal Details ✨</h3>
                <div className="js-info-grid">
                  <div className="js-info-row"><strong>Full Name:</strong> <span>{profile.name}</span></div>
                  <div className="js-info-row"><strong>Date of Birth:</strong> <span>{new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                  <div className="js-info-row"><strong>Time of Birth:</strong> <span>{profile.tob || 'Not Provided'}</span></div>
                  <div className="js-info-row"><strong>Place of Birth:</strong> <span>{profile.pob || 'Not Provided'}</span></div>
                  <div className="js-info-row"><strong>Height:</strong> <span>{profile.height ? `${Math.floor(profile.height / 30.48)}'${Math.round((profile.height / 2.54) % 12)}"` : 'Not Provided'}</span></div>
                  <div className="js-info-row"><strong>Blood Group:</strong> <span>{profile.blood_group || 'Not Provided'}</span></div>
                </div>
              </div>

              <div className="js-biodata-section">
                <h3 className="js-section-title">📚 Education & Career 📚</h3>
                <div className="js-info-grid">
                  <div className="js-info-row"><strong>Education:</strong> <span>{profile.education}</span></div>
                  <div className="js-info-row"><strong>Profession:</strong> <span>{profile.profession}</span></div>
                  <div className="js-info-row"><strong>Income (Annual):</strong> <span>{profile.salary || 'Not Provided'}</span></div>
                </div>
              </div>

              <div className="js-biodata-section">
                <h3 className="js-section-title">☸️ Horoscope Details ☸️</h3>
                <div className="js-info-grid">
                  <div className="js-info-row"><strong>Religion / Caste:</strong> <span>{profile.religion} - {profile.caste}</span></div>
                  <div className="js-info-row"><strong>Gotra:</strong> <span>{profile.gotra || 'Not Provided'}</span></div>
                  <div className="js-info-row"><strong>Rashi:</strong> <span>{profile.rashi || 'Not Provided'}</span></div>
                  <div className="js-info-row"><strong>Nakshatra:</strong> <span>{profile.nakshatra || 'Not Provided'}</span></div>
                </div>
              </div>

              <div className="js-biodata-section">
                <h3 className="js-section-title">👨‍👩‍👧‍👦 Family Background 👨‍👩‍👧‍👦</h3>
                <div className="js-info-grid">
                  <div className="js-info-row"><strong>Father's Name:</strong> <span>{profile.father_name || 'Not Provided'}</span></div>
                  <div className="js-info-row"><strong>Mother's Name:</strong> <span>{profile.mother_name || 'Not Provided'}</span></div>
                  <div className="js-info-row"><strong>Siblings:</strong> <span>{profile.siblings || 'Not Provided'}</span></div>
                  <div className="js-info-row"><strong>Maternal Uncle:</strong> <span>{profile.maternal_uncle || 'Not Provided'}</span></div>
                </div>
              </div>

              <div className="js-biodata-footer">
                <p>Generated via <strong>SakharPuda Matrimony</strong></p>
                <p>www.sakharpuda.com</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KUNDALI MATCH MODAL */}
      {showKundaliModal && (
        <div className="js-share-modal-overlay" onClick={() => setShowKundaliModal(false)}>
          <div className="js-share-modal-content kundali" onClick={e => e.stopPropagation()}>
            <div className="js-share-header">
              <Sparkles size={32} color="#F47A20" />
              <h3>Guna Milan Match</h3>
              <p>Astrological compatibility between you and {profile.name}</p>
            </div>
            
            <div className="js-kundali-match-result">
              <div className="js-score-circle">
                <span className="js-score-num">28</span>
                <span className="js-score-total">/ 36</span>
              </div>
              <h4>Good Compatibility!</h4>
              <p>According to your birth details, this is a <strong>Shubh Match</strong> for a happy married life.</p>
            </div>

            <button className="js-modal-close-btn" onClick={() => setShowKundaliModal(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* PHOTO MODAL */}
      {showPhotoModal && (
        <div className="js-photo-modal-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="js-photo-modal-content" onClick={e => e.stopPropagation()}>
            <button className="js-modal-close" onClick={() => setShowPhotoModal(false)}><X size={28} /></button>
            <div className="js-photo-vertical-container">
              {allPhotos.map(p => (
                <div key={p.id} className="js-modal-card-wrap">
                  <img src={p.signed_url} alt="Gallery" className="js-modal-vertical-img" />
                </div>
              ))}
              <div className="js-modal-hint">End of album</div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM SHARE MODAL */}
      {showShareModal && (
        <div className="js-share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="js-share-modal-content" onClick={e => e.stopPropagation()}>
            <div className="js-share-header">
              <img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="js-share-logo" />
              <h3>Share Profile</h3>
              <p>Share this match with family and friends</p>
            </div>
            
            <div className="js-share-options">
              <button className="js-share-opt whatsapp" onClick={shareToWhatsApp}>
                <div className="js-opt-icon-big"><MessageCircle size={32} fill="#25D366" color="#fff" /></div>
                <span>WhatsApp</span>
              </button>
              
              <button className="js-share-opt copy" onClick={copyToClipboard}>
                <div className="js-opt-icon-big"><Copy size={28} color="#6366f1" /></div>
                <span>Copy Link</span>
              </button>
              
              <button className="js-share-opt more" onClick={handleNativeShare}>
                <div className="js-opt-icon-big"><Share2 size={28} color="#1e293b" /></div>
                <span>More Apps</span>
              </button>
            </div>
            
            <button className="js-share-cancel" onClick={() => setShowShareModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .vp-page-wrapper { min-height: 100vh; background: #f8fafc; padding-bottom: 80px; }
        .js-view-profile-container { max-width: 1200px; margin: 0 auto; padding: 20px; position: relative; }
        
        /* Swipe Arrows */
        .js-swipe-arrow {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          color: #1e293b;
          transition: all 0.2s;
          backdrop-filter: blur(4px);
        }
        .js-swipe-arrow:hover { background: #fff; color: #D63447; transform: translateY(-50%) scale(1.1); }
        .js-swipe-arrow.left { left: 20px; }
        .js-swipe-arrow.right { right: 20px; }
        
        @media (max-width: 768px) {
          .js-swipe-arrow { width: 44px; height: 44px; }
          .js-swipe-arrow.left { left: 5px; background: rgba(255, 255, 255, 0.4); }
          .js-swipe-arrow.right { right: 5px; background: rgba(255, 255, 255, 0.4); }
        }

        .js-profile-hero { display: flex; justify-content: center; margin-bottom: 20px; }
        .js-hero-card { width: 100%; max-width: 500px; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); background: #fff; }
        .js-hero-photo-box { height: 550px; position: relative; }
        .js-hero-img { width: 100%; height: 100%; object-fit: cover; }
        
        .js-top-left-overlay { position: absolute; top: 20px; left: 20px; z-index: 100; }
        .js-circle-back { 
          width: 44px; height: 44px; background: rgba(0,0,0,0.3); border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; cursor: pointer; 
          backdrop-filter: blur(8px); transition: all 0.2s;
        }
        .js-circle-back:hover { background: rgba(0,0,0,0.5); transform: translateX(-4px); }

        .js-top-right-overlay { position: absolute; top: 20px; right: 20px; z-index: 100; }
        .js-badge-row { display: flex; gap: 10px; align-items: center; }
        
        .js-premium-badge { 
          background: #fff; 
          color: #1e293b; 
          padding: 8px 14px; 
          border-radius: 20px; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 14px; 
          font-weight: 800; 
          cursor: pointer; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }
        /* Bottom Info Overlay (Matching ProfileCard) */
        .js-bottom-info-overlay { 
          position: absolute; 
          bottom: 0; left: 0; right: 0; 
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 70%, transparent 100%); 
          padding: 60px 24px 24px; 
          color: #fff; 
          .js-bottom-info-content { width: 100%; }
        }
        .js-name-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
        .js-candidate-name { font-size: 24px; font-weight: 800; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.3); margin: 0; }
        .js-candidate-age, .js-candidate-id { font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.9); text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .js-managed-by { font-size: 12px; opacity: 0.8; font-style: italic; color: #fff; }

        /* Sticky Action Bar */
        .js-sticky-action-bar {
          position: fixed;
          bottom: 70px; /* Above bottom nav */
          left: 0; right: 0;
          height: 90px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          background: transparent;
          z-index: 1100;
          padding: 0 15px;
          padding-right: 19px; /* Shifted left by ~1mm (+4px to existing padding-right) */
        }

        .js-circle-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }
        .js-circle-action:hover { transform: translateY(-3px); }
        .js-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(0,0,0,0.3);
          transition: all 0.2s;
        }
        .js-circle-action span {
          color: #000000;
          font-size: 11.5px;
          font-weight: 900;
          opacity: 1;
          margin-top: 4px;
          letter-spacing: -0.2px;
          text-shadow: 0 0 1px #000; /* Simulated extra weight */
        }
        .js-circle-action.active .js-icon-circle { background: #D63447; border-color: rgba(214, 52, 71, 0.5); }
        .js-circle-action.sent .js-icon-circle { background: #fff; border-color: #e2e8f0; }
        .js-circle-action.sent span { color: #1e293b; text-shadow: none; }
        .js-circle-action.sent .js-icon-circle svg { color: #D63447; }
        
        /* Premium Share Modal */
        .js-share-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 10001; padding: 20px;
        }
        .js-share-modal-content {
          width: 100%; max-width: 450px; background: #fff;
          border-radius: 30px 30px 24px 24px; padding: 30px 24px;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        
        .js-share-header { text-align: center; margin-bottom: 30px; }
        .js-share-logo { height: 26px; width: auto; margin-bottom: 12px; }
        .js-share-header h3 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 6px; }
        .js-share-header p { font-size: 14px; color: #64748b; }
        
        .js-share-options { display: flex; justify-content: space-around; margin-bottom: 30px; }
        .js-share-opt {
          background: none; border: none; display: flex; flex-direction: column;
          align-items: center; gap: 10px; cursor: pointer; transition: transform 0.2s;
        }
        .js-share-opt:hover { transform: scale(1.1); }
        .js-share-opt span { font-size: 12px; font-weight: 700; color: #1e293b; }
        
        .js-opt-icon-big {
          width: 64px; height: 64px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: #f8fafc; border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .js-share-opt.whatsapp .js-opt-icon-big { background: #f0fdf4; border-color: #dcfce7; }
        .js-share-opt.copy .js-opt-icon-big { background: #eef2ff; border-color: #e0e7ff; }
        
        .js-share-cancel {
          width: 100%; padding: 16px; border-radius: 16px; border: none;
          background: #f1f5f9; color: #1e293b; font-weight: 800; font-size: 15px;
          cursor: pointer; transition: background 0.2s;
        }
        .js-share-cancel:hover { background: #e2e8f0; }

        /* ANCHORS */
        .js-profile-anchors {
          display: flex; gap: 10px; overflow-x: auto; padding: 15px 0;
          position: sticky; top: 60px; background: #f8fafc; z-index: 100;
          scrollbar-width: none; border-bottom: 1px solid #e2e8f0; margin-bottom: 25px;
        }
        .js-profile-anchors::-webkit-scrollbar { display: none; }
        .js-profile-anchors button {
          flex-shrink: 0; padding: 8px 20px; border-radius: 20px;
          background: #fff; border: 1px solid #e2e8f0; color: #475569;
          font-size: 14px; font-weight: 700; cursor: pointer;
        }
        .js-profile-anchors button:hover { border-color: #D63447; color: #D63447; }

        .js-profile-details-content { display: flex; flex-direction: column; gap: 24px; }
        .js-detail-card { background: #fff; border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); scroll-margin-top: 120px; }
        .js-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
        .js-card-header h3 { font-size: 18px; font-weight: 800; margin: 0; color: #1e293b; }
        
        .js-info-list { display: flex; flex-direction: column; gap: 16px; }
        .js-info-item { display: flex; justify-content: space-between; border-bottom: 1px solid #f8fafc; padding-bottom: 8px; }
        .js-info-label { font-size: 13px; color: #64748b; font-weight: 600; }
        .js-info-value { font-size: 14px; color: #1e293b; font-weight: 700; }
        .js-info-value.blurred { filter: blur(4px); opacity: 0.6; user-select: none; }
        
        .js-contact-hint { margin-top: 15px; font-size: 12px; color: #94a3b8; font-style: italic; }

        .js-photo-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 10000; overflow-y: auto; padding: 40px 20px; backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; }
        .js-photo-vertical-container { display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 500px; padding-bottom: 80px; }
        .js-modal-card-wrap { width: 100%; border-radius: 24px; overflow: hidden; height: 550px; background: #1a1a1a; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .js-modal-vertical-img { width: 100%; height: 100%; object-fit: cover; }
        .js-modal-close { position: fixed; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 44px; height: 44px; color: #fff; cursor: pointer; z-index: 10001; }

        @media (max-width: 600px) {
          .js-hero-photo-box, .js-modal-card-wrap { height: 450px; }
        }

        /* USP Bar */
        .js-usp-bar {
          background: #fff; border-bottom: 1px solid #e2e8f0; padding: 12px 0;
          position: sticky; top: 70px; z-index: 900;
        }
        .js-usp-container { max-width: 1200px; margin: 0 auto; display: flex; gap: 12px; padding: 0 20px; }
        .js-usp-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px; border-radius: 12px; border: 1.5px solid #e2e8f0;
          font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          background: #fff; color: #475569;
        }
        .js-usp-btn:hover { border-color: #F47A20; color: #F47A20; background: #fffcf9; }
        .js-usp-btn.guna { border-color: #F47A20; background: #F47A20; color: #fff; }
        .js-usp-btn.guna:hover { background: #ea580c; border-color: #ea580c; }

        /* BioData Modal */
        .js-biodata-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8);
          z-index: 3000; display: flex; align-items: flex-start; justify-content: center;
          overflow-y: auto; padding: 40px 20px; backdrop-filter: blur(4px);
        }
        .js-biodata-modal {
          width: 100%; max-width: 700px; background: #fff;
          border-radius: 12px; overflow: hidden; position: relative;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        .js-biodata-actions {
          padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: space-between; align-items: center;
        }
        .js-action-btn {
          background: #1e293b; color: #fff; border: none; padding: 8px 16px;
          border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;
        }
        .js-close-btn { background: none; border: none; color: #64748b; cursor: pointer; }

        .js-biodata-content {
          padding: 60px; background: #fff; color: #1e293b;
          background-image: radial-gradient(#f1f5f9 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .js-biodata-header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #F47A20; padding-bottom: 20px; }
        .js-biodata-symbol { font-size: 32px; margin-bottom: 10px; }
        .js-biodata-header h1 { font-family: 'Georgia', serif; color: #F47A20; margin-bottom: 5px; font-size: 28px; }
        .js-biodata-header h2 { font-size: 16px; color: #64748b; letter-spacing: 2px; text-transform: uppercase; }

        .js-biodata-section { margin-bottom: 30px; }
        .js-section-title {
          font-size: 14px; text-transform: uppercase; color: #F47A20;
          letter-spacing: 1px; font-weight: 800; border-bottom: 1px solid #fecaca;
          padding-bottom: 8px; margin-bottom: 15px; text-align: center;
        }
        .js-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .js-info-row { font-size: 15px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 5px; }
        .js-info-row strong { color: #475569; display: inline-block; width: 140px; }

        .js-biodata-footer {
          margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0;
          padding-top: 20px; color: #94a3b8; font-size: 12px;
        }

        /* Kundali Results */
        .js-share-modal-content.kundali { max-width: 400px; padding: 40px 30px; text-align: center; border-radius: 20px; }
        .js-kundali-match-result { margin: 30px 0; }
        .js-score-circle {
          width: 120px; height: 120px; border-radius: 50%;
          border: 8px solid #F47A20; margin: 0 auto 20px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #fffcf9;
        }
        .js-score-num { font-size: 36px; font-weight: 900; color: #F47A20; line-height: 1; }
        .js-score-total { font-size: 14px; color: #94a3b8; font-weight: 700; }
        .js-kundali-match-result h4 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .js-kundali-match-result p { font-size: 14px; color: #64748b; line-height: 1.6; }
        .js-modal-close-btn { width: 100%; padding: 12px; background: #1e293b; color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 10px; }

        @media print {
          .no-print { display: none !important; }
          .js-biodata-overlay { background: #fff; padding: 0; display: block; position: static; }
          .js-biodata-modal { box-shadow: none; border-radius: 0; max-width: 100%; border: none; }
          .js-biodata-content { padding: 40px; border: none; }
        }
      `}} />
    </div>
  );
}
