-- ============================================================
-- MATRIMONY APP — ROW LEVEL SECURITY POLICIES
-- Run AFTER schema.sql and triggers.sql
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_details         ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences             ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests               ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_reveal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Anyone authenticated can read non-hidden profiles
-- (mobile_number column doesn't exist in profiles — it's in contact_details)
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      profile_visibility = 'all'
      OR (profile_visibility = 'verified_only' AND EXISTS (
        SELECT 1 FROM profiles me WHERE me.user_id = auth.uid() AND me.mobile_verified = true
      ))
      OR user_id = auth.uid()
    )
    AND profile_visibility != 'hidden'
  );

-- Users can always see their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

-- Only owner can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only owner can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- CONTACT DETAILS POLICIES
-- Strictest table — full phone number never exposed freely
-- ============================================================

-- Owner can always read own contact details
CREATE POLICY "contact_select_own"
  ON contact_details FOR SELECT
  USING (user_id = auth.uid());

-- Reveal to requester only after: mutual interest accepted + contact_approved = true
CREATE POLICY "contact_select_approved"
  ON contact_details FOR SELECT
  USING (
    contact_approved = true
    AND EXISTS (
      SELECT 1 FROM interests
       WHERE status = 'accepted'
         AND (
               (sender_id = auth.uid()   AND receiver_id = contact_details.user_id)
            OR (receiver_id = auth.uid() AND sender_id   = contact_details.user_id)
         )
    )
  );

-- Owner can insert own contact details
CREATE POLICY "contact_insert_own"
  ON contact_details FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Owner can update own contact details
CREATE POLICY "contact_update_own"
  ON contact_details FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- PREFERENCES POLICIES
-- ============================================================

CREATE POLICY "preferences_select_own"
  ON preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "preferences_insert_own"
  ON preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "preferences_update_own"
  ON preferences FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- INTERESTS POLICIES
-- ============================================================

-- Users can see interests they sent or received
CREATE POLICY "interests_select"
  ON interests FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can only send interests from their own account
-- AND they must be mobile-verified first
CREATE POLICY "interests_insert"
  ON interests FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
       WHERE user_id = auth.uid()
         AND mobile_verified = true
    )
  );

-- Only receiver can update interest status (accept/reject)
CREATE POLICY "interests_update"
  ON interests FOR UPDATE
  USING (receiver_id = auth.uid());

-- ============================================================
-- PHOTOS POLICIES
-- Enforce visibility rules — signed URLs generated in service layer
-- ============================================================

-- Photo owner can always see their photos
CREATE POLICY "photos_select_own"
  ON photos FOR SELECT
  USING (user_id = auth.uid());

-- Other users see photos based on photo_visibility setting
CREATE POLICY "photos_select_visibility"
  ON photos FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles p
       WHERE p.user_id = photos.user_id
         AND (
           p.photo_visibility = 'public'
           OR (
             p.photo_visibility = 'members_only'
             AND auth.uid() IS NOT NULL
           )
           OR (
             p.photo_visibility = 'after_mutual_interest'
             AND EXISTS (
               SELECT 1 FROM interests i
                WHERE i.status = 'accepted'
                  AND (
                        (i.sender_id = auth.uid()   AND i.receiver_id = photos.user_id)
                     OR (i.receiver_id = auth.uid() AND i.sender_id   = photos.user_id)
                  )
             )
           )
         )
    )
  );

-- Users can upload only to their own folder
CREATE POLICY "photos_insert_own"
  ON photos FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete only their own photos
CREATE POLICY "photos_delete_own"
  ON photos FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- CONTACT REVEAL REQUESTS POLICIES
-- ============================================================

CREATE POLICY "reveal_req_select"
  ON contact_reveal_requests FOR SELECT
  USING (requester_id = auth.uid() OR target_id = auth.uid());

CREATE POLICY "reveal_req_insert"
  ON contact_reveal_requests FOR INSERT
  WITH CHECK (
    requester_id = auth.uid()
    -- Must have mutual interest accepted
    AND EXISTS (
      SELECT 1 FROM interests
       WHERE status = 'accepted'
         AND (
               (sender_id = auth.uid()   AND receiver_id = contact_reveal_requests.target_id)
            OR (receiver_id = auth.uid() AND sender_id   = contact_reveal_requests.target_id)
         )
    )
  );

-- ============================================================
-- PROFILE VIEWS POLICIES
-- ============================================================

-- Users can only insert their own view records
CREATE POLICY "views_insert_own"
  ON profile_views FOR INSERT
  WITH CHECK (viewer_id = auth.uid());

-- Users can only see who viewed their own profile
CREATE POLICY "views_select_own_profile"
  ON profile_views FOR SELECT
  USING (viewed_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET POLICIES (SQL representation)
-- Note: Storage policies are also configured in the Supabase dashboard
-- under Storage > profile-images bucket
-- ============================================================

-- The actual bucket creation is done via Supabase dashboard
-- or via the storage.sql file. Here we document the expected policies:
--
-- INSERT policy: auth.uid()::text = (storage.foldername(name))[1]
--   → Users can only upload to their own folder
--
-- SELECT policy: auth.role() = 'authenticated'
--   → Only logged-in users can request signed URLs
--
-- DELETE policy: auth.uid()::text = (storage.foldername(name))[1]
--   → Users can only delete their own files
