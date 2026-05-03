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
import { useAuth } from '../../hooks/useAuth';
import { differenceInYears, parseISO } from 'date-fns';

/**
 * ProfileCard — Premium card styled after Jeevansathi.com.
 * Shows photo, basic info, and a horizontal action bar.
 */
export default function ProfileCard({ profile, onInterestSent }) {
  const navigate = useNavigate();
  const { user, profile: myProfile } = useAuth();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [interestStatus, setInterestStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const age = profile?.dob
    ? differenceInYears(new Date(), parseISO(profile.dob))
    : null;

  const isOwnProfile = user?.id === profile?.user_id;

  const canSeePhoto = () => {
    if (isOwnProfile) return true;
    if (profile?.photo_visibility === 'public') return true;
    if (profile?.photo_visibility === 'members_only' && user) return true;
    if (profile?.photo_visibility === 'after_mutual_interest' && interestStatus?.status === 'accepted') return true;
    return false;
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
      .catch(() => {});
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

  return (
    <div className="js-premium-card" onClick={() => navigate(`/profile/${profile?.user_id}`)}>
      <div className="js-card-body">
        {/* LEFT: PHOTO BOX */}
        <div className="js-photo-container">
          {canSeePhoto() ? (
            <img src={photoUrl || '/images/default-avatar.png'} alt={profile?.name} className="js-profile-img" />
          ) : (
            <div className="js-photo-placeholder">
              <ImageIcon size={32} strokeWidth={1} />
              <span>Visible after connection</span>
            </div>
          )}
          {profile?.photo_count > 1 && (
            <div className="js-photo-counter">
              <ImageIcon size={12} />
              <span>{profile.photo_count}</span>
            </div>
          )}
        </div>

        {/* RIGHT: INFO BOX */}
        <div className="js-info-container">
          <div className="js-info-top">
            <span className="js-active-now">Active Today</span>
            <div className="js-name-row">
              <h3>{profile?.name}, {age}</h3>
              {profile?.admin_verified && <CheckCircle size={16} fill="#3b82f6" color="#fff" />}
              {profile.is_top_profile && <span className="js-top-profile-badge">Top Profiles</span>}
            </div>
          </div>

          <div className="js-profile-details">
            <p className="js-primary-detail">
              {profile.height ? `${Math.floor(profile.height / 30.48)}ft ${Math.round((profile.height % 30.48) / 2.54)}in` : 'N/A'} • {profile.city || 'Location N/A'} • {profile.caste || 'Caste N/A'}
            </p>
            
            <div className="js-detail-item">
              <Briefcase size={14} className="js-detail-icon" />
              <span>{profile.profession || 'Profession N/A'} • {profile.salary || 'No Income'}</span>
            </div>

            <div className="js-detail-item">
              <GraduationCap size={14} className="js-detail-icon" />
              <span>{profile.education || 'Education N/A'} • {profile.marital_status?.replace('_', ' ') || 'Never Married'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: ACTION BAR */}
      {!isOwnProfile && (
        <div className="js-action-footer" onClick={(e) => e.stopPropagation()}>
          <button 
            className={`js-action-btn interest ${interestStatus ? 'active' : ''}`} 
            onClick={handleSendInterest}
            disabled={sending || interestStatus}
          >
            {interestStatus ? (
              <><CheckCircle size={18} fill="#10b981" color="#fff" /> <span style={{ color: '#10b981' }}>Interest Sent</span></>
            ) : (
              <><Heart size={18} /> <span>Interest</span></>
            )}
          </button>
          
          <button className="js-action-btn">
            <Star size={18} />
            <span>Shortlist</span>
          </button>
          
          <button className="js-action-btn">
            <X size={18} />
            <span>Ignore</span>
          </button>
          
          <button className="js-action-btn" onClick={() => navigate('/inbox')}>
            <MessageCircle size={18} />
            <span>Chat</span>
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .js-premium-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #edf2f7;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
          margin-bottom: 20px;
          max-width: 700px;
        }
        .js-premium-card:hover {
          box-shadow: 0 10px 25px rgba(0,0,0,0.06);
        }

        .js-card-body {
          display: flex;
          padding: 0;
        }

        /* Photo Area */
        .js-photo-container {
          width: 180px;
          height: 240px;
          flex-shrink: 0;
          position: relative;
          background: #f1f5f9;
        }
        .js-profile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .js-photo-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 10px;
          text-align: center;
          padding: 20px;
          gap: 8px;
        }
        .js-photo-counter {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0,0,0,0.6);
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
        }

        /* Info Area */
        .js-info-container {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .js-active-now {
          font-size: 11px;
          color: #10b981;
          font-weight: 700;
          margin-bottom: 4px;
          display: block;
        }
        .js-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .js-name-row h3 {
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .js-top-profile-badge {
          background: #fbbf24;
          color: #92400e;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
          margin-left: auto;
        }

        .js-profile-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .js-primary-detail {
          font-size: 15px;
          color: #475569;
          font-weight: 500;
        }
        .js-detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 13px;
        }
        .js-detail-icon {
          color: #94a3b8;
          flex-shrink: 0;
        }

        /* Action Bar */
        .js-action-footer {
          display: flex;
          border-top: 1px solid #f1f5f9;
          background: #fff;
        }
        .js-action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border: none;
          background: none;
          color: #D63447;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .js-action-btn:not(:last-child) {
          border-right: 1px solid #f1f5f9;
        }
        .js-action-btn:hover {
          background: #fff1f2;
        }
        .js-action-btn.interest.active {
          color: #D63447;
        }

        @media (max-width: 500px) {
          .js-card-body { flex-direction: column; }
          .js-photo-container { width: 100%; height: 300px; }
        }
      `}} />
    </div>
  );
}
