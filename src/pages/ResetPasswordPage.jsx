import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, ArrowLeft, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(password);
      toast.success('Password updated successfully! Redirecting to login...');
      // Logout after password change to force a clean login with the new credentials
      await authService.logout();
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="reset-page-wrapper center-content">
        <Loader2 className="animate-spin" size={48} color="#D63447" />
        <p style={{ marginTop: '20px', fontWeight: '600', color: '#64748b' }}>Verifying security session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="reset-page-wrapper">
        <header className="login-header">
          <div className="login-header-content">
            <Link to="/" className="login-brand">
              <img src="/images/sakharpuda-logo.png" alt="SakharPuda" style={{ height: '28px' }} />
            </Link>
          </div>
        </header>
        <main className="reset-main">
          <div className="reset-card">
            <div className="icon-circle" style={{ background: '#fef2f2' }}>
              <Lock size={24} color="#ef4444" />
            </div>
            <h1 className="reset-title">Invalid Session</h1>
            <p className="reset-subtitle">Your password reset link may be expired or invalid. Please request a new one.</p>
            <div className="reset-footer" style={{ border: 'none', marginTop: '20px' }}>
              <Link to="/login" className="btn btn-primary btn-full">
                Back to Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="reset-page-wrapper">
      <header className="login-header">
        <div className="login-header-content">
          <Link to="/" className="login-brand">
            <img src="/images/sakharpuda-logo.png" alt="SakharPuda" style={{ height: '28px' }} />
          </Link>
        </div>
      </header>

      <main className="reset-main">
        <div className="reset-card">
          <div className="card-header">
            <div className="icon-circle">
              <Lock size={24} color="#D63447" />
            </div>
            <h1 className="reset-title">Set New Password</h1>
            <p className="reset-subtitle">Create a strong password for your account</p>
          </div>

          <form className="reset-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="password">New Password</label>
              <div className="input-with-icon">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat new password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="reset-footer">
            <Link to="/login" className="back-link">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="simple-footer">
        <div className="container">
          <nav className="footer-links">
            <Link to="/login">Member Login</Link>
            <Link to="/register">Register Here</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/help">Help Center/FAQ</Link>
          </nav>
          <div className="footer-copyright">
            &copy; 2024 SakharPuda.com. All rights reserved.
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .reset-page-wrapper {
          min-height: 100vh;
          background-color: #fff;
          display: flex;
          flex-direction: column;
        }

        .reset-page-wrapper.center-content {
          align-items: center;
          justify-content: center;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-header {
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
          padding: 15px 0;
        }

        .login-header-content {
          max-width: 100% !important;
          padding: 0 40px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .reset-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .reset-card {
          background: #fff;
          width: 100%;
          max-width: 400px;
          padding: 40px;
          text-align: center;
        }

        .card-header {
          margin-bottom: 30px;
        }

        .icon-circle {
          width: 56px;
          height: 56px;
          background: #fff5f5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .reset-title {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .reset-subtitle {
          font-size: 14px;
          color: #64748b;
        }

        .reset-form {
          text-align: left;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
        }

        .input-with-icon {
          position: relative;
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.2s;
          background: #f8fafc;
        }

        .input-field:focus {
          outline: none;
          border-color: #D63447;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(214, 52, 71, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #D63447;
          color: white;
          padding: 14px 24px;
          border-radius: 10px;
        }

        .btn-primary:hover {
          background: #b91c1c;
          transform: translateY(-1px);
        }

        .btn-full { width: 100%; }
        .btn-lg { font-size: 16px; }

        .reset-footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #D63447;
        }

        .simple-footer {
          padding: 60px 0 40px;
          border-top: 1px solid #f1f5f9;
          text-align: center;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .footer-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: #D63447;
        }

        .footer-copyright {
          font-size: 13px;
          color: #94a3b8;
        }

        @media (max-width: 640px) {
          .footer-links { gap: 15px; flex-direction: column; }
        }
      `}} />
    </div>
  );
}
