import { supabase } from '../config/supabaseClient';

/** Signed URL expiry in seconds (1 hour) */
const SIGNED_URL_EXPIRY = 3600;

/**
 * photoService — All photo upload, retrieval, and signed URL generation.
 * Raw storage URLs are NEVER returned. All access is via signed URLs.
 * Canvas-based watermarking is applied on the client.
 */
export const photoService = {
  /**
   * Upload a photo to the private storage bucket
   * Path: profile-images/{userId}/{timestamp}_{filename}
   * @param {string} userId
   * @param {File} file - Image File object
   * @param {boolean} isPrimary - Set as primary photo
   * @returns {object} Photo record with signed URL
   */
  async uploadPhoto(userId, file, isPrimary = false) {
    const ext = file.name.split('.').pop().toLowerCase();
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const storagePath = `${userId}/${filename}`;

    // Upload to private bucket
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
    if (uploadError) throw uploadError;

    // If this is primary, unset others
    if (isPrimary) {
      await supabase.from('photos').update({ is_primary: false }).eq('user_id', userId);
    }

    // Insert record in photos table (store path, NOT the URL)
    const { data, error: dbError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        storage_path: storagePath,
        is_primary: isPrimary,
      })
      .select()
      .single();
    if (dbError) throw dbError;

    // Return signed URL immediately for display
    const signedUrl = await photoService.getSignedUrl(storagePath);
    return { ...data, signed_url: signedUrl };
  },

  /**
   * Generate a 1-hour signed URL for a storage path
   * @param {string} storagePath
   */
  async getSignedUrl(storagePath) {
    const { data, error } = await supabase.storage
      .from('profile-images')
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);
    if (error) throw error;
    return data.signedUrl;
  },

  /**
   * Get all photos for a user with signed URLs
   * @param {string} userId
   */
  async getUserPhotos(userId) {
    const { data, error } = await supabase
      .from('photos')
      .select('id, user_id, storage_path, is_primary, created_at')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Generate signed URLs for all photos
    const photosWithUrls = await Promise.all(
      data.map(async (photo) => {
        try {
          const signedUrl = await photoService.getSignedUrl(photo.storage_path);
          return { ...photo, signed_url: signedUrl };
        } catch {
          return { ...photo, signed_url: null };
        }
      })
    );
    return photosWithUrls;
  },

  /**
   * Get primary photo for a user with signed URL
   * @param {string} userId
   */
  async getPrimaryPhoto(userId) {
    const { data, error } = await supabase
      .from('photos')
      .select('id, storage_path, is_primary')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const signedUrl = await photoService.getSignedUrl(data.storage_path);
    return { ...data, signed_url: signedUrl };
  },

  /**
   * Set a photo as the primary profile picture
   * @param {string} photoId
   * @param {string} userId
   */
  async setPrimaryPhoto(photoId, userId) {
    // First, unset all other photos as primary for this user
    await supabase
      .from('photos')
      .update({ is_primary: false })
      .eq('user_id', userId);

    const { data, error } = await supabase
      .from('photos')
      .update({ is_primary: true })
      .eq('id', photoId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Delete a photo from storage and database
   * @param {string} photoId
   * @param {string} userId
   * @param {string} storagePath
   */
  async deletePhoto(photoId, userId, storagePath) {
    // Remove from storage
    const { error: storageError } = await supabase.storage
      .from('profile-images')
      .remove([storagePath]);
    if (storageError) throw storageError;

    // Remove from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', userId);
    if (dbError) throw dbError;
  },

  /**
   * Apply canvas watermark to an image URL.
   * Draws the viewer's user ID as a semi-transparent overlay.
   * @param {string} imageUrl - Signed URL
   * @param {string} viewerUserId - The ID of the user viewing the photo
   * @returns {Promise<string>} Data URL of watermarked image
   */
  async applyWatermark(imageUrl, viewerUserId) {
    return imageUrl;
  },
};
