import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import OTPInput from '../components/auth/OTPInput';
import { authService } from '../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep]   = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.signupWithEmail(email.trim());
      setStep('otp');
      toast.success('Account created! Check your email for OTP.');
    } catch (err) {
      if (err.message?.includes('already registered')) {
        toast.error('Email already registered. Please login instead.');
      } else {
        toast.error(err.message || 'Registration failed. Try again.');
      }
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
      toast.success('Email verified! Let\'s build your profile.');
      navigate('/create-profile', { replace: true });
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
        <div className="auth-logo">
          <span className="auth-logo-icon">💍</span>
          <span className="auth-logo-text">ManglaSutra</span>
        </div>

        {step === 'email' ? (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Start your journey to finding your life partner</p>
            </div>
            <form className="auth-form" onSubmit={handleSendOTP} noValidate>
              <Input
                id="register-email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                helperText="We'll send a 6-digit OTP to verify your email"
                required
              />
              <Button type="submit" fullWidth loading={loading} disabled={!email.trim()}>
                Send Verification OTP →
              </Button>
            </form>
            <p className="auth-alt">
              Already have an account? <Link to="/login" className="auth-link">Login here</Link>
            </p>
          </>
        ) : (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Verify Email</h1>
              <p className="auth-subtitle">
                Enter the 6-digit OTP sent to <strong>{email}</strong>
              </p>
            </div>
            <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
              <div className="otp-section">
                <OTPInput value={otp} onChange={setOtp} length={6} disabled={loading} />
              </div>
              <Button type="submit" fullWidth loading={loading} disabled={otp.length < 6}>
                Verify & Continue →
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
