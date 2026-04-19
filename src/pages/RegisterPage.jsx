import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import OTPInput from '../components/auth/OTPInput';
import { authService } from '../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('signup'); // 'signup' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authService.signupWithPassword(email.trim(), password);
      setStep('otp');
      toast.success('Account created! Check your email for the verification code.');
    } catch (err) {
      if (err.message?.toLowerCase().includes('network') || err.message?.toLowerCase().includes('fetch')) {
        toast.error('Network error. Please check your internet connection.');
      } else if (err.message?.toLowerCase().includes('rate limit') || err.status === 429) {
        toast.error('Too many requests. Please wait 60 seconds.');
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
      toast.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await authService.verifySignupOTP(email.trim(), otp);
      toast.success('Email verified! Let\'s build your profile.');
      navigate('/create-profile', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid code. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid #ccc',
    borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };
  const labelStyle = {
    display: 'block', fontSize: '14px', color: '#555',
    marginBottom: '6px', fontWeight: '500',
  };
  const btnStyle = {
    width: '100%', padding: '13px', background: 'linear-gradient(135deg, #26c6da, #00bcd4)',
    color: 'white', border: 'none', borderRadius: '30px', fontSize: '16px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginTop: '10px',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '40px 44px', width: '100%',
        maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '36px' }}>💍</span>
          <h2 style={{ color: '#e53935', fontSize: '22px', margin: '6px 0 0', fontFamily: 'serif' }}>ManglaSutra</h2>
        </div>

        {step === 'signup' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#333', fontSize: '20px', marginBottom: '6px' }}>
              Create Your Account
            </h2>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '24px' }}>
              Start your journey to finding your life partner
            </p>

            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email Address</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} style={inputStyle} required autoFocus />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Create Password</label>
                <input type="password" placeholder="Minimum 6 characters" value={password}
                  onChange={e => setPassword(e.target.value)} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" placeholder="Re-enter your password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} required />
              </div>

              <button type="submit" disabled={loading} style={{
                ...btnStyle, opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Creating Account...' : 'Sign Up Free →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#999', marginTop: '12px', lineHeight: 1.6 }}>
              By signing up, you agree to our <a href="#" style={{color:'#00bcd4'}}>Privacy Policy</a> and <a href="#" style={{color:'#00bcd4'}}>T&C</a>.
            </p>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#333', fontSize: '20px', marginBottom: '6px' }}>
              Verify Your Email
            </h2>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '24px' }}>
              Enter the 6-digit code sent to <strong style={{color:'#333'}}>{email}</strong>
            </p>

            <form onSubmit={handleVerifyOTP}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <OTPInput value={otp} onChange={setOtp} length={6} disabled={loading} />
              </div>
              <button type="submit" disabled={loading || otp.length < 6} style={{
                ...btnStyle, opacity: (loading || otp.length < 6) ? 0.6 : 1,
              }}>
                {loading ? 'Verifying...' : 'Verify & Continue →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button onClick={() => { setStep('signup'); setOtp(''); }}
                style={{ background: 'none', border: 'none', color: '#00bcd4', cursor: 'pointer', fontSize: '14px' }}>
                ← Change email
              </button>
            </div>
          </>
        )}

        <div style={{
          textAlign: 'center', marginTop: '28px', borderTop: '1px solid #eee', paddingTop: '20px',
        }}>
          <span style={{ color: '#888', fontSize: '14px' }}>Already have an account? </span>
          <Link to="/login" style={{ color: '#00bcd4', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
            Login here →
          </Link>
        </div>
      </div>
    </div>
  );
}
