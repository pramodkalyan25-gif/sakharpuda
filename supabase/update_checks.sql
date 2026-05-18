-- ============================================================================
-- SAKHARPUDA — REGISTRATION EXISTENCE CHECKS RE-DEFINITION
-- ============================================================================
-- Run this script inside the Supabase SQL Editor (https://supabase.com/dashboard)
-- This ensures that uncompleted/abandoned registrations (verified email but left
-- without clicking "Complete Registration" / submitting their profile) do NOT
-- block future signups with the same email or mobile number.
-- ============================================================================

-- 1. Redefine public.check_email_exists
-- Only returns TRUE if the user exists in auth.users AND has a completed public profile.
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users u
    INNER JOIN public.profiles p ON u.id = p.user_id
    WHERE LOWER(u.email) = LOWER(p_email)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Redefine public.check_mobile_exists
-- Only returns TRUE if the user exists in public.contact_details AND has a completed public profile.
CREATE OR REPLACE FUNCTION public.check_mobile_exists(p_mobile TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.contact_details c
    INNER JOIN public.profiles p ON c.user_id = p.user_id
    WHERE c.full_mobile = '+91' || p_mobile
       OR c.full_mobile = p_mobile
       OR RIGHT(c.full_mobile, 10) = RIGHT(p_mobile, 10)
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
