import { supabase } from '../config/supabaseClient';

/**
 * searchService — Profile search with PostgreSQL filtering.
 * All queries are optimized with indexed columns.
 */
export const searchService = {
  /**
   * Search profiles with multiple filters
   * @param {object} filters
   * @param {number} filters.age_min
   * @param {number} filters.age_max
   * @param {string} filters.gender
   * @param {string} filters.religion
   * @param {string} filters.caste
   * @param {string} filters.education
   * @param {string} filters.city
   * @param {string} filters.marital_status
   * @param {number} filters.page - 0-indexed page number
   * @param {number} filters.limit - results per page (max 20)
   */
  async searchProfiles(filters = {}, currentUserId = null) {
    const {
      age_min,
      age_max,
      gender,
      religion,
      caste,
      education,
      city,
      marital_status,
      page = 0,
      limit = 12,
    } = filters;

    const safeLimit = Math.min(limit, 20);
    const offset = page * safeLimit;

    let query = supabase
      .from('profiles')
      .select(`
        user_id, name, gender, dob, height, religion, caste, education,
        profession, city, state, country, bio, marital_status,
        mobile_verified, photo_visibility, admin_verified, created_at
      `, { count: 'exact' })
      .neq('profile_visibility', 'hidden');

    if (currentUserId) {
      query = query.neq('user_id', currentUserId);
    }

    query = query.order('created_at', { ascending: false })
      .range(offset, offset + safeLimit - 1);

    // Age filter: convert age range to DOB range
    let minAge = age_min;
    let maxAge = age_max;
    if (minAge && maxAge && parseInt(minAge) > parseInt(maxAge)) {
      const temp = minAge;
      minAge = maxAge;
      maxAge = temp;
    }

    if (minAge) {
      const maxDob = new Date();
      maxDob.setFullYear(maxDob.getFullYear() - minAge);
      query = query.lte('dob', maxDob.toISOString().split('T')[0]);
    }
    if (maxAge) {
      const minDob = new Date();
      minDob.setFullYear(minDob.getFullYear() - maxAge - 1);
      query = query.gte('dob', minDob.toISOString().split('T')[0]);
    }

    // Exact filters
    if (gender) query = query.eq('gender', gender);
    if (religion) query = query.ilike('religion', `%${religion}%`);
    if (caste) query = query.ilike('caste', `%${caste}%`);
    if (education) query = query.ilike('education', `%${education}%`);
    if (city) query = query.ilike('city', `%${city}%`);
    if (marital_status) query = query.eq('marital_status', marital_status);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      profiles: data,
      total: count,
      page,
      limit: safeLimit,
      hasMore: offset + safeLimit < count,
    };
  },

  /**
   * Get recommended profiles based on user's own preferences
   * @param {string} userId
   * @param {object} preferences - user's saved preferences
   */
  async getRecommendedProfiles(userId, preferences = {}) {
    if (!preferences) return { profiles: [], total: 0 };

    return searchService.searchProfiles({
      age_min: preferences.preferred_age_min,
      age_max: preferences.preferred_age_max,
      city: preferences.preferred_city,
      religion: preferences.preferred_religion,
      caste: preferences.preferred_caste,
      limit: 6,
    });
  },

  /**
   * Get recently joined profiles (for dashboard)
   * @param {number} limit
   */
  async getRecentProfiles(limit = 8) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        user_id, name, gender, dob, city, religion, education,
        profession, mobile_verified, photo_visibility, admin_verified, created_at
      `)
      .neq('profile_visibility', 'hidden')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};
