import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import OTPInput from '../components/auth/OTPInput';
import { authService } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [mode, setMode] = useState('password'); // 'password' | 'otp_enter' | 'otp_verify'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await authService.loginWithPassword(email.trim(), password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
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
      await authService.sendLoginOTP(email.trim());
      setMode('otp_verify');
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP. Make sure you have an account.');
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
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid OTP. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid #ccc',
    borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const labelStyle = {
    display: 'block', fontSize: '14px', color: '#555', marginBottom: '6px', fontWeight: '500',
  };
  const btnPrimary = {
    width: '100%', padding: '13px', background: '#00bcd4',
    color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px',
    fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
  };
  const btnSecondary = {
    ...btnPrimary, background: '#00a3b8',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '10px', padding: '36px 40px', width: '100%',
        maxWidth: '430px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            background: '#e53935', color: 'white', width: '48px', height: '48px', borderRadius: '10px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 'bold', fontFamily: 'serif',
          }}>M</div>
        </div>

        {/* ============ PASSWORD LOGIN ============ */}
        {mode === 'password' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#444', fontSize: '20px', marginBottom: '24px', fontWeight: '500' }}>
              Welcome back! Please Login
            </h2>
            <form onSubmit={handlePasswordLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email ID</label>
                <input type="email" placeholder="Enter your email" value={email}
                  onChange={e => setEmail(e.target.value)} style={inputStyle} required autoFocus />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <input type="password" placeholder="Enter password" value={password}
                  onChange={e => setPassword(e.target.value)} style={inputStyle} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '13px' }}>
                <label style={{ display: 'flex', alignItems: 'center', color: '#666', cursor: 'pointer', gap: '6px' }}>
                  <input type="checkbox" checked={stayLoggedIn}
                    onChange={e => setStayLoggedIn(e.target.checked)} />
                  Stay Logged in
                </label>
                <a href="#" style={{ color: '#00bcd4', textDecoration: 'none' }}>Forgot Password?</a>
              </div>

              <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1, marginBottom: '14px' }}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', color: '#bbb', margin: '14px 0', fontSize: '12px' }}>
                <div style={{ flex: 1, borderBottom: '1px solid #eee' }} />
                <span style={{ padding: '0 12px' }}>OR</span>
                <div style={{ flex: 1, borderBottom: '1px solid #eee' }} />
              </div>

              <button type="button" onClick={() => setMode('otp_enter')} style={btnSecondary}>
                Login with OTP
              </button>
            </form>
          </>
        )}

        {/* ============ OTP — ENTER EMAIL ============ */}
        {mode === 'otp_enter' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#444', fontSize: '20px', marginBottom: '24px', fontWeight: '500' }}>
              Login with OTP
            </h2>
            <form onSubmit={handleSendOTP}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Email ID</label>
                <input type="email" placeholder="Enter your registered email" value={email}
                  onChange={e => setEmail(e.target.value)} style={inputStyle} required autoFocus />
              </div>
              <button type="submit" disabled={loading || !email.trim()}
                style={{ ...btnPrimary, opacity: (loading || !email.trim()) ? 0.6 : 1, marginBottom: '14px' }}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={() => setMode('password')}
                  style={{ background: 'none', border: 'none', color: '#00bcd4', cursor: 'pointer', fontSize: '14px' }}>
                  ← Back to Password Login
                </button>
              </div>
            </form>
          </>
        )}

        {/* ============ OTP — VERIFY CODE ============ */}
        {mode === 'otp_verify' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#444', fontSize: '20px', marginBottom: '8px', fontWeight: '500' }}>
              Enter OTP
            </h2>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '24px' }}>
              We sent a 6-digit code to <strong style={{ color: '#333' }}>{email}</strong>
            </p>
            <form onSubmit={handleVerifyOTP}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <OTPInput value={otp} onChange={setOtp} length={6} disabled={loading} />
              </div>
              <button type="submit" disabled={loading || otp.length < 6}
                style={{ ...btnPrimary, opacity: (loading || otp.length < 6) ? 0.6 : 1, marginBottom: '14px' }}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={() => { setMode('otp_enter'); setOtp(''); }}
                  style={{ background: 'none', border: 'none', color: '#00bcd4', cursor: 'pointer', fontSize: '14px' }}>
                  ← Change Email
                </button>
              </div>
            </form>
          </>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '28px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>New to ManglaSutra? </span>
          <Link to="/register" style={{ color: '#333', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
            Sign Up Free &gt;
          </Link>
        </div>
      </div>
    </div>
  );
}
