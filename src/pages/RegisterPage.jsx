import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import OTPInput from '../components/auth/OTPInput';
import { authService } from '../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.initialData || {};

  const [step, setStep] = useState('signup'); // 'signup' | 'otp'
  const [email, setEmail] = useState(initialData.email || '');
  const [password, setPassword] = useState(initialData.password || '');
  const [mobile, setMobile] = useState(initialData.mobile || '');
  const [profileFor, setProfileFor] = useState(initialData.profileFor || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await authService.signupWithPassword(email.trim(), password);
      setStep('otp');
      toast.success('Account created! Check your email for verification.');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await authService.verifySignupOTP(email.trim(), otp);
      toast.success('Verified! Let\'s build your profile.');
      navigate('/create-profile', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid code.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-wrapper onboarding-bg">
      {/* HEADER - Consistent with Login Page */}
      <header className="register-header">
        <div className="register-header-content">
          <Link to="/" className="brand">
            <img src="/images/logo.png" alt="SakharPuda" style={{ height: '30px' }} />
          </Link>
          <div className="header-links">
            <span className="help-link">Help</span>
            <Link to="/login" className="login-link">Login</Link>
          </div>
        </div>
      </header>

      <main className="register-main">
        <div className="register-card">
          <h1 className="register-title">
            {step === 'signup' ? 'Create Your Account' : 'Verify Your Email'}
          </h1>

          {step === 'signup' && (
            <form className="register-form" onSubmit={handleSignup}>
              <div className="input-group">
                <label className="input-label">Profile for</label>
                <select
                  className="input-field"
                  value={profileFor}
                  onChange={(e) => setProfileFor(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  <option value="Self">Self</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? "Processing..." : "Sign Up Free →"}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form className="register-form" onSubmit={handleVerifyOTP}>
              <p className="hint-text">We sent a verification code to <strong>{email}</strong></p>
              <div className="otp-wrapper">
                <OTPInput value={otp} onChange={setOtp} length={6} disabled={loading} />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || otp.length < 6}>
                {loading ? "Verifying..." : "Verify & Continue →"}
              </button>
              <button type="button" className="btn-back" onClick={() => setStep('signup')}>
                ← Change Email
              </button>
            </form>
          )}

          <div className="register-footer">
            Already have an account? <Link to="/login" className="login-redirect">Login here</Link>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .register-page-wrapper {
          min-height: 100vh;
          background-color: #fdf5f6;
          display: flex;
          flex-direction: column;
        }

        .register-header {
          background: #fff;
          border-bottom: 1px solid #eee;
          padding: 15px 0;
        }

        .register-header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
        }

        .brand {
          font-size: 26px;
          font-weight: 800;
          color: #D63447;
          text-decoration: none;
        }

        .header-links {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .help-link { font-size: 14px; color: #666; cursor: pointer; }
        .login-link { color: #D63447; font-weight: 700; text-decoration: none; }

        .register-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .register-card {
          background: #fff;
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
        }

        .register-title {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin-bottom: 32px;
          text-align: center;
        }

        .hint-text {
          text-align: center;
          font-size: 14px;
          color: #666;
          margin-bottom: 32px;
        }

        .otp-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
        }

        /* Override OTPInput styles */
        .otp-container { display: flex; gap: 8px; }
        .otp-input {
          width: 40px; height: 50px;
          text-align: center; font-size: 20px; font-weight: 700;
          border: 1px solid #ccc; border-radius: 4px;
        }
        .otp-input:focus { border-color: #D63447; outline: none; }

        .register-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }

        .login-redirect {
          color: #D63447;
          font-weight: 700;
          text-decoration: none;
        }

        .btn-back {
          background: none;
          border: none;
          color: #666;
          font-size: 14px;
          width: 100%;
          margin-top: 16px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .register-card { padding: 30px 20px; }
        }
      `}} />
    </div>
  );
}
