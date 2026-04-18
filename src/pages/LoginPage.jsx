import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import OTPInput from '../components/auth/OTPInput';
import { authService } from '../services/authService';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  const [step, setStep]     = useState('email');   // 'email' | 'otp'
  const [email, setEmail]   = useState('');
  const [otp, setOtp]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.loginWithEmail(email.trim());
      setStep('otp');
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP. Try again.');
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
      await authService.verifyOTP(email.trim(), otp);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid OTP. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">💍</span>
          <span className="auth-logo-text">ManglaSutra</span>
        </div>

        {step === 'email' ? (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">Enter your email to receive a login OTP</p>
            </div>
            <form className="auth-form" onSubmit={handleSendOTP} noValidate>
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={!email.trim()}
              >
                Send OTP →
              </Button>
            </form>
            <p className="auth-alt">
              New here? <Link to="/register" className="auth-link">Create a profile</Link>
            </p>
          </>
        ) : (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Enter OTP</h1>
              <p className="auth-subtitle">
                6-digit code sent to <strong>{email}</strong>
              </p>
            </div>
            <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
              <div className="otp-section">
                <OTPInput value={otp} onChange={setOtp} length={6} disabled={loading} />
              </div>
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={otp.length < 6}
              >
                Verify & Login
              </Button>
            </form>
            <div className="auth-back-row">
              <button className="link-btn" onClick={() => { setStep('email'); setOtp(''); }}>
                ← Change email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
