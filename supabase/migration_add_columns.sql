-- ============================================================
-- MIGRATION: Add Shaadi.com-style profile fields
-- Run this in Supabase SQL Editor ONCE
-- ============================================================

-- Profile-for: who is this profile being created for
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_for VARCHAR(50) DEFAULT 'myself';

-- Split name into first/last (keep original 'name' column for backward compat)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(50);

-- Diet preference
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diet VARCHAR(50);

-- Mother tongue
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mother_tongue VARCHAR(50);

-- Sub-community (more specific than caste)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sub_community VARCHAR(100);

-- Education details
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college_name VARCHAR(200);

-- Work details
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name VARCHAR(200);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_type VARCHAR(100);

-- Hobbies stored as JSON array
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hobbies JSONB DEFAULT '[]'::jsonb;

-- Family details
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_mother_occupation VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_father_occupation VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS num_sisters INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS num_brothers INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_financial_status VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS live_with_family BOOLEAN DEFAULT true;

-- Caste no bar preference
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS caste_no_bar BOOLEAN DEFAULT false;

-- ============================================================
-- Add indexes for new searchable columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_diet ON profiles(diet);
CREATE INDEX IF NOT EXISTS idx_profiles_mother_tongue ON profiles(mother_tongue);
CREATE INDEX IF NOT EXISTS idx_profiles_sub_community ON profiles(sub_community);
CREATE INDEX IF NOT EXISTS idx_profiles_family_status ON profiles(family_financial_status);

-- ============================================================
-- Done! You can verify by running:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position;
-- ============================================================
