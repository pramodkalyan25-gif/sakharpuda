import { supabase } from '../config/supabaseClient';

export const shortlistService = {
  /**
   * Toggle shortlist status for a profile
   */
  async toggleShortlist(userId, targetId) {
    // Check if already shortlisted
    const { data, error: fetchError } = await supabase
      .from('shortlists')
      .select('id')
      .eq('user_id', userId)
      .eq('target_id', targetId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (data) {
      // Remove from shortlist
      const { error: delError } = await supabase
        .from('shortlists')
        .delete()
        .eq('id', data.id);
      if (delError) throw delError;
      return false; // Not shortlisted anymore
    } else {
      // Add to shortlist
      const { error: insError } = await supabase
        .from('shortlists')
        .insert({ user_id: userId, target_id: targetId });
      if (insError) throw insError;
      return true; // Shortlisted now
    }
  },

  /**
   * Get all profiles shortlisted by a user
   */
  async getShortlistedProfiles(userId) {
    // 1. Get shortlisted IDs
    const { data: shortlists, error: sError } = await supabase
      .from('shortlists')
      .select('target_id')
      .eq('user_id', userId);
    
    if (sError) throw sError;
    if (!shortlists || shortlists.length === 0) return [];

    const targetIds = shortlists.map(s => s.target_id);

    // 2. Fetch profile details for these IDs
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', targetIds);

    if (pError) throw pError;
    
    // Return profiles with a 'isShortlisted' flag set to true
    return (profiles || []).map(p => ({ ...p, isShortlisted: true }));
  },

  /**
   * Get a map of shortlisted target IDs for the current user
   */
  async getShortlistMap(userId) {
    const { data, error } = await supabase
      .from('shortlists')
      .select('target_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const map = {};
    (data || []).forEach(item => {
      map[item.target_id] = true;
    });
    return map;
  }
};
