-- SQL migration to fix RLS permissions on the interests table.
-- Run this in the Supabase SQL Editor.

-- Drop existing update policy
DROP POLICY IF EXISTS "interests_update" ON interests;
DROP POLICY IF EXISTS "interests_delete" ON interests;

-- Create updated UPDATE policy that allows either sender or receiver to update the row
-- (e.g. blocker updates is_blocked/status, receiver updates status to accept/decline)
CREATE POLICY "interests_update" ON interests FOR UPDATE
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Create DELETE policy that allows either sender or receiver to delete the row
-- (e.g. sender withdraws interest, or receiver deletes row during block switching)
CREATE POLICY "interests_delete" ON interests FOR DELETE
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());
