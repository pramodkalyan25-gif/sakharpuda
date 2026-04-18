import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { photoService } from '../../services/photoService';
import { interestService } from '../../services/interestService';
import { useAuth } from '../../hooks/useAuth';
import { differenceInYears, parseISO } from 'date-fns';

/**
 * ProfileCard — Compact card for search results and dashboard lists.
 * Shows signed/watermarked photo, basic info, interest button.
 */
export default function ProfileCard({ profile, onInterestSent }) {
  const navigate           = useNavigate();
  const { user, profile: myProfile } = useAuth();
  const [photoUrl, setPhotoUrl]      = useState(null);
  const [interestStatus, setInterestStatus] = useState(null);
  const [sending, setSending]        = useState(false);

  const age = profile?.dob
    ? differenceInYears(new Date(), parseISO(profile.dob))
    : null;

  // Load primary photo with signed URL
  useEffect(() => {
    if (!profile?.user_id) return;
    photoService.getPrimaryPhoto(profile.user_id).then(async (photo) => {
      if (!photo?.signed_url) return;
      try {
        // Apply watermark if viewer is logged in
        if (user?.id) {
          const watermarked = await photoService.applyWatermark(photo.signed_url, user.id);
          setPhotoUrl(watermarked);
        } else {
          setPhotoUrl(photo.signed_url);
        }
      } catch {
        setPhotoUrl(photo.signed_url);
      }
    }).catch(() => setPhotoUrl(null));
  }, [profile?.user_id, user?.id]);

  // Load interest status
  useEffect(() => {
    if (!user?.id || !profile?.user_id || user.id === profile.user_id) return;
    interestService.getInterestStatus(user.id, profile.user_id)
      .then(setInterestStatus)
      .catch(() => {});
  }, [user?.id, profile?.user_id]);

  const handleSendInterest = async (e) => {
    e.stopPropagation();
    if (!myProfile?.mobile_verified) {
      toast.error('Please verify your mobile number before sending interest.');
      return;
    }
    setSending(true);
    try {
      await interestService.sendInterest(user.id, profile.user_id, myProfile);
      setInterestStatus({ status: 'pending', sender_id: user.id });
      toast.success(`Interest sent to ${profile.name}!`);
      onInterestSent?.();
    } catch (err) {
      if (err.message.includes('DAILY_LIMIT_REACHED')) {
        toast.error('Daily limit reached. You can send 10 interests per day.');
      } else if (err.message.includes('DUPLICATE')) {
        toast.error('You already sent interest to this person.');
      } else if (err.message.includes('PHONE_UNVERIFIED')) {
        toast.error('Please verify your mobile number first.');
      } else {
        toast.error(err.message);
      }
    } finally {
      setSending(false);
    }
  };

  const getInterestButtonLabel = () => {
    if (!interestStatus) return 'Send Interest';
    const { status, sender_id } = interestStatus;
    if (status === 'accepted') return '✓ Connected';
    if (status === 'pending') {
      return sender_id === user?.id ? 'Interest Sent' : 'Respond to Interest';
    }
    if (status === 'rejected') return 'Not Interested';
    return 'Send Interest';
  };

  const isOwnProfile = user?.id === profile?.user_id;

  return (
    <div
      className="profile-card"
      onClick={() => navigate(`/profile/${profile.user_id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/profile/${profile.user_id}`)}
      aria-label={`View ${profile.name}'s profile`}
    >
      <div className="profile-card-photo">
        <Avatar
          src={photoUrl}
          name={profile.name}
          size="xl"
          verified={profile.admin_verified}
        />
        {profile.admin_verified && (
          <Badge variant="gold" className="card-verified-badge">✓ Verified</Badge>
        )}
        {profile.photo_visibility === 'after_mutual_interest' && !photoUrl && (
          <div className="photo-blur-overlay">
            <span>🔒 Photo after interest accepted</span>
          </div>
        )}
      </div>

      <div className="profile-card-info">
        <h3 className="profile-card-name">{profile.name}</h3>
        <p className="profile-card-meta">
          {age && `${age} yrs`}
          {profile.city && ` • ${profile.city}`}
          {profile.religion && ` • ${profile.religion}`}
        </p>
        {profile.education && (
          <p className="profile-card-detail">{profile.education}</p>
        )}
        {profile.profession && (
          <p className="profile-card-detail">{profile.profession}</p>
        )}

        <div className="profile-card-badges">
          {profile.mobile_verified && <Badge variant="success">📱 Verified</Badge>}
          {profile.marital_status === 'never_married' && <Badge variant="info">Never Married</Badge>}
        </div>
      </div>

      {!isOwnProfile && (
        <div className="profile-card-actions" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant={interestStatus?.status === 'accepted' ? 'secondary' : 'primary'}
            onClick={handleSendInterest}
            loading={sending}
            disabled={!!interestStatus || isOwnProfile}
          >
            {getInterestButtonLabel()}
          </Button>
        </div>
      )}
    </div>
  );
}
