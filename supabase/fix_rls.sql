-- ============================================================
-- SQL Script to Fix Row-Level Security (RLS) Vulnerability
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/ruiewjgjlbnbweycydet/sql/new)
-- ============================================================

-- 1. Enable RLS on messages and reports tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_update" ON messages;
DROP POLICY IF EXISTS "messages_delete" ON messages;

DROP POLICY IF EXISTS "reports_select" ON reports;
DROP POLICY IF EXISTS "reports_insert" ON reports;
DROP POLICY IF EXISTS "reports_update" ON reports;
DROP POLICY IF EXISTS "reports_delete" ON reports;

-- 3. Create policies for the messages table
-- Users can read messages they sent or received
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can only insert messages sent from their own account
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they sent or received (e.g., updating read_status)
CREATE POLICY "messages_update" ON messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can delete messages they sent or received
CREATE POLICY "messages_delete" ON messages FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);


-- 4. Create policies for the reports table
-- Users can view their own reports, and Admins can view all reports
CREATE POLICY "reports_select" ON reports FOR SELECT
  USING (
    auth.uid() = reporter_id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Authenticated users can insert reports with their own ID as the reporter
CREATE POLICY "reports_insert" ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Only Admins can update reports (e.g. changing status to 'dismissed')
CREATE POLICY "reports_update" ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Only Admins can delete reports
CREATE POLICY "reports_delete" ON reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
