import { supabase } from '../config/supabaseClient';

/**
 * SAFE_SELECT — Fields that can be exposed to other users.
 * mobile_number is NEVER in this list.
 */
const PUBLIC_PROFILE_FIELDS = `
  user_id, profile_id, name, first_name, last_name, gender, dob, height, religion, caste, education,
  profession, city, state, country, bio, marital_status,
  mobile_verified, photo_visibility, profile_visibility,
  admin_verified, created_at,
  profile_for, diet, mother_tongue, sub_community, college_name,
  company_name, company_type, hobbies,
  family_mother_occupation, family_father_occupation,
  num_sisters, num_brothers, family_financial_status,
  live_with_family, caste_no_bar
`;

/**
 * FULL_PROFILE_FIELDS — Fields for the profile owner only.
 * Salary is included here as it's owner-only context.
 */
const FULL_PROFILE_FIELDS = `
  ${PUBLIC_PROFILE_FIELDS}, salary, daily_interest_count, last_interest_reset, updated_at
`;

/**
 * profileService — All profile CRUD operations.
 * No component should call supabase.from('profiles') directly.
 */
export const profileService = {
  /**
   * Create a new profile for the authenticated user
   * @param {string} userId
   * @param {object} profileData
   */
  async createProfile(userId, profileData) {
    // Generate unique profile ID if not present
    if (!profileData.profile_id) {
      profileData.profile_id = await this.generateUniqueProfileId(profileData.gender);
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ user_id: userId, ...profileData }, { onConflict: 'user_id' })
      .select(FULL_PROFILE_FIELDS)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Generate a unique profile ID: [B/G][YY][RRRR]
   * B = Male, G = Female
   * YY = Last 2 digits of current year
   * RRRR = 4 random digits
   * @param {string} gender 
   */
  async generateUniqueProfileId(gender) {
    const prefix = (gender || '').toLowerCase() === 'male' ? 'B' : 'G';
    const year = new Date().getFullYear().toString().slice(-2);
    let isUnique = false;
    let newId = '';

    while (!isUnique) {
      const random = Math.floor(1000 + Math.random() * 9000).toString();
      newId = `${prefix}${year}${random}`;

      const { data } = await supabase
        .from('profiles')
        .select('profile_id')
        .eq('profile_id', newId)
        .maybeSingle();

      if (!data) isUnique = true;
    }

    return newId;
  },

  /**
   * Get the full profile for the current user (owner view)
   * @param {string} userId
   */
  async getOwnProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select(FULL_PROFILE_FIELDS)
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get a public-safe profile for another user
   * @param {string} userId
   */
  async getPublicProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select(PUBLIC_PROFILE_FIELDS)
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Update the authenticated user's profile
   * @param {string} userId
   * @param {object} updates
   */
  async updateProfile(userId, updates) {
    // Prevent updating restricted fields via this method
    const { mobile_verified, admin_verified, daily_interest_count, ...safeUpdates } = updates;
    const { data, error } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('user_id', userId)
      .select(FULL_PROFILE_FIELDS)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Check if a profile exists for a user
   * @param {string} userId
   */
  async profileExists(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  /**
   * Update mobile_verified status (called after OTP verification)
   * @param {string} userId
   */
  async setMobileVerified(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ mobile_verified: true })
      .eq('user_id', userId)
      .select('mobile_verified')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get the raw mobile number for the authenticated user
   * @param {string} userId
   */
  async getMobileNumber(userId) {
    const { data, error } = await supabase
      .from('contact_details')
      .select('full_mobile')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data?.full_mobile || '';
  },

  /**
   * Save the user's mobile number in the contact_details table
   * NOT in profiles table — strict privacy separation
   * @param {string} userId
   * @param {string} mobileNumber - Full E.164 format e.g. +919876543210
   */
  async saveMobileNumber(userId, mobileNumber) {
    const { data, error } = await supabase
      .from('contact_details')
      .upsert({ user_id: userId, full_mobile: mobileNumber }, { onConflict: 'user_id' })
      .select('user_id')
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Get masked phone number for display on profile cards
   * Returns "+91 XXXXX XXXXX" style string
   * @param {string} userId
   */
  async getMaskedPhone(userId) {
    const { data, error } = await supabase
      .from('contact_details')
      .select('full_mobile')
      .eq('user_id', userId)
      .single();
    if (error || !data?.full_mobile) return null;
    const digits = data.full_mobile.replace(/\D/g, '');
    if (digits.length < 10) return null;
    return `+${digits.slice(0, 2)} XXXXX ${digits.slice(-5)}`;
  },

  /**
   * Get or create user preferences
   * @param {string} userId
   */
  async getPreferences(userId) {
    const { data, error } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /**
   * Save/update user's partner preferences
   * @param {string} userId
   * @param {object} prefs
   */
  async savePreferences(userId, prefs) {
    const { data, error } = await supabase
      .from('preferences')
      .upsert({ user_id: userId, ...prefs }, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Log a profile view event
   * Rate limiting (50/hour) is enforced here
   * @param {string} viewerId
   * @param {string} viewedId
   */
  async logProfileView(viewerId, viewedId) {
    if (viewerId === viewedId) return; // Don't log self-views

    // Rate limit check: max 50 views per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('viewer_id', viewerId)
      .gte('viewed_at', oneHourAgo);

    if (count >= 50) {
      console.warn('[profileService] Rate limit: 50 profile views per hour exceeded.');
      return;
    }

    await supabase
      .from('profile_views')
      .insert({ viewer_id: viewerId, viewed_id: viewedId });
  },

  /**
   * Get list of users who viewed the current user's profile
   * @param {string} userId - the profile owner
   */
  async getProfileViewers(userId) {
    const { data, error } = await supabase
      .from('profile_views')
      .select('viewer_id, viewed_at')
      .eq('viewed_id', userId)
      .order('viewed_at', { ascending: false });

    if (error) {
      // profile_views table may not exist yet — return empty gracefully
      console.warn('[profileService] getProfileViewers error (table may not exist):', error.message);
      return [];
    }

    // Deduplicate: only keep the latest view per viewer
    const uniqueViewers = [];
    const seen = new Set();
    (data || []).forEach(v => {
      if (v.viewer_id && !seen.has(v.viewer_id)) {
        seen.add(v.viewer_id);
        uniqueViewers.push(v);
      }
    });

    const sliced = uniqueViewers.slice(0, 50);
    if (sliced.length === 0) return sliced;

    // Fetch viewer profiles separately
    const viewerIds = sliced.map(v => v.viewer_id);
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, name, city, photo_visibility')
      .in('user_id', viewerIds);

    const profileMap = {};
    (profilesData || []).forEach(p => { profileMap[p.user_id] = p; });

    return sliced.map(v => ({ ...v, profiles: profileMap[v.viewer_id] || null }));
  },

  /**
   * Calculate profile completion percentage based on filled fields.
   * @param {object} profile
   * @param {boolean} hasPhoto
   * @returns {number} 0-100
   */
  calculateCompletion(profile, hasPhoto = false) {
    if (!profile) return 0;
    const fields = [
      'name', 'gender', 'dob', 'height', 'religion', 'education',
      'profession', 'city', 'bio', 'marital_status'
    ];
    let filled = 0;
    fields.forEach(f => {
      if (profile[f] && String(profile[f]).trim().length > 0) filled++;
    });
    
    // Weighted points for critical sections
    if (hasPhoto) filled += 2;
    if (profile.family_mother_occupation || profile.family_father_occupation) filled += 1;
    if (profile.college_name || profile.company_name) filled += 1;
    
    const totalPoints = fields.length + 4;
    return Math.min(100, Math.round((filled / totalPoints) * 100));
  },
};
