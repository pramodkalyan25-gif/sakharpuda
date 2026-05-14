import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Heart,
  Star,
  X,
  MessageCircle,
  CheckCircle,
  Briefcase,
  GraduationCap,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { photoService } from '../../services/photoService';
import { interestService } from '../../services/interestService';
import { shortlistService } from '../../services/shortlistService';
import { useAuth } from '../../hooks/useAuth';
import { differenceInYears, parseISO } from 'date-fns';

/**
 * ProfileCard — Premium card styled after Jeevansathi.com.
 * Shows photo, basic info, and a horizontal action bar.
 */
export default function ProfileCard({ profile, onInterestSent, onShortlistToggle }) {
  const navigate = useNavigate();
  const { user, profile: myProfile } = useAuth();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [interestStatus, setInterestStatus] = useState(null);
  const [isShortlisted, setIsShortlisted] = useState(profile.isShortlisted || false);
  const [sending, setSending] = useState(false);
  const [shortlisting, setShortlisting] = useState(false);

  const age = profile?.dob
    ? differenceInYears(new Date(), parseISO(profile.dob))
    : null;

  const isOwnProfile = user?.id === profile?.user_id;

  // Allow everyone to see photos as per user request
  const canSeePhoto = () => {
    return true;
  };

  useEffect(() => {
    if (!profile?.user_id) return;
    photoService.getPrimaryPhoto(profile.user_id).then(async (photo) => {
      if (!photo?.signed_url) return;
      try {
        if (user?.id && !isOwnProfile) {
          const watermarked = await photoService.applyWatermark(photo.signed_url, user.id);
          setPhotoUrl(watermarked);
        } else {
          setPhotoUrl(photo.signed_url);
        }
      } catch {
        setPhotoUrl(photo.signed_url);
      }
    }).catch(() => setPhotoUrl(null));
  }, [profile?.user_id, user?.id, isOwnProfile]);

  useEffect(() => {
    if (!user?.id || !profile?.user_id || isOwnProfile) return;
    interestService.getInterestStatus(user.id, profile.user_id)
      .then(setInterestStatus)
      .catch(() => { });
  }, [user?.id, profile?.user_id, isOwnProfile]);

  const handleSendInterest = async (e) => {
    e.stopPropagation();
    if (!myProfile) {
      toast.error('Please complete your profile first.');
      navigate('/create-profile');
      return;
    }
    setSending(true);
    try {
      await interestService.sendInterest(user.id, profile.user_id, myProfile);
      setInterestStatus({ status: 'pending', sender_id: user.id });
      toast.success(`Interest sent to ${profile?.name}!`);
      onInterestSent?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleToggleShortlist = async (e) => {
    e.stopPropagation();
    if (!user?.id || !profile?.user_id) {
      toast.error('Unable to shortlist at this time.');
      console.warn('Missing user.id or profile.user_id', { userId: user?.id, targetId: profile?.user_id });
      return;
    }
    setShortlisting(true);
    try {
      const status = await shortlistService.toggleShortlist(user.id, profile.user_id);
      setIsShortlisted(status);
      toast.success(status ? 'Added to shortlist' : 'Removed from shortlist');
      onShortlistToggle?.(status);
    } catch (err) {
      console.error('Shortlist error:', err);
      toast.error('Failed to update shortlist. Please ensure you have run the database migration.');
    } finally {
      setShortlisting(false);
    }
  };

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [allPhotos, setAllPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photoCount, setPhotoCount] = useState(profile?.photo_count || 0);

  useEffect(() => {
    // If photo_count isn't in the profile prop, fetch it
    if (profile?.user_id && !profile.photo_count) {
      photoService.getUserPhotos(profile.user_id).then(photos => {
        setPhotoCount(photos.length);
        setAllPhotos(photos);
      }).catch(() => {});
    }
  }, [profile?.user_id, profile?.photo_count]);

  const handleOpenGallery = async (e) => {
    e.stopPropagation();
    if (!profile?.user_id) return;
    
    setShowPhotoModal(true);
    if (allPhotos.length === 0) {
      setLoadingPhotos(true);
      try {
        const photos = await photoService.getUserPhotos(profile.user_id);
        setAllPhotos(photos);
        setPhotoCount(photos.length);
      } catch (err) {
        toast.error('Failed to load photos');
      } finally {
        setLoadingPhotos(false);
      }
    }
  };

  return (
    <div className="js-premium-card" onClick={() => navigate(`/profile/${profile?.user_id}`)}>
      <div className="js-card-content">
        {/* PHOTO BOX */}
        <div className="js-photo-container">
          <img src={photoUrl || '/images/default-avatar.png'} alt={profile?.name} className="js-profile-img" />
          
          {/* TOP RIGHT: PHOTO COUNTER ICON */}
          <div className="js-top-right-overlay">
            {photoCount > 0 && (
              <div className="js-photo-badge" onClick={handleOpenGallery}>
                <ImageIcon size={16} />
                <span>{photoCount}</span>
              </div>
            )}
          </div>

          {/* BOTTOM CONTENT OVERLAY (Compressed to 1/3) */}
          <div className="js-bottom-info-overlay">
            <div className="js-name-row">
              <h3>{profile?.name}, {age}</h3>
              <span className="js-profile-id-badge">{profile?.profile_id || 'B262450'}</span>
            </div>
            
            <div className="js-quick-details-grid">
              <span>{profile?.height} • {profile?.location} • {profile?.caste}</span>
              <span>{profile?.occupation} • {profile?.education} • {profile?.marital_status}</span>
            </div>

            {/* MANAGED BY LINE */}
            <div className="js-managed-by">
              Profile managed by {profile?.profile_for || 'Self'}
            </div>

            {/* ACTION BUTTONS OVERLAY */}
            {!isOwnProfile && (
              <div className="js-action-overlay">
                <button 
                  className={`js-circle-action ${interestStatus?.status === 'pending' ? 'sent' : ''}`}
                  onClick={handleSendInterest}
                  disabled={sending || interestStatus?.status === 'pending'}
                >
                  <div className="js-icon-circle">
                    {interestStatus?.status === 'pending' ? (
                      <CheckCircle size={22} fill="#D63447" color="#fff" />
                    ) : (
                      <Heart size={22} color="#fff" />
                    )}
                  </div>
                  <span>{interestStatus?.status === 'pending' ? 'Interest Sent' : 'Interest'}</span>
                </button>

                <button 
                  className={`js-circle-action ${isShortlisted ? 'active' : ''}`}
                  onClick={handleToggleShortlist}
                  disabled={shortlisting}
                >
                  <div className="js-icon-circle">
                    <Star size={22} fill={isShortlisted ? "#fff" : "none"} color="#fff" />
                  </div>
                  <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                </button>

                <button className="js-circle-action" onClick={(e) => { e.stopPropagation(); /* Ignore logic */ }}>
                  <div className="js-icon-circle">
                    <X size={22} color="#fff" />
                  </div>
                  <span>Ignore</span>
                </button>

                <button className="js-circle-action" onClick={(e) => { e.stopPropagation(); navigate(`/chat/${profile?.user_id}`); }}>
                  <div className="js-icon-circle">
                    <MessageCircle size={22} color="#fff" />
                  </div>
                  <span>Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PHOTO MODAL (WITH BLUR) */}
      {showPhotoModal && (
        <div className="js-photo-modal-overlay" onClick={(e) => { e.stopPropagation(); setShowPhotoModal(false); }}>
          <div className="js-photo-modal-content" onClick={e => e.stopPropagation()}>
            <button className="js-modal-close" onClick={() => setShowPhotoModal(false)}><X size={28} /></button>
            {loadingPhotos ? (
              <div className="js-modal-loader">Loading photos...</div>
            ) : (
              <div className="js-photo-vertical-container">
                {allPhotos.map(p => (
                  <div key={p.id} className="js-modal-card-wrap">
                    <img src={p.signed_url} alt="Gallery" className="js-modal-vertical-img" />
                  </div>
                ))}
                <div className="js-modal-hint">End of album</div>
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .js-premium-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          cursor: pointer;
        }
        .js-premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }

        .js-photo-container {
          width: 100%;
          height: 550px;
          position: relative;
          background: #f1f5f9;
        }
        @media (max-width: 600px) {
          .js-photo-container { height: 500px; }
        }

        .js-profile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Top Right Overlay - Album Icon */
        .js-top-right-overlay {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 20;
        }
        .js-photo-badge {
          background: rgba(0,0,0,0.6);
          color: #fff;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(8px);
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .js-photo-badge:hover { 
          background: rgba(0,0,0,0.8);
          transform: scale(1.05);
        }

        /* Bottom Info Overlay (Compressed) */
        .js-bottom-info-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 70%, transparent 100%);
          padding: 40px 20px 20px;
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 4px;
          z-index: 15;
        }

        .js-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .js-name-row h3 {
          font-size: 22px;
          font-weight: 800;
          margin: 0;
        }
        .js-profile-id-badge {
          background: rgba(255,255,255,0.15);
          color: #cbd5e1;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .js-quick-details-grid {
          display: flex;
          flex-direction: column;
          font-size: 13px;
          color: #e2e8f0;
          font-weight: 500;
          opacity: 0.9;
        }

        .js-managed-by {
          font-size: 12px;
          font-style: italic;
          color: #94a3b8;
          margin-top: 4px;
        }

        /* Circular Actions */
        .js-action-overlay {
          display: flex;
          justify-content: space-between;
          padding-top: 15px;
          gap: 12px;
        }

        .js-circle-action {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
        }
        .js-icon-circle {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.15);
          transition: all 0.2s;
        }
        .js-circle-action span {
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          opacity: 0.9;
        }
        .js-circle-action.active .js-icon-circle { background: #D63447; border-color: #D63447; }
        .js-circle-action.sent .js-icon-circle { background: #fff; border-color: #fff; }
        .js-circle-action.sent span { color: #10b981; }

        /* Photo Modal with High Blur */
        /* Full-screen Scrollable Modal */
        /* Full-screen Scrollable Modal */
        .js-photo-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.05); /* Minimal darkening */
          backdrop-filter: blur(4px); /* Very subtle blur */
          z-index: 10000;
          overflow-y: auto;
          padding: 100px 20px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .js-photo-modal-content {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
        }

        .js-photo-vertical-container {
          display: flex;
          flex-direction: column;
          gap: 20px; /* Reduced distance to 1/5th (20px) */
          width: 100%;
          padding-bottom: 80px;
        }

        .js-modal-card-wrap {
          width: 100%;
          border-radius: 24px;
          overflow: hidden;
          height: 550px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.3);
          background: #f1f5f9;
        }
        
        @media (max-width: 600px) {
          .js-modal-card-wrap { height: 450px; }
        }
        
        .js-modal-vertical-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .js-modal-close {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          cursor: pointer;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          backdrop-filter: blur(10px);
          transition: all 0.2s;
        }
        .js-modal-close:hover {
          background: rgba(255,255,255,0.4);
          transform: rotate(90deg);
        }

        .js-modal-hint {
          text-align: center;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          margin-top: 20px;
          opacity: 0.8;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .js-modal-loader { 
          color: #fff; 
          text-align: center; 
          margin-top: 100px; 
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}} />
    </div>
  );
}
