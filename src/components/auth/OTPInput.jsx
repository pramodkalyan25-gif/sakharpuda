import { useRef, useEffect } from 'react';

/**
 * OTPInput — 6-box OTP digit entry with auto-focus and paste support.
 * @param {string} value - Combined OTP string (e.g. "123456")
 * @param {Function} onChange - Called with new combined string
 * @param {number} length - Number of OTP digits (default 6)
 */
export default function OTPInput({ value = '', onChange, length = 6, disabled = false }) {
  const inputs = useRef([]);

  // Split value into individual digits
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const focusInput = (index) => {
    const target = inputs.current[Math.max(0, Math.min(index, length - 1))];
    target?.focus();
  };

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = val;
    onChange(newDigits.join(''));
    if (val && index < length - 1) focusInput(index + 1);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = '';
        onChange(newDigits.join(''));
      } else if (index > 0) {
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted.padEnd(length, '').slice(0, length));
    focusInput(Math.min(pasted.length, length - 1));
  };

  // Auto-focus first empty input
  useEffect(() => {
    const firstEmpty = digits.findIndex((d) => !d);
    focusInput(firstEmpty === -1 ? length - 1 : firstEmpty);
  }, []);

  return (
    <div className="otp-container" role="group" aria-label="OTP input">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`otp-input ${digit ? 'otp-filled' : ''}`}
          aria-label={`Digit ${i + 1}`}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
        />
      ))}
    </div>
  );
}
