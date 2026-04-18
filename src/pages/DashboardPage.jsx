import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import InterestList from '../components/interests/InterestList';
import ProfileCard from '../components/profile/ProfileCard';
import PhoneVerifyModal from '../components/auth/PhoneVerifyModal';
import { useAuth } from '../hooks/useAuth';
import { useInterests } from '../hooks/useInterests';
import { searchService } from '../services/searchService';
import { photoService } from '../services/photoService';
import { profileService } from '../services/profileService';
import { differenceInYears, parseISO } from 'date-fns';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile, logout, isAdmin, refreshProfile } = useAuth();
  const { received, sent, loading: loadingInterests, remainingToday, refresh } = useInterests();

  const [tab, setTab]                 = useState('overview');
  const [recentProfiles, setRecent]   = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [profileViewers, setViewers]  = useState([]);
  const [avatarUrl, setAvatarUrl]     = useState(null);
  const [showPhoneModal, setShowPhone] = useState(false);
  const [stats, setStats]             = useState({ viewers: 0, received: 0, sent: 0 });

  const age = profile?.dob ? differenceInYears(new Date(), parseISO(profile.dob)) : null;

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoadingRecent(true);
    try {
      // Always load recent profiles so user can browse
      const recent = await searchService.getRecentProfiles(12);
      setRecent(recent.filter((p) => p.user_id !== user.id));

      // Only load personal data if user has a profile
      if (profile) {
        const [viewers, photo] = await Promise.all([
          profileService.getProfileViewers(user.id),
          photoService.getPrimaryPhoto(user.id),
        ]);
        setViewers(viewers);
        if (photo?.signed_url) setAvatarUrl(photo.signed_url);
      }
    } catch {
      // Fail silently
    } finally {
      setLoadingRecent(false);
    }
  }, [user?.id, profile]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    setStats({ viewers: profileViewers.length, received: received.length, sent: sent.length });
  }, [profileViewers, received, sent]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Outfit, sans-serif' }}>
        {/* Top banner */}
        <div style={{
          background: 'linear-gradient(135deg, #e53935, #d32f2f)', color: 'white',
          padding: '18px 30px', textAlign: 'center', fontSize: '15px',
        }}>
          ⚠️ Your profile is incomplete.{' '}
          <Link to="/create-profile" style={{ color: '#fff', fontWeight: '700', textDecoration: 'underline' }}>
            Complete it now →
          </Link>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 20px' }}>
          <h2 style={{ fontSize: '22px', color: '#333', marginBottom: '20px' }}>
            Browse Profiles
          </h2>
          {loadingRecent ? <Spinner /> : (
            recentProfiles.length > 0 ? (
              <div className="dash-profiles-grid">
                {recentProfiles.map((p) => (
                  <ProfileCard key={p.user_id} profile={p} />
                ))}
              </div>
            ) : (
              <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>
                No profiles yet. Be the first to{' '}
                <Link to="/create-profile" style={{ color: '#00bcd4' }}>create yours!</Link>
              </p>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-profile">
          <Avatar src={avatarUrl} name={profile.name} size="lg" verified={profile.admin_verified} />
          <h3 className="sidebar-name">{profile.name}</h3>
          <p className="sidebar-meta">{age && `${age} yrs`}{profile.city && ` • ${profile.city}`}</p>
          <div className="sidebar-badges">
            {profile.mobile_verified
              ? <Badge variant="success">📱 Phone Verified</Badge>
              : <Button size="sm" variant="warning" onClick={() => setShowPhone(true)}>Verify Phone</Button>
            }
            {profile.admin_verified && <Badge variant="gold">✓ Admin Verified</Badge>}
          </div>
        </div>

        <div className="sidebar-stats">
          <div className="stat-pill"><span>{stats.viewers}</span><small>Viewed You</small></div>
          <div className="stat-pill"><span>{stats.received}</span><small>Received</small></div>
          <div className="stat-pill"><span>{remainingToday}</span><small>Left Today</small></div>
        </div>

        <nav className="sidebar-nav">
          {['overview', 'interests', 'viewers', 'settings'].map((t) => (
            <button
              key={t}
              className={`sidebar-nav-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <Link to="/search">
            <button className="sidebar-nav-btn">🔍 Search</button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <button className="sidebar-nav-btn admin-btn">⚙️ Admin Panel</button>
            </Link>
          )}
        </nav>

        <Button variant="ghost" size="sm" onClick={handleLogout} className="sidebar-logout">
          Sign Out
        </Button>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {tab === 'overview' && (
          <>
            <div className="dash-section-header">
              <h2>Welcome back, {profile.name?.split(' ')[0]}! 👋</h2>
              {!profile.mobile_verified && (
                <div className="dash-alert">
                  ⚠️ Verify your mobile to send interests.{' '}
                  <button className="link-btn" onClick={() => setShowPhone(true)}>Verify now →</button>
                </div>
              )}
            </div>

            <h3 className="dash-section-title">Recent Profiles</h3>
            {loadingRecent ? <Spinner /> : (
              <div className="dash-profiles-grid">
                {recentProfiles.map((p) => (
                  <ProfileCard key={p.user_id} profile={p} onInterestSent={refresh} />
                ))}
              </div>
            )}

            {received.filter((i) => i.status === 'pending').length > 0 && (
              <div className="dash-pending-banner">
                <span>💌 You have {received.filter((i) => i.status === 'pending').length} pending interest(s)</span>
                <button className="link-btn" onClick={() => setTab('interests')}>View →</button>
              </div>
            )}
          </>
        )}

        {tab === 'interests' && (
          <div>
            <h2 className="dash-section-title">Interests Received</h2>
            <InterestList interests={received} type="received" onUpdate={refresh} />
            <h2 className="dash-section-title" style={{ marginTop: '2rem' }}>Interests Sent</h2>
            <InterestList interests={sent} type="sent" onUpdate={refresh} />
          </div>
        )}

        {tab === 'viewers' && (
          <div>
            <h2 className="dash-section-title">Who Viewed Your Profile</h2>
            {profileViewers.length === 0 ? (
              <p className="dash-empty">No profile views yet.</p>
            ) : (
              <div className="viewers-list">
                {profileViewers.map((v) => (
                  <div key={v.viewer_id + v.viewed_at} className="viewer-item">
                    <Avatar name={v.profiles?.name} size="sm" />
                    <div>
                      <strong>{v.profiles?.name || 'Someone'}</strong>
                      <span className="viewer-meta"> • {v.profiles?.city}</span>
                    </div>
                    <Link to={`/profile/${v.viewer_id}`}>
                      <Button size="sm" variant="ghost">View →</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div>
            <h2 className="dash-section-title">Profile Settings</h2>
            <div className="settings-card">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {profile.mobile_verified ? '✅ Verified' : '❌ Not Verified'}</p>
              <p><strong>Interests remaining today:</strong> {remainingToday}/10</p>
              <p><strong>Admin verified:</strong> {profile.admin_verified ? '✅ Yes' : '⏳ Pending'}</p>
              <div className="settings-actions">
                <Link to={`/profile/${user.id}`}><Button variant="outline">View My Profile</Button></Link>
                {!profile.mobile_verified && (
                  <Button onClick={() => setShowPhone(true)}>Verify Mobile</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <PhoneVerifyModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhone(false)}
        onVerified={refreshProfile}
      />
    </div>
  );
}
