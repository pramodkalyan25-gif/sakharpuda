import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Lock, 
  Bell, 
  Eye, 
  ChevronRight, 
  Smartphone,
  Mail,
  Trash2
} from 'lucide-react';
import TopNav from '../components/ui/TopNav';
import Sidebar from '../components/ui/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { profileService } from '../services/profileService';
import { authService } from '../services/authService';

export default function SettingsPage() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  // Form States
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [privacy, setPrivacy] = useState({
    profile_visibility: profile?.profile_visibility || 'public',
    photo_visibility: profile?.photo_visibility || 'public'
  });

  const settingsSections = [
    { id: 'account', label: 'Account Settings', icon: <Settings size={18} /> },
    { id: 'privacy', label: 'Privacy Settings', icon: <Eye size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  const handleUpdatePrivacy = async (key, value) => {
    setLoading(true);
    try {
      await profileService.updateProfile(user.id, { [key]: value });
      setPrivacy(prev => ({ ...prev, [key]: value }));
      toast.success('Privacy settings updated!');
      refreshProfile();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(passwords.new);
      toast.success('Password updated successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your profile? It will no longer be visible to others.')) return;
    setLoading(true);
    try {
      await profileService.updateProfile(user.id, { profile_visibility: 'hidden' });
      toast.success('Profile deactivated successfully.');
      refreshProfile();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('CRITICAL: This will permanently delete your account and all data. This action cannot be undone. Proceed?')) return;
    setLoading(true);
    try {
      await authService.deleteAccount();
      toast.success('Account deleted successfully.');
      logout();
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete account. You may need to re-login to perform this action.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="js-dashboard-wrapper">
      <TopNav />
      
      <main className="js-main-grid container">
        <Sidebar />

        <div className="js-content-area">
          <div className="js-settings-card">
            <header className="js-settings-header">
              <h1>Settings</h1>
              <p>Manage your account preferences and security settings.</p>
            </header>

            <div className="js-settings-layout">
              <aside className="js-settings-nav">
                {settingsSections.map(s => (
                  <button 
                    key={s.id}
                    className={`js-settings-nav-item ${activeTab === s.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(s.id)}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                    <ChevronRight size={16} className="js-chevron" />
                  </button>
                ))}
              </aside>

              <div className="js-settings-content">
                {activeTab === 'account' && (
                  <div className="js-settings-form">
                    <section className="js-form-section">
                      <h3>Contact Information</h3>
                      <div className="js-input-group">
                        <label><Mail size={14} /> Registered Email</label>
                        <input type="email" value={user?.email || ''} disabled />
                        <span className="js-input-hint">Your email is used for account recovery and notifications.</span>
                      </div>
                      <div className="js-input-group">
                        <label><Smartphone size={14} /> Mobile Number</label>
                        <div className="js-verified-input">
                          <input type="text" value={profile?.mobile || profile?.mobile_number || 'Not provided'} disabled />
                          <span className="js-verified-badge">Verified</span>
                        </div>
                      </div>
                    </section>

                    <section className="js-form-section">
                      <h3>Account Status</h3>
                      <div className="js-status-box">
                        <div className="js-status-text">
                          <strong>{profile?.profile_visibility === 'hidden' ? 'Profile Inactive' : 'Active Member'}</strong>
                          <span>{profile?.profile_visibility === 'hidden' ? 'Your profile is currently hidden from other members.' : 'Your profile is currently visible to other members.'}</span>
                        </div>
                        {profile?.profile_visibility !== 'hidden' ? (
                          <button type="button" className="js-btn-outline" onClick={handleDeactivate} disabled={loading}>Deactivate</button>
                        ) : (
                          <button type="button" className="js-btn-primary btn-sm" onClick={() => handleUpdatePrivacy('profile_visibility', 'public')} disabled={loading}>Activate</button>
                        )}
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="js-settings-form">
                    <section className="js-form-section">
                      <h3>Profile Visibility</h3>
                      <div className="js-radio-group">
                        <label className="js-radio-item">
                          <input 
                            type="radio" 
                            name="profile_visibility" 
                            checked={privacy.profile_visibility === 'public'} 
                            onChange={() => handleUpdatePrivacy('profile_visibility', 'public')}
                          />
                          <div className="js-radio-text">
                            <strong>Visible to all</strong>
                            <span>All registered members can see your profile.</span>
                          </div>
                        </label>
                        <label className="js-radio-item">
                          <input 
                            type="radio" 
                            name="profile_visibility" 
                            checked={privacy.profile_visibility === 'hidden'} 
                            onChange={() => handleUpdatePrivacy('profile_visibility', 'hidden')}
                          />
                          <div className="js-radio-text">
                            <strong>Hidden</strong>
                            <span>No one can see your profile. You will not appear in searches.</span>
                          </div>
                        </label>
                      </div>
                    </section>

                    <section className="js-form-section">
                      <h3>Photo Privacy</h3>
                      <div className="js-radio-group">
                        <label className="js-radio-item">
                          <input 
                            type="radio" 
                            name="photo_visibility" 
                            checked={privacy.photo_visibility === 'public'} 
                            onChange={() => handleUpdatePrivacy('photo_visibility', 'public')}
                          />
                          <div className="js-radio-text">
                            <strong>Public</strong>
                            <span>All members can see your photos.</span>
                          </div>
                        </label>
                        <label className="js-radio-item">
                          <input 
                            type="radio" 
                            name="photo_visibility" 
                            checked={privacy.photo_visibility === 'protected'} 
                            onChange={() => handleUpdatePrivacy('photo_visibility', 'protected')}
                          />
                          <div className="js-radio-text">
                            <strong>Protected</strong>
                            <span>Only members you have accepted can see your photos.</span>
                          </div>
                        </label>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'security' && (
                  <form onSubmit={handleChangePassword} className="js-settings-form">
                    <section className="js-form-section">
                      <h3>Change Password</h3>
                      <div className="js-input-group">
                        <label>New Password</label>
                        <input 
                          type="password" 
                          placeholder="Min 8 characters" 
                          value={passwords.new}
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                          required
                        />
                      </div>
                      <div className="js-input-group">
                        <label>Confirm New Password</label>
                        <input 
                          type="password" 
                          placeholder="Repeat new password" 
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                          required
                        />
                      </div>
                      <button type="submit" className="js-btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </section>

                    <section className="js-form-section js-danger-zone">
                      <h3>Danger Zone</h3>
                      <p>Once you delete your account, there is no going back. Please be certain.</p>
                      <button type="button" className="js-btn-danger" onClick={handleDeleteAccount} disabled={loading}>
                        <Trash2 size={16} />
                        Delete Account
                      </button>
                    </section>
                  </form>
                )}

                {activeTab === 'notifications' && (
                  <div className="js-settings-form">
                    <section className="js-form-section">
                      <h3>Email Notifications</h3>
                      <p className="js-section-hint">Notifications are currently enabled for all account activity by default.</p>
                      <div className="js-toggle-list">
                        <div className="js-toggle-item disabled">
                          <div className="js-toggle-text">
                            <strong>New Interests</strong>
                            <span>Notify me when someone sends an interest.</span>
                          </div>
                          <span className="js-enabled-label">Enabled</span>
                        </div>
                        <div className="js-toggle-item disabled">
                          <div className="js-toggle-text">
                            <strong>Accepted Interests</strong>
                            <span>Notify me when someone accepts my interest.</span>
                          </div>
                          <span className="js-enabled-label">Enabled</span>
                        </div>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .js-dashboard-wrapper { min-height: 100vh; background: #f1f2f5; padding-bottom: 50px; }
        .js-main-grid { display: grid; grid-template-columns: 280px 1fr; gap: 20px; margin-top: 20px; align-items: flex-start; }

        .js-settings-card {
          background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .js-settings-header { padding: 30px; border-bottom: 1px solid #f1f5f9; }
        .js-settings-header h1 { font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .js-settings-header p { color: #64748b; font-size: 14px; }

        .js-settings-layout { display: grid; grid-template-columns: 240px 1fr; min-height: 500px; }
        .js-settings-nav { background: #fcfcfd; border-right: 1px solid #f1f5f9; padding: 20px 10px; }
        .js-settings-nav-item {
          display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 15px;
          border: none; background: none; color: #64748b; font-size: 14px; font-weight: 600;
          border-radius: 8px; cursor: pointer; transition: all 0.2s; text-align: left;
        }
        .js-settings-nav-item:hover { background: #f1f5f9; color: #1e293b; }
        .js-settings-nav-item.active { background: #fff; color: #D63447; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .js-settings-nav-item .js-chevron { margin-left: auto; opacity: 0; transition: opacity 0.2s; }
        .js-settings-nav-item.active .js-chevron { opacity: 1; }

        .js-settings-content { padding: 40px; }
        .js-settings-form { max-width: 600px; }
        .js-form-section { margin-bottom: 40px; }
        .js-form-section h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }

        .js-input-group { margin-bottom: 20px; }
        .js-input-group label { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; }
        .js-input-group input { 
          width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: 14px; color: #1e293b; background: #f8fafc;
        }
        .js-input-group input:focus { outline: none; border-color: #D63447; background: #fff; }
        .js-input-hint { font-size: 11px; color: #94a3b8; margin-top: 6px; display: block; }

        .js-verified-input { position: relative; }
        .js-verified-badge {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700;
          padding: 2px 8px; border-radius: 4px;
        }

        .js-status-box {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .js-status-text strong { display: block; font-size: 14px; color: #1e293b; margin-bottom: 4px; }
        .js-status-text span { font-size: 12px; color: #64748b; }

        .js-btn-primary {
          background: #D63447; color: #fff; border: none; padding: 12px 30px;
          border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s;
        }
        .js-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .js-btn-primary.btn-sm { padding: 8px 20px; font-size: 13px; }
        
        .js-btn-outline {
          background: #fff; border: 1px solid #e2e8f0; color: #475569; padding: 8px 20px;
          border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;
        }

        .js-radio-group { display: flex; flex-direction: column; gap: 12px; }
        .js-radio-item {
          display: flex; gap: 15px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer;
          transition: all 0.2s;
        }
        .js-radio-item:hover { border-color: #D63447; background: #fff1f2; }
        .js-radio-text strong { display: block; font-size: 14px; color: #1e293b; margin-bottom: 2px; }
        .js-radio-text span { font-size: 12px; color: #64748b; }

        .js-toggle-list { display: flex; flex-direction: column; gap: 20px; }
        .js-toggle-item { display: flex; justify-content: space-between; align-items: center; }
        .js-toggle-item.disabled { opacity: 0.7; }
        .js-toggle-text strong { display: block; font-size: 14px; color: #1e293b; margin-bottom: 2px; }
        .js-toggle-text span { font-size: 12px; color: #64748b; }
        .js-enabled-label { color: #10b981; font-size: 12px; font-weight: 700; }
        .js-section-hint { font-size: 13px; color: #64748b; margin-bottom: 20px; }

        .js-danger-zone { border-top: 1px solid #fee2e2; padding-top: 30px; margin-top: 20px; }
        .js-danger-zone h3 { color: #dc2626; }
        .js-danger-zone p { font-size: 13px; color: #64748b; margin-bottom: 20px; }
        .js-btn-danger {
          display: flex; align-items: center; gap: 8px; background: #fff;
          border: 1px solid #fee2e2; color: #dc2626; padding: 10px 20px;
          border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .js-btn-danger:hover { background: #dc2626; color: #fff; }

        @media (max-width: 1024px) {
          .js-settings-layout { grid-template-columns: 1fr; }
          .js-settings-nav { display: flex; overflow-x: auto; padding: 15px; gap: 10px; }
          .js-settings-nav-item { white-space: nowrap; width: auto; }
          .js-settings-nav-item .js-chevron { display: none; }
        }
      `}} />
    </div>
  );
}
