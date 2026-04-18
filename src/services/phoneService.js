/**
 * phoneService — Mobile number OTP verification.
 *
 * Currently a PLACEHOLDER structure for MSG91 integration.
 * When ready to integrate:
 *   1. Sign up at https://msg91.com
 *   2. Get AUTH_KEY and create an OTP template
 *   3. Add VITE_MSG91_AUTH_KEY and VITE_MSG91_TEMPLATE_ID to .env
 *   4. Replace the placeholder functions below with actual API calls
 */

const MSG91_AUTH_KEY = import.meta.env.VITE_MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = import.meta.env.VITE_MSG91_TEMPLATE_ID;

export const phoneService = {
  /**
   * Send OTP to a mobile number via MSG91
   * @param {string} mobile - E.164 format e.g. "+919876543210"
   *
   * TODO: Replace this placeholder with real MSG91 API call:
   * POST https://control.msg91.com/api/v5/otp
   * Body: { mobile, authkey, template_id, otp_length: 6 }
   */
  async sendMobileOTP(mobile) {
    if (!MSG91_AUTH_KEY) {
      console.warn('[phoneService] MSG91 not configured. Using mock OTP.');
      // MOCK: In development, log OTP to console
      console.log(`[DEV MOCK] OTP for ${mobile}: 123456`);
      return { success: true, mock: true };
    }

    // TODO: Implement MSG91 API call
    // const response = await fetch('https://control.msg91.com/api/v5/otp', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'authkey': MSG91_AUTH_KEY,
    //   },
    //   body: JSON.stringify({
    //     mobile: mobile.replace('+', ''),
    //     template_id: MSG91_TEMPLATE_ID,
    //     otp_length: 6,
    //   }),
    // });
    // const data = await response.json();
    // if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
    // return data;

    throw new Error('MSG91 integration not yet configured. Add VITE_MSG91_AUTH_KEY to .env');
  },

  /**
   * Verify the OTP entered by user against MSG91
   * @param {string} mobile - E.164 format
   * @param {string} otp - 6-digit OTP entered by user
   *
   * TODO: Replace with real MSG91 verification:
   * GET https://control.msg91.com/api/v5/otp/verify?mobile={mobile}&otp={otp}
   */
  async verifyMobileOTP(mobile, otp) {
    if (!MSG91_AUTH_KEY) {
      console.warn('[phoneService] MSG91 not configured. Using mock verification.');
      // MOCK: Accept "123456" as valid OTP in development
      if (otp === '123456') {
        return { success: true, mock: true };
      }
      throw new Error('Invalid OTP. (Mock: use 123456)');
    }

    // TODO: Implement MSG91 verification
    // const response = await fetch(
    //   `https://control.msg91.com/api/v5/otp/verify?mobile=${mobile.replace('+', '')}&otp=${otp}`,
    //   { headers: { 'authkey': MSG91_AUTH_KEY } }
    // );
    // const data = await response.json();
    // if (data.type !== 'success') throw new Error(data.message || 'OTP verification failed');
    // return data;

    throw new Error('MSG91 integration not yet configured. Add VITE_MSG91_AUTH_KEY to .env');
  },

  /**
   * Resend OTP to same number
   * @param {string} mobile
   *
   * TODO: POST https://control.msg91.com/api/v5/otp/retry
   */
  async resendMobileOTP(mobile) {
    return phoneService.sendMobileOTP(mobile);
  },

  /**
   * Validate mobile number format (E.164 or Indian 10-digit)
   * @param {string} mobile
   */
  validateMobileFormat(mobile) {
    const cleaned = mobile.replace(/\s+/g, '').replace(/^(\+91|91|0)/, '');
    const isValid = /^[6-9]\d{9}$/.test(cleaned);
    return {
      isValid,
      e164: isValid ? `+91${cleaned}` : null,
      error: isValid ? null : 'Please enter a valid 10-digit Indian mobile number',
    };
  },
};
