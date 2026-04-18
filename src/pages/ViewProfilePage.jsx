import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import PhotoGallery from '../components/profile/PhotoGallery';
import { profileService } from '../services/profileService';
import { interestService } from '../services/interestService';
import { contactService } from '../services/contactService';
import { photoService } from '../services/photoService';
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
  const [fullPhone, setFullPhone]       = useState(null);
  const [sending, setSending]           = useState(false);
  const [revealing, setRevealing]       = useState(false);

  const isOwn = user?.id === id;
  const age   = profile?.dob ? differenceInYears(new Date(), parseISO(profile.dob)) : null;

  // Determine if photo should be visible based on visibility setting + interest status
  const canSeePhoto = () => {
    if (isOwn) return true;
    if (profile?.photo_visibility === 'public') return true;
    if (profile?.photo_visibility === 'members_only' && user) return true;
    if (profile?.photo_visibility === 'after_mutual_interest' && interestStatus?.status === 'accepted') return true;
    return false;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [p, photo] = await Promise.all([
          profileService.getPublicProfile(id),
          photoService.getPrimaryPhoto(id),
        ]);
        setProfile(p);
        if (photo?.signed_url) {
          if (user?.id && !isOwn) {
            const wm = await photoService.applyWatermark(photo.signed_url, user.id).catch(() => photo.signed_url);
            setAvatarUrl(wm);
          } else {
            setAvatarUrl(photo.signed_url);
          }
        }
        if (user?.id && !isOwn) {
          const [interest, contact] = await Promise.all([
            interestService.getInterestStatus(user.id, id),
            contactService.getContactAccessStatus(user.id, id),
          ]);
          setInterestStatus(interest);
          setContactStatus(contact);
          profileService.logProfileView(user.id, id).catch(() => {});
        }
      } catch (err) {
        toast.error('Profile not found');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user?.id, isOwn, navigate]);

  const handleSendInterest = async () => {
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
      if (err.message.includes('DAILY_LIMIT_REACHED')) {
        toast.error('Daily limit reached. You can send 10 interests per day.');
      } else if (err.message.includes('PHONE_UNVERIFIED')) {
        toast.error('Interest sent, but verify your phone for better visibility!');
      } else {
        toast.error(err.message);
      }
    } finally {
      setSending(false);
    }
  };

  const handleAcceptInterest = async () => {
    if (!interestStatus?.id) return;
    setSending(true);
    try {
      await interestService.acceptInterest(interestStatus.id);
      setInterestStatus({ ...interestStatus, status: 'accepted' });
      toast.success(`You and ${profile.name} are now connected!`);
      // Update contact access status as it might have become accessible
      const contact = await contactService.getContactAccessStatus(user.id, id);
      setContactStatus(contact);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleRejectInterest = async () => {
    if (!interestStatus?.id) return;
    setSending(true);
    try {
      await interestService.rejectInterest(interestStatus.id);
      setInterestStatus({ ...interestStatus, status: 'rejected' });
      toast('Interest declined.', { icon: '👋' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleRevealContact = async () => {
    if (contactStatus === 'accessible') {
      setRevealing(true);
      try {
        const phone = await contactService.getFullContactDetails(id);
        setFullPhone(phone);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setRevealing(false);
      }
    } else if (contactStatus === 'not_requested') {
      setRevealing(true);
      try {
        await contactService.requestContactReveal(user.id, id);
        setContactStatus('pending');
        toast.success('Contact reveal request submitted. Pending admin approval.');
      } catch (err) {
        toast.error(err.message);
      } finally {
        setRevealing(false);
      }
    }
  };

  if (loading) return <div className="page-loading"><Spinner size="lg" /></div>;
  if (!profile) return null;

  const sections = [
    { label: 'Age', value: age ? `${age} years` : null },
    { label: 'Religion', value: profile.religion },
    { label: 'Caste', value: profile.caste },
    { label: 'Education', value: profile.education },
    { label: 'Profession', value: profile.profession },
    { label: 'City', value: profile.city },
    { label: 'State', value: profile.state },
    { label: 'Country', value: profile.country },
    { label: 'Marital Status', value: profile.marital_status?.replace(/_/g, ' ') },
    { label: 'Height', value: profile.height ? `${profile.height} cm` : null },
    { label: 'Member Since', value: profile.created_at ? format(parseISO(profile.created_at), 'MMM yyyy') : null },
  ].filter((s) => s.value);

  return (
    <div className="view-profile-page">
      <div className="profile-page-topbar">
        <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
        {isOwn && <Link to="/dashboard"><Button variant="outline" size="sm">Edit Profile</Button></Link>}
      </div>

      <div className="profile-page-layout">
        {/* Left: Photo + Actions */}
        <aside className="profile-left">
          <div className="profile-avatar-wrap">
            {canSeePhoto() ? (
              <Avatar src={avatarUrl} name={profile.name} size="xl" verified={profile.admin_verified} />
            ) : (
              <div style={{
                width: '100%', height: '100%', minHeight: '200px', background: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexDirection: 'column', gap: '6px',
              }}>
                <span style={{ fontSize: '48px', filter: 'blur(0px)' }}>👤</span>
                <span style={{ fontSize: '11px', color: '#777', textAlign: 'center', padding: '0 10px' }}>🔒 Photo visible after connection</span>
              </div>
            )}
          </div>

          <div className="profile-badges-col">
            {profile.mobile_verified && <Badge variant="success">📱 Mobile Verified</Badge>}
            {profile.admin_verified  && <Badge variant="gold">✅ Admin Verified</Badge>}
          </div>

          {!isOwn && (
            <div className="profile-actions-col">
              {/* Interest button */}
              {!interestStatus ? (
                <Button fullWidth loading={sending} onClick={handleSendInterest}>
                  💌 Send Interest
                </Button>
              ) : (
                <Button fullWidth variant="secondary" disabled>
                  {interestStatus.status === 'accepted' ? '✓ Connected' :
                   interestStatus.sender_id === user?.id ? 'Interest Sent' : 'Respond in Dashboard'}
                </Button>
              )}

              {/* Contact reveal */}
              {interestStatus?.status === 'accepted' && (
                <Button
                  fullWidth
                  variant="outline"
                  loading={revealing}
                  onClick={handleRevealContact}
                  disabled={contactStatus === 'pending' || contactStatus === 'not_approved'}
                >
                  {fullPhone
                    ? `📞 ${fullPhone}`
                    : contactStatus === 'accessible' ? '📞 View Contact'
                    : contactStatus === 'pending' ? '⏳ Approval Pending'
                    : contactStatus === 'not_approved' ? '⏳ Admin Reviewing'
                    : '📞 Request Contact'}
                </Button>
              )}
            </div>
          )}
        </aside>

        {/* Right: Details */}
        <main className="profile-right">
          <div className="profile-header-row">
            <h1 className="profile-page-name">{profile.name}</h1>
          </div>

          {profile.bio && (
            <div className="profile-bio-section">
              <h3>About</h3>
              <p className="profile-bio">{profile.bio}</p>
            </div>
          )}

          <div className="profile-details-section">
            <h3>Profile Details</h3>
            <div className="profile-details-grid">
              {sections.map((s) => (
                <div key={s.label} className="detail-item">
                  <span className="detail-label">{s.label}</span>
                  <span className="detail-value">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-gallery-section">
            <h3>Photos</h3>
            <PhotoGallery userId={id} isOwner={isOwn} canSeePhotos={canSeePhoto()} />
          </div>
        </main>
      </div>
    </div>
  );
}
