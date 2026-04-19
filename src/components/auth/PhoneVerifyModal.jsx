import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import OTPInput from './OTPInput';
import { phoneService } from '../../services/phoneService';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../hooks/useAuth';

/**
 * PhoneVerifyModal — Collects and verifies mobile number via OTP.
 * On success, updates mobile_verified = true in the database.
 */
export default function PhoneVerifyModal({ isOpen, onClose, onVerified }) {
  const { user, refreshProfile } = useAuth();
  const [step, setStep]         = useState('phone'); // 'phone' | 'otp'
  const [mobile, setMobile]     = useState('');
  const [otp, setOtp]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [e164, setE164]         = useState('');

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    const { isValid, e164: formatted, error } = phoneService.validateMobileFormat(mobile);
    if (!isValid) {
      toast.error(error);
      return;
    }
    setE164(formatted);
    setLoading(true);
    try {
      await phoneService.sendMobileOTP(formatted);
      await profileService.saveMobileNumber(user.id, formatted);
      setStep('otp');
      startResendTimer();
      toast.success('OTP sent to your mobile number');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await phoneService.verifyMobileOTP(e164, otp);
      await profileService.setMobileVerified(user.id);
      await refreshProfile();
      toast.success('Mobile number verified successfully!');
      onVerified?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message || 'Invalid OTP. Please try again.');
      setOtp(''); // clear invalid OTP for easy retry
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('phone');
    setMobile('');
    setOtp('');
    onClose?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Verify Mobile Number" size="sm">
      <div className="phone-verify-modal">
        {step === 'phone' ? (
          <div className="verify-step">
            <p className="verify-desc">
              Verify your mobile to send interests and view contact details.
            </p>
            <Input
              id="mobile-input"
              label="Mobile Number"
              type="tel"
              placeholder="9876543210"
              prefix="+91"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              helperText="10-digit Indian mobile number"
            />
            <Button
              onClick={handleSendOTP}
              loading={loading}
              fullWidth
              disabled={mobile.length !== 10}
            >
              Send OTP
            </Button>
            <p className="verify-note">
              ⚠️ MSG91 integration pending. Use mock OTP: <strong>123456</strong>
            </p>
          </div>
        ) : (
          <div className="verify-step">
            <p className="verify-desc">
              Enter the 6-digit OTP sent to <strong>+91 {mobile}</strong>
            </p>
            <OTPInput value={otp} onChange={setOtp} length={6} disabled={loading} />
            <Button
              onClick={handleVerifyOTP}
              loading={loading}
              fullWidth
              disabled={otp.length < 6}
              style={{ marginBottom: '12px' }}
            >
              Verify OTP
            </Button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '8px' }}>
              <button
                className="link-btn"
                onClick={() => { setStep('phone'); setOtp(''); }}
                style={{ fontSize: '13px' }}
              >
                ← Change number
              </button>
              
              <button
                className="link-btn"
                onClick={handleSendOTP}
                disabled={loading || resendTimer > 0}
                style={{ 
                  fontSize: '13px', 
                  opacity: (loading || resendTimer > 0) ? 0.5 : 1,
                  cursor: (loading || resendTimer > 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
