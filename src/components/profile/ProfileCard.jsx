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
 * Shows photo (blurred if not accessible), basic info, interest button.
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

  // Determine if photo should be visible based on visibility setting + interest status
  const canSeePhoto = () => {
    if (isOwnProfile) return true;
    if (profile?.photo_visibility === 'public') return true;
    if (profile?.photo_visibility === 'members_only' && user) return true;
    if (profile?.photo_visibility === 'after_mutual_interest' && interestStatus?.status === 'accepted') return true;
    return false;
  };

  // Load primary photo with signed URL
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

  // Load interest status between current user and this profile
  useEffect(() => {
    if (!user?.id || !profile?.user_id || isOwnProfile) return;
    interestService.getInterestStatus(user.id, profile.user_id)
      .then(setInterestStatus)
      .catch(() => {});
  }, [user?.id, profile?.user_id, isOwnProfile]);

  const handleSendInterest = async (e) => {
    e.stopPropagation();

    if (!myProfile) {
      toast.error('Please complete your profile before sending interest.');
      navigate('/create-profile');
      return;
    }

    setSending(true);
    try {
      // Try sending - the service will enforce limits
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
        toast.error('Please verify your mobile number before sending interest.');
      } else {
        toast.error(err.message);
      }
    } finally {
      setSending(false);
    }
  };

  const handleAcceptInterest = async (e) => {
    e.stopPropagation();
    if (!interestStatus?.id) return;
    setSending(true);
    try {
      await interestService.acceptInterest(interestStatus.id);
      setInterestStatus({ ...interestStatus, status: 'accepted' });
      toast.success(`You and ${profile.name} are now connected!`);
      onInterestSent?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleRejectInterest = async (e) => {
    e.stopPropagation();
    if (!interestStatus?.id) return;
    setSending(true);
    try {
      await interestService.rejectInterest(interestStatus.id);
      setInterestStatus({ ...interestStatus, status: 'rejected' });
      toast('Interest declined.', { icon: '👋' });
      onInterestSent?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  // Determine what button(s) to show
  const renderActionButton = () => {
    if (isOwnProfile) return null;

    // No interest exists — show Send Interest
    if (!interestStatus) {
      const remaining = interestService.getRemainingInterests(myProfile);
      if (remaining === 0) {
        return (
          <Button size="sm" variant="outline" disabled title="Daily limit of 10 interests reached.">
            Limit Reached
          </Button>
        );
      }
      return (
        <Button size="sm" loading={sending} onClick={handleSendInterest}>
          💌 Send Interest
        </Button>
      );
    }

    const { status, sender_id } = interestStatus;

    // Mutual connection — accepted
    if (status === 'accepted') {
      return (
        <Button size="sm" variant="secondary" disabled>
          ✓ Connected
        </Button>
      );
    }

    // I sent it, waiting for response
    if (status === 'pending' && sender_id === user?.id) {
      return (
        <Button size="sm" variant="outline" disabled>
          ⏳ Interest Sent
        </Button>
      );
    }

    // They sent me interest — show Accept/Decline
    if (status === 'pending' && sender_id !== user?.id) {
      return (
        <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
          <Button size="sm" variant="primary" loading={sending} onClick={handleAcceptInterest}>
            ✓ Accept
          </Button>
          <Button size="sm" variant="ghost" loading={sending} onClick={handleRejectInterest}>
            ✗
          </Button>
        </div>
      );
    }

    // Rejected
    if (status === 'rejected') {
      return (
        <Button size="sm" variant="ghost" disabled>
          Declined
        </Button>
      );
    }

    return null;
  };

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
        {canSeePhoto() ? (
          <Avatar src={photoUrl} name={profile.name} size="xl" verified={profile.admin_verified} />
        ) : (
          <div style={{
            width: '100%', height: '180px', background: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)',
            borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '6px',
          }}>
            <span style={{ fontSize: '36px', filter: 'blur(0px)' }}>👤</span>
            <span style={{ fontSize: '11px', color: '#777' }}>🔒 Photo visible after connection</span>
          </div>
        )}
        {profile.admin_verified && (
          <Badge variant="gold" className="card-verified-badge">✓ Verified</Badge>
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

      <div className="profile-card-actions" onClick={(e) => e.stopPropagation()}>
        {renderActionButton()}
      </div>
    </div>
  );
}
