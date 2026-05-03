import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect only when auth loading is done AND profile is fully fetched
  useEffect(() => {
    if (!authLoading && user && profile) {
      navigate(from, { replace: true });
    }
  }, [authLoading, user, profile, navigate, from]);

  // --- Handlers ---

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const emailExists = await authService.checkEmailExists(email.trim());
      if (!emailExists) {
        throw new Error(`User does not have an account with email "${email.trim()}"`);
      }
      await authService.loginWithPassword(email.trim(), password);
      toast.success('Welcome back! Loading your dashboard...');
      // navigate() is handled by the useEffect above once profile loads
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const emailExists = await authService.checkEmailExists(email.trim());
      if (!emailExists) {
        throw new Error(`User does not have an account with email "${email.trim()}"`);
      }
      await authService.sendLoginOTP(email.trim());
      setMode('otp_verify');
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyLoginOTP(email.trim(), otp);
      toast.success('Welcome back! Loading your dashboard...');
      // navigate() is handled by the useEffect above once profile loads
    } catch (err) {
      toast.error(err.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address to reset password.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(email.trim());
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper onboarding-bg">
      {/* HEADER - Matches Jeevansathi Screenshot */}
      <header className="login-header">
        <div className="login-header-content">
          <Link to="/" className="login-brand">
            <img src="/images/logo.png" alt="SakharPuda" style={{ height: '30px' }} />
          </Link>
          <nav className="login-nav">
            <div className="nav-item">Browse Profiles By <span className="arrow">▼</span></div>
            <div className="nav-item">Search <span className="arrow">▼</span></div>
            <div className="nav-item">Help</div>
            <div className="nav-actions">
              <Link to="/login" className="nav-link active">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register for Free</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* MAIN LOGIN SECTION */}
      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">
            {mode === 'password' ? 'Login to ManglaSutra' :
              mode === 'otp_request' ? 'Login with OTP' : 'Enter OTP'}
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
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>

              <div className="login-links">
                <a href="#" onClick={handleForgotPassword} className="forgot-link">Forgot/Set a new Password</a>
              </div>

              <div className="login-actions">
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? "Logging in..." : "Login with Password"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-full btn-lg"
                  onClick={() => setMode('otp_request')}
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
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? "Sending..." : "Send Login OTP"}
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
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || otp.length < 6}>
                  {loading ? "Verifying..." : "Verify & Login"}
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
            New to ManglaSutra? <Link to="/register" className="register-link">Register Now</Link>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .login-page-wrapper {
          min-height: 100vh;
          background-color: #fdf5f6;
          display: flex;
          flex-direction: column;
        }

        .login-header {
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          padding: 12px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .login-header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
        }

        .login-brand {
          font-size: 24px;
          font-weight: 800;
          text-decoration: none;
        }

        .brand-pink { color: #D63447; }

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
          padding: 40px 20px;
          background: #fdf5f6;
        }

        .login-card {
          background: #fff;
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.05);
        }

        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 24px;
          text-align: center;
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

        @media (max-width: 768px) {
          .login-nav { display: none; }
          .login-card { padding: 30px 20px; }
        }
      `}} />
    </div>
  );
}
