import { supabase } from '../config/supabaseClient';

export const chatService = {
  /**
   * Fetch messages between two users
   * @param {string} userId - Current user
   * @param {string} targetId - Other user
   */
  async getMessages(userId, targetId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark unread messages sent by targetId as read
    const unreadIds = data.filter(m => m.sender_id === targetId && !m.read_status).map(m => m.id);
    if (unreadIds.length > 0) {
      await supabase
        .from('messages')
        .update({ read_status: true })
        .in('id', unreadIds);
      
      // Update local data for immediate UI reflection
      data.forEach(m => {
        if (unreadIds.includes(m.id)) m.read_status = true;
      });
    }

    return data;
  },

  /**
   * Send a new message
   * @param {string} senderId 
   * @param {string} receiverId 
   * @param {string} content 
   */
  async sendMessage(senderId, receiverId, content) {
    // 1. Check if the receiver has blocked the sender
    const { data: interest } = await supabase
      .from('interests')
      .select('is_blocked, sender_id, status')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .maybeSingle();

    // If there is a block, and the person who blocked is the receiver
    // Note: is_blocked means the row exists and blocked is true. Who blocked whom?
    // In our logic, blockUserById inserts sender_id = blocker, receiver_id = blocked
    if (interest?.is_blocked) {
      if (interest.sender_id === receiverId) {
        throw new Error('You cannot send messages to this user.');
      }
    }

    // 2. Check if interest is accepted
    if (interest?.status !== 'accepted') {
      throw new Error('MESSAGING_RESTRICTED: You can only message after interest is accepted by both parties.');
    }

    // 3. Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
        read_status: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get total unread messages count for a user
   */
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read_status', false);
    
    if (error) {
      console.warn('getUnreadCount error:', error);
      return 0;
    }
    return count || 0;
  },

  /**
   * Get all active conversations for a user
   */
  async getConversations(userId) {
    // 1. Fetch all messages involving the user
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. Group by "other user"
    const conversationsMap = {};
    const otherUserIds = new Set();

    data.forEach(msg => {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!conversationsMap[otherId]) {
        conversationsMap[otherId] = {
          otherId,
          lastMessage: msg,
          unreadCount: (msg.receiver_id === userId && !msg.read_status) ? 1 : 0
        };
        otherUserIds.add(otherId);
      } else {
        if (msg.receiver_id === userId && !msg.read_status) {
          conversationsMap[otherId].unreadCount++;
        }
      }
    });

    if (otherUserIds.size === 0) return [];

    // 3. Fetch profiles for other users
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('user_id, name, city, gender')
      .in('user_id', Array.from(otherUserIds));

    if (pError) throw pError;

    const profileMap = {};
    profiles.forEach(p => { profileMap[p.user_id] = p; });

    // 4. Combine and return
    return Object.values(conversationsMap).map(conv => ({
      ...conv,
      profile: profileMap[conv.otherId] || null
    })).filter(conv => conv.profile); // Only show if profile exists
  }
};
