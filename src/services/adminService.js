import { supabase } from '../config/supabaseClient';

/**
 * adminService — Admin panel operations.
 * All functions require admin privileges (enforced in AdminRoute).
 * For production: use Supabase service role key on a secure backend.
 */
export const adminService = {
  /**
   * Get all profiles with admin-visible fields
   * @param {object} options
   */
  async getAllProfiles({ page = 0, limit = 20, filter = {} } = {}) {
    const offset = page * limit;
    let query = supabase
      .from('profiles')
      .select(`
        user_id, name, gender, dob, city, religion, education,
        mobile_verified, admin_verified, profile_visibility, photo_visibility,
        daily_interest_count, created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filter.admin_verified !== undefined) {
      query = query.eq('admin_verified', filter.admin_verified);
    }
    if (filter.mobile_verified !== undefined) {
      query = query.eq('mobile_verified', filter.mobile_verified);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { profiles: data, total: count, page, limit };
  },

  /**
   * Approve or reject a profile (admin_verified flag)
   * @param {string} userId
   * @param {boolean} approved
   */
  async setProfileVerified(userId, approved) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ admin_verified: approved })
      .eq('user_id', userId)
      .select('user_id, admin_verified')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Approve contact reveal for a user (allows phone number to be shown)
   * @param {string} userId
   * @param {boolean} approved
   */
  async setContactApproved(userId, approved) {
    const { data, error } = await supabase
      .from('contact_details')
      .update({ contact_approved: approved })
      .eq('user_id', userId)
      .select('user_id, contact_approved')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get all pending contact reveal requests
   */
  async getPendingRevealRequests() {
    const { data, error } = await supabase
      .from('contact_reveal_requests')
      .select(`
        id, requester_id, target_id, status, created_at,
        profiles!contact_reveal_requests_requester_id_fkey (name, city),
        profiles!contact_reveal_requests_target_id_fkey (name, city)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  /**
   * Approve or reject a contact reveal request
   * @param {string} requestId
   * @param {'approved'|'rejected'} status
   */
  async resolveRevealRequest(requestId, status) {
    const { data, error } = await supabase
      .from('contact_reveal_requests')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get all photos for moderation (across all users)
   * Returns storage paths + is_primary info
   */
  async getAllPhotosForModeration({ page = 0, limit = 20 } = {}) {
    const offset = page * limit;
    const { data, error, count } = await supabase
      .from('photos')
      .select('id, user_id, storage_path, is_primary, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return { photos: data, total: count };
  },

  /**
   * Delete a photo (moderation action)
   * @param {string} photoId
   * @param {string} storagePath
   */
  async deletePhotoAsAdmin(photoId, storagePath) {
    await supabase.storage.from('profile-images').remove([storagePath]);
    const { error } = await supabase.from('photos').delete().eq('id', photoId);
    if (error) throw error;
  },

  /**
   * Get reported interests for review
   */
  async getReportedInterests() {
    const { data, error } = await supabase
      .from('interests')
      .select(`
        id, sender_id, receiver_id, status, is_reported, created_at,
        profiles!interests_sender_id_fkey (name, city),
        profiles!interests_receiver_id_fkey (name, city)
      `)
      .eq('is_reported', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Get platform statistics for admin dashboard
   */
  async getPlatformStats() {
    const [
      { count: totalProfiles },
      { count: verifiedProfiles },
      { count: pendingInterests },
      { count: totalPhotos },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('admin_verified', true),
      supabase.from('interests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('photos').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalProfiles: totalProfiles || 0,
      verifiedProfiles: verifiedProfiles || 0,
      pendingInterests: pendingInterests || 0,
      totalPhotos: totalPhotos || 0,
    };
  },
};
