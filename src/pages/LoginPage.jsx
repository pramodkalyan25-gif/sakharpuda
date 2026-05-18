import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import OTPInput from '../components/auth/OTPInput';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading: authLoading } = useAuth();
  const from = location.state?.from?.pathname || '/dashboard';

  const [mode, setMode] = useState('password'); // 'password' | 'otp_request' | 'otp_verify'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loadingAction, setLoadingAction] = useState(null); // null | 'login' | 'otp' | 'reset'
  const [showPassword, setShowPassword] = useState(false);

  // Redirect when auth loading is done
  useEffect(() => {
    if (!authLoading && user) {
      if (profile) {
        // User has a profile, go to dashboard or intended page
        navigate(from, { replace: true });
      } else {
        // No profile found, redirect to creation wizard
        navigate('/create-profile', { replace: true });
      }
    }
  }, [authLoading, user, profile, navigate, from]);

  // Inject noindex meta tag to prevent search engines from indexing the login page
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // --- Handlers ---

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }
    try {
      const emailExists = await authService.checkEmailExists(email.trim());
      if (!emailExists) {
        throw new Error(`User does not have an account with email "${email.trim()}"`);
      }
      setLoadingAction('login');
      await authService.loginWithPassword(email.trim(), password);
      toast.success('Welcome back! Loading your dashboard...');
      // navigate() is handled by the useEffect above once profile loads
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email.');
      return;
    }
    try {
      const emailExists = await authService.checkEmailExists(email.trim());
      if (!emailExists) {
        throw new Error(`User does not have an account with email "${email.trim()}"`);
      }
      setLoadingAction('otp');
      await authService.sendLoginOTP(email.trim());
      setMode('otp_verify');
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoadingAction('otp');
    try {
      await authService.verifyLoginOTP(email.trim(), otp);
      toast.success('Welcome back! Loading your dashboard...');
      // navigate() is handled by the useEffect above once profile loads
    } catch (err) {
      toast.error(err.message || 'Invalid OTP.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address to reset password.');
      return;
    }
    setLoadingAction('reset');
    try {
      await authService.resetPassword(email.trim());
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="login-page-wrapper">
      <header className="login-header">
        <div className="login-header-content">
          <Link to="/" className="login-brand">
            <img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="header-logo-img" />
          </Link>
          <Link to="/" className="home-link">Home</Link>
        </div>
      </header>

      {/* MAIN LOGIN SECTION */}
      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">
            {mode === 'password' ? (
              <span className="title-with-logo">
                Login to <img src="/images/sakharpuda-logo.png" alt="SakharPuda" className="title-logo" />
              </span>
            ) : mode === 'otp_request' ? 'Login with OTP' : 'Enter OTP'}
          </h1>

          {/* ============ PASSWORD MODE ============ */}
          {mode === 'password' && (
            <form className="login-form" onSubmit={handlePasswordLogin}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Email ID/Mobile No."
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="login-links">
                <a href="#" onClick={handleForgotPassword} className={`forgot-link ${loadingAction === 'reset' ? 'processing' : ''}`}>
                  {loadingAction === 'reset' ? 'Sending Link...' : 'Forgot/Set a new Password'}
                </a>
              </div>

              <div className="login-actions">
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loadingAction}>
                  {loadingAction === 'login' ? "Logging in..." : "Login with Password"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-full btn-lg"
                  onClick={() => setMode('otp_request')}
                  disabled={loadingAction}
                >
                  Login with OTP
                </button>
              </div>
            </form>
          )}

          {/* ============ OTP REQUEST MODE ============ */}
          {mode === 'otp_request' && (
            <form className="login-form" onSubmit={handleSendOTP}>
              <p className="login-hint">Enter your email address to receive a login code.</p>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="login-actions">
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loadingAction}>
                  {loadingAction === 'otp' ? "Sending..." : "Send Login OTP"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-full"
                  onClick={() => setMode('password')}
                >
                  Back to Password Login
                </button>
              </div>
            </form>
          )}

          {/* ============ OTP VERIFY MODE ============ */}
          {mode === 'otp_verify' && (
            <form className="login-form" onSubmit={handleVerifyOTP}>
              <p className="login-hint">We've sent a 6-digit code to <strong>{email}</strong></p>
              <div className="otp-wrapper">
                <OTPInput value={otp} onChange={setOtp} length={6} disabled={loading} />
              </div>
              <div className="login-actions">
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loadingAction || otp.length < 6}>
                  {loadingAction === 'otp' ? "Verifying..." : "Verify & Login"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-full"
                  onClick={() => { setMode('otp_request'); setOtp(''); }}
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          <div className="login-footer">
            New to SakharPuda? <Link to="/register" className="register-link">Register Here</Link>
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

      <style dangerouslySetInnerHTML={{
        __html: `
        .login-page-wrapper {
          min-height: 100vh;
          background-color: #fff;
          display: flex;
          flex-direction: column;
          font-family: 'Cabin', sans-serif;
        }

        .login-header {
          background: #fff;
          border-bottom: 1px solid #ddd;
          padding: 8px 0;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .login-header-content {
          max-width: 100% !important;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .home-link {
          color: #D9475C;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.2s;
          padding: 6px 16px;
          border: 1.5px solid #D9475C;
          border-radius: 4px;
        }

        .home-link:hover {
          background: #D9475C;
          color: #fff;
          transform: translateY(-1px);
        }

        .login-brand {
          font-size: 24px;
          font-weight: 800;
          text-decoration: none;
        }

        .brand-pink { color: #D63447; }

        .header-logo-img {
          height: 28px;
          width: auto;
          display: block;
        }

        .login-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-item {
          font-size: 14px;
          font-weight: 600;
          color: #444;
          cursor: pointer;
        }

        .arrow { font-size: 10px; margin-left: 4px; }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-left: 20px;
        }

        .nav-link {
          font-size: 14px;
          font-weight: 600;
          color: #D63447;
          text-decoration: none;
        }

        .login-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 50px 20px 60px;
          background: #fff;
        }



        .login-card {
          background: #fff;
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border-radius: 8px;
        }

        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 24px;
          text-align: center;
        }

        .title-with-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .title-logo {
          height: 22px;
          width: auto;
          vertical-align: middle;
        }

        .login-hint {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-bottom: 24px;
        }

        .otp-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
        }

        /* Override OTPInput styles to match theme */
        .otp-container { display: flex; gap: 8px; }
        .otp-input {
          width: 40px; height: 50px;
          text-align: center; font-size: 20px; font-weight: 700;
          border: 1px solid #ccc; border-radius: 4px;
        }
        .otp-input:focus { border-color: #D63447; outline: none; }

        .password-group {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #888;
        }

        .login-links {
          margin-bottom: 24px;
          text-align: left;
        }

        .forgot-link {
          font-size: 13px;
          color: #D63447;
          font-weight: 600;
        }

        .forgot-link.processing {
          opacity: 0.7;
          pointer-events: none;
        }

        .login-actions {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .btn-full { width: 100%; }

        .btn-ghost {
          background: transparent;
          color: #666;
          font-size: 14px;
        }

        .login-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }

        .register-link {
          color: #D63447;
          font-weight: 700;
          text-decoration: none;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .simple-footer {
          padding: 30px 0 40px;
          border-top: 1px solid #f1f5f9;
          margin-top: 20px;
          text-align: center;
          background: #fff;
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
          .login-header-content { padding: 0 20px; }
          .login-card { padding: 30px 20px; }
          .footer-links { gap: 20px; }
          .header-logo-img { height: 26px; }
          .home-link { padding: 5px 12px; font-size: 12px; }
        }

        @media (max-width: 480px) {
          .login-header-content { padding: 0 12px; }
        }
      `}} />
    </div>
  );
}
