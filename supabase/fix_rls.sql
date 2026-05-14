-- Run this in the Supabase SQL Editor to fix the RLS error

ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS enabled but allow all operations:
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable all operations for all users" ON messages FOR ALL USING (true) WITH CHECK (true);
