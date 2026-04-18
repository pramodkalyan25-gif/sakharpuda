-- ============================================================
-- MATRIMONY APP — SUPABASE DATABASE SCHEMA
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

CREATE TYPE marital_status_type AS ENUM (
  'never_married',
  'divorced',
  'widowed',
  'awaiting_divorce'
);

CREATE TYPE photo_visibility_type AS ENUM (
  'public',
  'members_only',
  'after_mutual_interest'
);

CREATE TYPE profile_visibility_type AS ENUM (
  'all',
  'verified_only',
  'hidden'
);

CREATE TYPE interest_status_type AS ENUM (
  'pending',
  'accepted',
  'rejected'
);

CREATE TYPE reveal_status_type AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- ============================================================
-- TABLE: profiles
-- Core user profile data. mobile_number NOT stored here.
-- ============================================================

CREATE TABLE profiles (
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name                  VARCHAR(100)            NOT NULL,
  gender                gender_type             NOT NULL,
  dob                   DATE                    NOT NULL,
  height                INTEGER,                               -- in cm
  religion              VARCHAR(50),
  caste                 VARCHAR(50),
  education             VARCHAR(100),
  profession            VARCHAR(100),
  salary                VARCHAR(50),
  city                  VARCHAR(100),
  state                 VARCHAR(100),
  country               VARCHAR(100)            DEFAULT 'India',
  bio                   TEXT,
  marital_status        marital_status_type,
  mobile_verified       BOOLEAN                 DEFAULT false,
  photo_visibility      photo_visibility_type   DEFAULT 'after_mutual_interest',
  profile_visibility    profile_visibility_type DEFAULT 'all',
  admin_verified        BOOLEAN                 DEFAULT false,
  daily_interest_count  INTEGER                 DEFAULT 0,
  last_interest_reset   DATE                    DEFAULT CURRENT_DATE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: contact_details
-- Stores full mobile numbers — strictly private
-- Only readable by owner OR after mutual acceptance + admin approval
-- ============================================================

CREATE TABLE contact_details (
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_mobile      VARCHAR(20),
  contact_approved BOOLEAN                  DEFAULT false,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: preferences
-- Partner search preferences per user
-- ============================================================

CREATE TABLE preferences (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_age_min    INTEGER DEFAULT 18,
  preferred_age_max    INTEGER DEFAULT 40,
  preferred_height_min INTEGER,
  preferred_height_max INTEGER,
  preferred_city       VARCHAR(100),
  preferred_religion   VARCHAR(50),
  preferred_caste      VARCHAR(50),
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: interests
-- Tracks interest requests between users with spam protection
-- ============================================================

CREATE TABLE interests (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status      interest_status_type DEFAULT 'pending',
  is_blocked  BOOLEAN              DEFAULT false,
  is_reported BOOLEAN              DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- ============================================================
-- TABLE: photos
-- Stores storage_path only — signed URLs generated server-side
-- NEVER store raw public URLs
-- ============================================================

CREATE TABLE photos (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path VARCHAR(500) NOT NULL,   -- e.g. "{user_id}/photo_abc123.jpg"
  is_primary   BOOLEAN DEFAULT false,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLE: contact_reveal_requests
-- Users request to view another user's full contact details
-- Requires mutual interest + admin approval
-- ============================================================

CREATE TABLE contact_reveal_requests (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status       reveal_status_type DEFAULT 'pending',
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, target_id)
);

-- ============================================================
-- TABLE: profile_views
-- Log who viewed which profile; used for rate-limiting + insights
-- ============================================================

CREATE TABLE profile_views (
  id        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX idx_profiles_gender      ON profiles(gender);
CREATE INDEX idx_profiles_religion    ON profiles(religion);
CREATE INDEX idx_profiles_caste       ON profiles(caste);
CREATE INDEX idx_profiles_city        ON profiles(city);
CREATE INDEX idx_profiles_dob         ON profiles(dob);
CREATE INDEX idx_profiles_education   ON profiles(education);
CREATE INDEX idx_profiles_visibility  ON profiles(profile_visibility);

CREATE INDEX idx_interests_sender     ON interests(sender_id);
CREATE INDEX idx_interests_receiver   ON interests(receiver_id);
CREATE INDEX idx_interests_status     ON interests(status);

CREATE INDEX idx_photos_user          ON photos(user_id);
CREATE INDEX idx_photos_primary       ON photos(user_id, is_primary);

CREATE INDEX idx_profile_views_viewed ON profile_views(viewed_id);
CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX idx_profile_views_at     ON profile_views(viewed_at);

CREATE INDEX idx_reveal_req_target    ON contact_reveal_requests(target_id);
