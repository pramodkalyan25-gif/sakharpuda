-- Run this in the Supabase SQL Editor to add the is_admin column to the profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- To set yourself as an admin, replace YOUR_USER_ID with your actual user id from auth.users:
-- UPDATE profiles SET is_admin = true WHERE user_id = 'YOUR_USER_ID';
