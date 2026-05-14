import { supabase } from '../config/supabaseClient';

export const reportService = {
  /**
   * Submit a detailed report against a user
   * @param {string} reporterId
   * @param {string} reportedId
   * @param {string} reason
   * @param {string} description
   * @param {File} screenshotFile
   */
  async submitReport(reporterId, reportedId, reason, description, screenshotFile) {
    let screenshotUrl = null;

    // 1. Upload screenshot if provided
    if (screenshotFile) {
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `reports/${reportedId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('photos') // Re-using photos bucket for simplicity
        .upload(fileName, screenshotFile, { upsert: true });

      if (uploadError) {
        console.error('Screenshot upload failed:', uploadError);
        throw new Error('Failed to upload screenshot. Please try again.');
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);
        
      screenshotUrl = publicUrlData.publicUrl;
    }

    // 2. Save report to database
    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_id: reportedId,
        reason,
        description,
        screenshot_url: screenshotUrl
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Update the interest table to mark as reported for immediate local UI updates
    const { data: interest } = await supabase
      .from('interests')
      .select('id')
      .or(`and(sender_id.eq.${reporterId},receiver_id.eq.${reportedId}),and(sender_id.eq.${reportedId},receiver_id.eq.${reporterId})`)
      .maybeSingle();

    if (interest) {
      await supabase.from('interests').update({ is_reported: true }).eq('id', interest.id);
    } else {
      await supabase.from('interests').insert({ sender_id: reporterId, receiver_id: reportedId, status: 'rejected', is_reported: true });
    }

    // 4. Notify Admins (Placeholder for Email/Edge Function)
    this.notifyAdmins(reporterId, reportedId, reason, description);

    return data;
  },

  /**
   * Placeholder for sending email notifications to admins.
   * In a production environment, this would trigger a Supabase Edge Function
   * or a backend call to an email service like Resend or SendGrid.
   */
  notifyAdmins(reporterId, reportedId, reason, description) {
    const adminEmails = ['pramod.gogadare@zohomail.in', 'pramodkalyan25@gmail.com'];
    console.log(`[ADMIN NOTIFICATION] Sending report alert to: ${adminEmails.join(', ')}`);
    console.log(`Reason: ${reason}`);
    console.log(`Description: ${description}`);
    // TODO: Integrate with an email API when credentials are provided.
  },

  /**
   * Admin: Get all reports
   */
  async getAllReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Fetch user details for reporters and reported users
    const userIds = [...new Set(data.flatMap(r => [r.reporter_id, r.reported_id]))];
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);
      
      const profileMap = {};
      profiles?.forEach(p => { profileMap[p.user_id] = p.name; });

      return data.map(r => ({
        ...r,
        reporter_name: profileMap[r.reporter_id] || 'Unknown',
        reported_name: profileMap[r.reported_id] || 'Unknown'
      }));
    }

    return data;
  },

  /**
   * Admin: Dismiss a report
   */
  async dismissReport(reportId) {
    const { error } = await supabase
      .from('reports')
      .update({ status: 'dismissed' })
      .eq('id', reportId);
    if (error) throw error;
  }
};
