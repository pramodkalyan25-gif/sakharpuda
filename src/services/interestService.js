import { supabase } from '../config/supabaseClient';

/** Maximum interests a user can send per day */
const DAILY_INTEREST_LIMIT = 10;

/**
 * interestService — Send/receive/manage interest requests.
 * Daily limit enforced both here (client) and in DB trigger (server).
 */
export const interestService = {
  /**
   * Send an interest to another user.
   * Checks: mobile verified, not self, daily limit
   * @param {string} senderId
   * @param {string} receiverId
   * @param {object} senderProfile - includes daily_interest_count, mobile_verified
   */
  async sendInterest(senderId, receiverId, senderProfile) {
    if (senderId === receiverId) {
      throw new Error('You cannot send interest to yourself.');
    }

    // Client-side guard: mobile verification is currently optional
    // (We skipped phone OTP for now based on user requirements)
    // if (!senderProfile?.mobile_verified) {
    //   throw new Error('PHONE_UNVERIFIED: Please verify your mobile number before sending interest.');
    // }

    // Client-side daily limit check (DB trigger is the hard enforcement)
    const today = new Date().toDateString();
    const lastReset = senderProfile.last_interest_reset
      ? new Date(senderProfile.last_interest_reset).toDateString()
      : null;
    const count = lastReset === today ? (senderProfile.daily_interest_count || 0) : 0;

    if (count >= DAILY_INTEREST_LIMIT) {
      throw new Error(`DAILY_LIMIT_REACHED: You can only send ${DAILY_INTEREST_LIMIT} interests per day.`);
    }

    const { data, error } = await supabase
      .from('interests')
      .insert({ sender_id: senderId, receiver_id: receiverId })
      .select()
      .single();

    if (error) {
      if (error.message?.includes('DAILY_LIMIT_REACHED')) {
        throw new Error('DAILY_LIMIT_REACHED: Daily interest limit reached.');
      }
      if (error.code === '23505') {
        throw new Error('DUPLICATE: You have already sent interest to this user.');
      }
      throw error;
    }
    return data;
  },

  /**
   * Accept an interest request (receiver only)
   * @param {string} interestId
   */
  async acceptInterest(interestId) {
    const { data, error } = await supabase
      .from('interests')
      .update({ status: 'accepted' })
      .eq('id', interestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Reject an interest request (receiver only)
   * @param {string} interestId
   */
  async rejectInterest(interestId) {
    const { data, error } = await supabase
      .from('interests')
      .update({ status: 'rejected' })
      .eq('id', interestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get all interests received by a user (inbox)
   * @param {string} userId
   */
  async getReceivedInterests(userId) {
    const { data, error } = await supabase
      .from('interests')
      .select(`
        id, status, created_at, is_blocked,
        sender_id,
        profiles!interests_sender_id_fkey (
          user_id, name, gender, dob, city, religion, education, mobile_verified
        )
      `)
      .eq('receiver_id', userId)
      .eq('is_blocked', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Get all interests sent by a user (outbox)
   * @param {string} userId
   */
  async getSentInterests(userId) {
    const { data, error } = await supabase
      .from('interests')
      .select(`
        id, status, created_at,
        receiver_id,
        profiles!interests_receiver_id_fkey (
          user_id, name, gender, dob, city, religion, education
        )
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Get mutual interests (both accepted)
   * @param {string} userId
   */
  async getMutualConnections(userId) {
    const { data, error } = await supabase
      .from('interests')
      .select(`
        id, created_at,
        sender_id, receiver_id,
        profiles!interests_sender_id_fkey ( user_id, name, city, profession )
      `)
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    if (error) throw error;
    return data;
  },

  /**
   * Get interest status between two users
   * @param {string} userId
   * @param {string} targetId
   */
  async getInterestStatus(userId, targetId) {
    const { data, error } = await supabase
      .from('interests')
      .select('id, status, sender_id, receiver_id')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${targetId}),` +
        `and(sender_id.eq.${targetId},receiver_id.eq.${userId})`
      )
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /**
   * Block a user (women can block profiles from viewing theirs)
   * @param {string} interestId - The interest record to block
   */
  async blockUser(interestId) {
    const { data, error } = await supabase
      .from('interests')
      .update({ is_blocked: true })
      .eq('id', interestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Report an interest/user as spam/inappropriate
   * @param {string} interestId
   */
  async reportUser(interestId) {
    const { data, error } = await supabase
      .from('interests')
      .update({ is_reported: true })
      .eq('id', interestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get today's remaining interest count for the user
   * @param {object} profile - profile object with daily_interest_count + last_interest_reset
   */
  getRemainingInterests(profile) {
    if (!profile) return DAILY_INTEREST_LIMIT;
    const today = new Date().toDateString();
    const lastReset = profile.last_interest_reset
      ? new Date(profile.last_interest_reset).toDateString()
      : null;
    const used = lastReset === today ? (profile.daily_interest_count || 0) : 0;
    return Math.max(0, DAILY_INTEREST_LIMIT - used);
  },
};
