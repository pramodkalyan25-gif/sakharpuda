import { supabase } from '../config/supabaseClient';

/**
 * authService — All authentication operations.
 * Components never call Supabase directly.
 * Swap this file's internals to migrate to Node.js/JWT backend.
 */
export const authService = {
  /**
   * Send OTP to email for signup (creates account if not exists)
   * @param {string} email
   */
  async signupWithEmail(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Send OTP to email for login (does NOT create account)
   * @param {string} email
   */
  async loginWithEmail(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Verify the 6-digit OTP token entered by the user
   * @param {string} email
   * @param {string} token - 6-digit OTP
   */
  async verifyOTP(email, token) {
    console.log('[authService] Verifying OTP...', { email, token });
    
    // Add a strict 10-second timeout to prevent infinite hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network Timeout: Supabase took too long to respond.')), 10000)
    );

    const supabasePromise = supabase.auth.verifyOtp({
      email,
      token,
      type: 'magiclink', // Changed to magiclink as it covers both new/existing OTP flows more reliably
    });

    try {
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);
      console.log('[authService] OTP Response:', { data, error });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[authService] OTP Error:', err);
      throw err;
    }
  },

  /**
   * Sign out the current user and clear session
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current active session (null if not logged in)
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Get the current authenticated user object
   */
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Subscribe to auth state changes (login, logout, token refresh)
   * @param {Function} callback - (event, session) => void
   * @returns Subscription object with .unsubscribe()
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },

  /**
   * Check if a user has admin privileges
   * Admin flag stored in user metadata
   * @param {object} user - Supabase user object
   */
  isAdmin(user) {
    return user?.user_metadata?.is_admin === true;
  },
};
