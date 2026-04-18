-- ============================================================
-- MATRIMONY APP — SUPABASE STORAGE SETUP
-- Run in Supabase SQL Editor (after schema.sql)
-- ============================================================

-- Create the private storage bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  false,           -- PRIVATE bucket — no public access
  5242880,         -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- Allow authenticated users to upload to their OWN folder only
-- Folder structure: profile-images/{user_id}/filename.jpg
CREATE POLICY "storage_insert_own_folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to read any image via signed URL request
-- (actual URL signing and expiry is enforced in photoService.js)
CREATE POLICY "storage_select_authenticated"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'profile-images'
    AND auth.uid() IS NOT NULL
  );

-- Allow users to delete only their own files
CREATE POLICY "storage_delete_own_folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update only their own files (for metadata)
CREATE POLICY "storage_update_own_folder"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
