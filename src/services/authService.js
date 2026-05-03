import { supabase } from '../config/supabaseClient';

/**
 * authService — All authentication operations.
 * Components never call Supabase directly.
 * Swap this file's internals to migrate to Node.js/JWT backend.
 */
export const authService = {

  // =========================================================
  // SIGN UP (Email + Password → OTP Verification)
  // =========================================================

  /**
   * Register a new account with email + password.
   * Supabase sends a confirmation OTP email automatically.
   * @param {string} email
   * @param {string} password
   */
  async signupWithPassword(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // Supabase returns a fake user with empty identities if email already exists
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error('📧 EMAIL ALREADY IN USE: This email is already registered. Please login instead.');
    }

    return data;
  },

  /**
   * Verify OTP after signup (type: 'signup')
   * @param {string} email
   * @param {string} token - 6-digit OTP
   */
  async verifySignupOTP(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });
    if (error) throw error;
    return data;
  },

  // =========================================================
  // LOGIN — Option 1: Email + Password
  // =========================================================

  /**
   * Login with Email and Password
   * @param {string} email
   * @param {string} password
   */
  async loginWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // =========================================================
  // LOGIN — Option 2: Email + OTP (passwordless)
  // =========================================================

  /**
   * Send OTP to email for login (does NOT create a new account)
   * @param {string} email
   */
  async sendLoginOTP(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('signups not allowed') || msg.includes('not found') || msg.includes('invalid') || error.status === 400) {
        throw new Error('User does not have an account. Please create one first.');
      }
      throw error;
    }
    return data;
  },

  /**
   * Verify OTP for login (type: 'email')
   * @param {string} email
   * @param {string} token - 6-digit OTP
   */
  async verifyLoginOTP(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
    return data;
  },

  // =========================================================
  // PASSWORD RESET
  // =========================================================

  /**
   * Send password reset email
   * @param {string} email
   */
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
  },

  // =========================================================
  // SESSION & UTILITIES
  // =========================================================

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },

  isAdmin(user) {
    return user?.user_metadata?.is_admin === true;
  },

  /**
   * Update current user's password
   * @param {string} newPassword
   */
  async changePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  /**
   * Delete current user's account (destructive)
   * This calls an RPC function that must be defined in Supabase
   */
  async deleteAccount() {
    const { error } = await supabase.rpc('delete_own_user');
    if (error) throw error;
  },

  /**
   * Check if an email is already registered
   */
  async checkEmailExists(email) {
    const { data, error } = await supabase.rpc('check_email_exists', { p_email: email.trim().toLowerCase() });
    if (error) throw error;
    return !!data;
  },

  /**
   * Check if a mobile number is already registered
   */
  async checkMobileExists(mobile) {
    // Extract only digits to match the robust SQL function
    const digits = mobile.replace(/\D/g, '');
    const cleanMobile = digits.length > 10 ? digits.slice(-10) : digits;

    console.log("Checking mobile existence for digits:", cleanMobile);
    const { data, error } = await supabase.rpc('check_mobile_exists', { p_mobile: cleanMobile });
    if (error) {
      console.error("RPC Error in check_mobile_exists:", error);
      throw error;
    }
    return !!data;
  },
};
