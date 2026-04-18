import { supabase } from '../config/supabaseClient';

/**
 * contactService — Handles phone reveal requests and full contact access.
 *
 * Full phone is ONLY revealed when:
 *   1. mutual interest.status = 'accepted'
 *   2. contact_details.contact_approved = true (set by admin)
 */
export const contactService = {
  /**
   * Submit a request to reveal another user's contact details.
   * Backend RLS enforces mutual interest requirement.
   * @param {string} requesterId - current user
   * @param {string} targetId - user whose contact is requested
   */
  async requestContactReveal(requesterId, targetId) {
    const { data, error } = await supabase
      .from('contact_reveal_requests')
      .insert({ requester_id: requesterId, target_id: targetId })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        throw new Error('DUPLICATE: You have already requested contact details for this user.');
      }
      throw error;
    }
    return data;
  },

  /**
   * Get the full phone number for a target user.
   * RLS on contact_details will block this if conditions aren't met.
   * @param {string} targetId
   */
  async getFullContactDetails(targetId) {
    const { data, error } = await supabase
      .from('contact_details')
      .select('full_mobile, contact_approved')
      .eq('user_id', targetId)
      .single();

    if (error) throw new Error('CONTACT_NOT_ACCESSIBLE: Contact details not yet accessible.');
    if (!data?.contact_approved) {
      throw new Error('CONTACT_NOT_APPROVED: Contact reveal not yet approved by admin.');
    }
    return data.full_mobile;
  },

  /**
   * Get all reveal requests sent by a user
   * @param {string} userId
   */
  async getSentRevealRequests(userId) {
    const { data, error } = await supabase
      .from('contact_reveal_requests')
      .select('id, target_id, status, created_at')
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Check if contact is accessible for a given target
   * Returns: 'accessible' | 'pending' | 'not_requested' | 'not_approved'
   * @param {string} userId - viewer
   * @param {string} targetId - profile being viewed
   */
  async getContactAccessStatus(userId, targetId) {
    // Check if there's an accepted mutual interest
    const { data: interest } = await supabase
      .from('interests')
      .select('status')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${targetId}),` +
        `and(sender_id.eq.${targetId},receiver_id.eq.${userId})`
      )
      .eq('status', 'accepted')
      .maybeSingle();

    if (!interest) return 'no_mutual_interest';

    // Check reveal request status
    const { data: request } = await supabase
      .from('contact_reveal_requests')
      .select('status')
      .eq('requester_id', userId)
      .eq('target_id', targetId)
      .maybeSingle();

    if (!request) return 'not_requested';
    if (request.status === 'pending') return 'pending';
    if (request.status === 'rejected') return 'rejected';

    // Check if contact_approved is true in contact_details
    const { data: contact } = await supabase
      .from('contact_details')
      .select('contact_approved')
      .eq('user_id', targetId)
      .maybeSingle();

    return contact?.contact_approved ? 'accessible' : 'not_approved';
  },
};
