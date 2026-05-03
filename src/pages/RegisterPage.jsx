import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import OTPInput from '../components/auth/OTPInput';
import LandingPage from './LandingPage';
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
    const pass = password;
    const isPassValid = pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass);
    if (!isPassValid) {
      toast.error('Password must be at least 8 characters, with one uppercase letter and one number.');
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
    <div className="register-page-wrapper">
      <div className="landing-bg-overlay-wrapper desktop-only">
        <div className="landing-blur-container">
          <LandingPage />
        </div>
        <div className="dark-tint-overlay"></div>
      </div>

      <main className="register-main">
        <div className="register-card">
          <button className="card-back-btn" onClick={() => navigate(-1)} title="Go Back">
            <ArrowLeft size={20} />
          </button>
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
                  placeholder="e.g. Sakhar@2024"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="password-requirements" style={{marginTop: 8, padding: 8, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0'}}>
                  <p style={{fontSize: 11, color: password.length >= 8 ? '#2f855a' : '#718096', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, fontWeight: password.length >= 8 ? 600 : 400}}>
                    {password.length >= 8 ? '✅' : '○'} At least 8 characters
                  </p>
                  <p style={{fontSize: 11, color: /[A-Z]/.test(password) ? '#2f855a' : '#718096', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, fontWeight: /[A-Z]/.test(password) ? 600 : 400}}>
                    {/[A-Z]/.test(password) ? '✅' : '○'} At least one uppercase letter
                  </p>
                  <p style={{fontSize: 11, color: /[0-9]/.test(password) ? '#2f855a' : '#718096', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6, fontWeight: /[0-9]/.test(password) ? 600 : 400}}>
                    {/[0-9]/.test(password) ? '✅' : '○'} At least one number
                  </p>
                </div>
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
          position: relative;
          display: flex;
          flex-direction: column;
          background: transparent;
        }

        .landing-bg-overlay-wrapper {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: -1;
          overflow: hidden;
        }
        .landing-blur-container {
          width: 100%;
          height: 100%;
          filter: none;
          transform: scale(1);
          pointer-events: none;
        }
        .dark-tint-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.2);
          z-index: 1;
        }

        .register-header {
          display: none;
        }

        .card-back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: #f7fafc;
          border: none;
          color: #4a5568;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 20;
        }
        .card-back-btn:hover {
          background: #edf2f7;
          color: #D63447;
        }

        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .register-page-wrapper { background: #fff !important; }
          .register-main { justify-content: flex-start; padding: 0; }
          .register-card { 
            box-shadow: none; 
            padding: 20px; 
            background: #fff; 
            min-height: 100vh;
            border-radius: 0;
            max-width: none;
          }
          .card-back-btn {
            top: 20px;
            left: 20px;
            background: none;
            color: #333;
          }
        }

        .register-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          z-index: 10;
        }

        .register-card {
          background: #fff;
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          position: relative; /* For card-back-btn */
        }
      `}}></style>
    </div>
  );
}
