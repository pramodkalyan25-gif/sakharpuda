import { supabase } from '../config/supabaseClient';
import { photoService } from './photoService';

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

    // Client-side guard: temporarily disabled as there is no verification mechanism yet
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
      .select('id, status, created_at, is_blocked, sender_id, receiver_id')
      .eq('receiver_id', userId)
      .eq('is_blocked', false)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Fetch sender profiles separately
    const senderIds = [...new Set((data || []).map(i => i.sender_id))];
    if (senderIds.length === 0) return data || [];

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, name, gender, dob, city, religion, education, mobile_verified, caste, profession, marital_status, profile_id')
      .in('user_id', senderIds);

    // Fetch primary photos
    const { data: photosData } = await supabase
      .from('photos')
      .select('user_id, storage_path')
      .in('user_id', senderIds)
      .eq('is_primary', true);

    // Resolve signed URLs in parallel
    const photoMap = {};
    if (photosData && photosData.length > 0) {
      await Promise.all(
        photosData.map(async (photo) => {
          try {
            const signedUrl = await photoService.getSignedUrl(photo.storage_path);
            photoMap[photo.user_id] = signedUrl;
          } catch (e) {
            console.warn('Failed to get signed URL for storage path', photo.storage_path, e);
          }
        })
      );
    }

    const profileMap = {};
    (profilesData || []).forEach(p => {
      p.photo_url = photoMap[p.user_id] || null;
      profileMap[p.user_id] = p;
    });

    return (data || []).map(i => ({ ...i, profiles: profileMap[i.sender_id] || null }));
  },

  /**
   * Get all interests sent by a user (outbox)
   * @param {string} userId
   */
  async getSentInterests(userId) {
    const { data, error } = await supabase
      .from('interests')
      .select('id, status, created_at, sender_id, receiver_id')
      .eq('sender_id', userId)
      .eq('is_blocked', false)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Fetch receiver profiles separately
    const receiverIds = [...new Set((data || []).map(i => i.receiver_id))];
    if (receiverIds.length === 0) return data || [];

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, name, gender, dob, city, religion, education, caste, profession, marital_status, profile_id')
      .in('user_id', receiverIds);

    // Fetch primary photos
    const { data: photosData } = await supabase
      .from('photos')
      .select('user_id, storage_path')
      .in('user_id', receiverIds)
      .eq('is_primary', true);

    // Resolve signed URLs in parallel
    const photoMap = {};
    if (photosData && photosData.length > 0) {
      await Promise.all(
        photosData.map(async (photo) => {
          try {
            const signedUrl = await photoService.getSignedUrl(photo.storage_path);
            photoMap[photo.user_id] = signedUrl;
          } catch (e) {
            console.warn('Failed to get signed URL for storage path', photo.storage_path, e);
          }
        })
      );
    }

    const profileMap = {};
    (profilesData || []).forEach(p => {
      p.photo_url = photoMap[p.user_id] || null;
      profileMap[p.user_id] = p;
    });

    return (data || []).map(i => ({ ...i, profiles: profileMap[i.receiver_id] || null }));
  },

  /**
   * Get mutual interests (both accepted)
   * @param {string} userId
   */
  async getMutualConnections(userId) {
    const { data, error } = await supabase
      .from('interests')
      .select('id, created_at, sender_id, receiver_id')
      .eq('status', 'accepted')
      .eq('is_blocked', false)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    if (error) throw error;

    // Fetch the other party's profile
    const otherIds = (data || []).map(i => i.sender_id === userId ? i.receiver_id : i.sender_id);
    const uniqueIds = [...new Set(otherIds)];
    if (uniqueIds.length === 0) return data || [];

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, name, city, profession, caste, dob, marital_status, profile_id')
      .in('user_id', uniqueIds);

    // Fetch primary photos
    const { data: photosData } = await supabase
      .from('photos')
      .select('user_id, storage_path')
      .in('user_id', uniqueIds)
      .eq('is_primary', true);

    // Resolve signed URLs in parallel
    const photoMap = {};
    if (photosData && photosData.length > 0) {
      await Promise.all(
        photosData.map(async (photo) => {
          try {
            const signedUrl = await photoService.getSignedUrl(photo.storage_path);
            photoMap[photo.user_id] = signedUrl;
          } catch (e) {
            console.warn('Failed to get signed URL for storage path', photo.storage_path, e);
          }
        })
      );
    }

    const profileMap = {};
    (profilesData || []).forEach(p => {
      p.photo_url = photoMap[p.user_id] || null;
      profileMap[p.user_id] = p;
    });

    return (data || []).map(i => {
      const otherId = i.sender_id === userId ? i.receiver_id : i.sender_id;
      return {
        ...i,
        profiles: profileMap[otherId] || null
      };
    });
  },

  /**
   * Get interest status between two users
   * @param {string} userId
   * @param {string} targetId
   */
  async getInterestStatus(userId, targetId) {
    const { data, error } = await supabase
      .from('interests')
      .select('id, status, sender_id, receiver_id, is_blocked')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${targetId}),` +
        `and(sender_id.eq.${targetId},receiver_id.eq.${userId})`
      )
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /**
   * Block a user by targetId.
   * INVARIANT: after block, sender_id always = the blocker (userId).
   * This allows client code to derive block direction as:
   *   weBlockedThem  = is_blocked && sender_id === myId
   *   weAreBlocked   = is_blocked && sender_id !== myId
   */
  async blockUserById(userId, targetId) {
    const { data: interest } = await supabase
      .from('interests')
      .select('id, sender_id')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`)
      .maybeSingle();

    if (interest) {
      if (interest.sender_id === userId) {
        // I am already the sender — just flip the flag
        const { data, error } = await supabase
          .from('interests')
          .update({ is_blocked: true })
          .eq('id', interest.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // I am the receiver in the existing row.
        // Delete + re-insert so sender_id = userId (blocker) — preserving the invariant.
        await supabase.from('interests').delete().eq('id', interest.id);
        const { data, error } = await supabase
          .from('interests')
          .insert({ sender_id: userId, receiver_id: targetId, status: 'rejected', is_blocked: true })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    } else {
      const { data, error } = await supabase
        .from('interests')
        .insert({ sender_id: userId, receiver_id: targetId, status: 'rejected', is_blocked: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  /**
   * Unblock a user by targetId
   */
  async unblockUserById(userId, targetId) {
    const { data: interest } = await supabase
      .from('interests')
      .select('id')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`)
      .maybeSingle();

    if (interest) {
      const { data, error } = await supabase.from('interests').update({ is_blocked: false }).eq('id', interest.id).select().single();
      if (error) throw error;
      return data;
    }
  },

  /**
   * Report a user by targetId (handles if no interest exists)
   */
  async reportUserById(userId, targetId) {
    const { data: interest } = await supabase
      .from('interests')
      .select('id')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`)
      .maybeSingle();

    if (interest) {
      const { data, error } = await supabase.from('interests').update({ is_reported: true }).eq('id', interest.id).select().single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('interests').insert({ sender_id: userId, receiver_id: targetId, status: 'rejected', is_reported: true }).select().single();
      if (error) throw error;
      return data;
    }
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
  /**
   * Withdraw a sent interest (deletes the record)
   * @param {string} interestId
   */
  async withdrawInterest(interestId) {
    const { error } = await supabase
      .from('interests')
      .delete()
      .eq('id', interestId);
    if (error) throw error;
  },

  /**
   * Re-send a previously rejected interest by updating its status back to 'pending'.
   * Used when A (original sender) wants to re-send after B rejected it.
   * @param {string} interestId - the existing interest row id
   */
  async resendInterest(interestId) {
    const { data, error } = await supabase
      .from('interests')
      .update({ status: 'pending' })
      .eq('id', interestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Scenario 13: A was the receiver who rejected B's interest and now wants to send interest to B.
   * The existing row has sender_id=B, receiver_id=A. We delete it and re-insert reversed.
   * @param {string} userId  - A (was the rejecter, now wants to initiate)
   * @param {string} targetId - B (was the original sender)
   * @param {object} senderProfile - A's profile (for daily limit check)
   */
  async switchAndSendInterest(userId, targetId, senderProfile) {
    if (userId === targetId) throw new Error('You cannot send interest to yourself.');

    // Daily limit check
    const today = new Date().toDateString();
    const lastReset = senderProfile?.last_interest_reset
      ? new Date(senderProfile.last_interest_reset).toDateString()
      : null;
    const count = lastReset === today ? (senderProfile?.daily_interest_count || 0) : 0;
    if (count >= DAILY_INTEREST_LIMIT) {
      throw new Error(`DAILY_LIMIT_REACHED: You can only send ${DAILY_INTEREST_LIMIT} interests per day.`);
    }

    // Delete the old row (where targetId was the sender, userId was receiver)
    const { data: existing } = await supabase
      .from('interests')
      .select('id')
      .eq('sender_id', targetId)
      .eq('receiver_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('interests').delete().eq('id', existing.id);
    }

    // Re-insert with userId as the new sender
    const { data, error } = await supabase
      .from('interests')
      .insert({ sender_id: userId, receiver_id: targetId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get total count of pending interests received by a user
   */
  async getPendingCount(userId) {
    const { count, error } = await supabase
      .from('interests')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .eq('is_blocked', false);
    
    if (error) {
      console.warn('getPendingCount error:', error);
      return 0;
    }
    return count || 0;
  }
};
