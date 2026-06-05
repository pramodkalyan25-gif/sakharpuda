-- ============================================================
-- MIGRATION: Add Janma Patrika fields to profiles
-- Run this in Supabase SQL Editor
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS time_of_birth   TEXT,         -- "HH:MM" 24-hour, e.g. "14:30" (optional)
  ADD COLUMN IF NOT EXISTS place_of_birth  TEXT,         -- birth city/village free text (optional)
  ADD COLUMN IF NOT EXISTS birth_nakshatra TEXT;         -- manual Nakshatra override (optional, e.g. "Rohini")

-- Add a comment for documentation
COMMENT ON COLUMN profiles.time_of_birth   IS 'Time of birth in HH:MM 24-hour format. Used for Lagna and accurate Nakshatra calculation.';
COMMENT ON COLUMN profiles.place_of_birth  IS 'City or village of birth. Used for Lagna (ascendant) calculation.';
COMMENT ON COLUMN profiles.birth_nakshatra IS 'Manually entered Janma Nakshatra. Overrides calculated Nakshatra if provided.';
