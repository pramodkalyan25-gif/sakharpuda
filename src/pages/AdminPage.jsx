import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { adminService } from '../services/adminService';
import { useAuth } from '../hooks/useAuth';

const TABS = ['dashboard', 'profiles', 'contact_requests', 'photos', 'reports'];

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab]         = useState('dashboard');
  const [stats, setStats]     = useState(null);
  const [profiles, setProfiles]   = useState([]);
  const [requests, setRequests]   = useState([]);
  const [photos, setPhotos]       = useState([]);
  const [reported, setReported]   = useState([]);
  const [loading, setLoading]     = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const s = await adminService.getPlatformStats();
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const { profiles: p } = await adminService.getAllProfiles();
      setProfiles(p);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      setRequests(await adminService.getPendingRevealRequests());
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const { photos: p } = await adminService.getAllPhotosForModeration();
      setPhotos(p);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReported = useCallback(async () => {
    setLoading(true);
    try {
      setReported(await adminService.getReportedInterests());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'dashboard')        loadStats();
    if (tab === 'profiles')         loadProfiles();
    if (tab === 'contact_requests') loadRequests();
    if (tab === 'photos')           loadPhotos();
    if (tab === 'reports')          loadReported();
  }, [tab]);

  const handleVerify = async (userId, verified) => {
    try {
      await adminService.setProfileVerified(userId, verified);
      toast.success(verified ? 'Profile verified' : 'Profile unverified');
      loadProfiles();
    } catch (err) { toast.error(err.message); }
  };

  const handleContactApprove = async (userId, approved) => {
    try {
      await adminService.setContactApproved(userId, approved);
      toast.success(approved ? 'Contact approved' : 'Contact revoked');
      loadProfiles();
    } catch (err) { toast.error(err.message); }
  };

  const handleResolveRequest = async (id, status) => {
    try {
      await adminService.resolveRevealRequest(id, status);
      toast.success(`Request ${status}`);
      loadRequests();
    } catch (err) { toast.error(err.message); }
  };

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm('Delete this photo permanently?')) return;
    try {
      await adminService.deletePhotoAsAdmin(photo.id, photo.storage_path);
      toast.success('Photo deleted');
      loadPhotos();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <span>⚙️</span>
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {TABS.map((t) => (
            <button
              key={t}
              className={`admin-nav-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </nav>
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">← User Dashboard</Button>
        </Link>
      </div>

      <main className="admin-main">
        {loading && <div className="admin-loading"><Spinner size="lg" /></div>}

        {/* Stats Dashboard */}
        {tab === 'dashboard' && !loading && stats && (
          <div>
            <h2 className="admin-title">Platform Overview</h2>
            <div className="admin-stats-grid">
              {[
                { label: 'Total Profiles',    value: stats.totalProfiles,    icon: '👥' },
                { label: 'Verified Profiles', value: stats.verifiedProfiles, icon: '✅' },
                { label: 'Pending Interests', value: stats.pendingInterests, icon: '💌' },
                { label: 'Total Photos',      value: stats.totalPhotos,      icon: '📸' },
              ].map((s) => (
                <div key={s.label} className="admin-stat-card">
                  <div className="admin-stat-icon">{s.icon}</div>
                  <div className="admin-stat-value">{s.value}</div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Management */}
        {tab === 'profiles' && !loading && (
          <div>
            <h2 className="admin-title">Profile Management</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th><th>City</th><th>Phone</th><th>Admin Verified</th><th>Contact</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.user_id}>
                      <td>
                        <Link to={`/profile/${p.user_id}`} className="admin-profile-link">
                          {p.name}
                        </Link>
                      </td>
                      <td>{p.city || '—'}</td>
                      <td>
                        {p.mobile_verified
                          ? <Badge variant="success">Verified</Badge>
                          : <Badge variant="warning">Pending</Badge>
                        }
                      </td>
                      <td>
                        {p.admin_verified
                          ? <Badge variant="gold">✓ Verified</Badge>
                          : <Badge variant="default">Unverified</Badge>
                        }
                      </td>
                      <td>—</td>
                      <td className="admin-actions">
                        <Button size="sm" variant={p.admin_verified ? 'danger' : 'primary'}
                          onClick={() => handleVerify(p.user_id, !p.admin_verified)}>
                          {p.admin_verified ? 'Unverify' : 'Verify'}
                        </Button>
                        <Button size="sm" variant="outline"
                          onClick={() => handleContactApprove(p.user_id, true)}>
                          Approve Contact
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contact Reveal Requests */}
        {tab === 'contact_requests' && !loading && (
          <div>
            <h2 className="admin-title">Contact Reveal Requests</h2>
            {requests.length === 0 ? <p>No pending requests.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Requester</th><th>Target</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td>{r.profiles?.name || r.requester_id}</td>
                        <td>{r.profiles?.name || r.target_id}</td>
                        <td><Badge variant="warning">{r.status}</Badge></td>
                        <td className="admin-actions">
                          <Button size="sm" variant="primary" onClick={() => handleResolveRequest(r.id, 'approved')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleResolveRequest(r.id, 'rejected')}>
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Photo Moderation */}
        {tab === 'photos' && !loading && (
          <div>
            <h2 className="admin-title">Photo Moderation</h2>
            <div className="admin-photos-grid">
              {photos.map((photo) => (
                <div key={photo.id} className="admin-photo-item">
                  <div className="admin-photo-path">{photo.storage_path.slice(0, 40)}...</div>
                  <div className="admin-photo-meta">
                    <span>{photo.is_primary ? '⭐ Primary' : 'Gallery'}</span>
                  </div>
                  <Button size="sm" variant="danger" onClick={() => handleDeletePhoto(photo)}>
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reported Interests */}
        {tab === 'reports' && !loading && (
          <div>
            <h2 className="admin-title">Reported Interactions</h2>
            {reported.length === 0 ? <p>No reports yet.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>From</th><th>To</th><th>Status</th><th>Reported</th></tr></thead>
                  <tbody>
                    {reported.map((i) => (
                      <tr key={i.id}>
                        <td>{i.profiles?.name || i.sender_id}</td>
                        <td>{i.profiles?.name || i.receiver_id}</td>
                        <td><Badge variant="info">{i.status}</Badge></td>
                        <td><Badge variant="danger">Reported</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
