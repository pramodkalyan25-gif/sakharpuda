-- ============================================================
-- MATRIMONY APP — DATABASE TRIGGERS
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TRIGGER 1: Auto-update `updated_at` on profiles
-- ============================================================

CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER tr_preferences_updated_at
  BEFORE UPDATE ON preferences
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_updated_at();

-- ============================================================
-- TRIGGER 2: Enforce daily interest send limit (max 10/day)
-- Fires BEFORE INSERT on interests table
-- Also resets counter if a new day has started
-- ============================================================

CREATE OR REPLACE FUNCTION fn_check_daily_interest_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
  v_reset DATE;
BEGIN
  -- Fetch current count and last reset date for sender
  SELECT daily_interest_count, last_interest_reset
    INTO v_count, v_reset
    FROM profiles
   WHERE user_id = NEW.sender_id;

  -- Reset counter if it's a new calendar day
  IF v_reset < CURRENT_DATE THEN
    UPDATE profiles
       SET daily_interest_count = 0,
           last_interest_reset  = CURRENT_DATE
     WHERE user_id = NEW.sender_id;
    v_count := 0;
  END IF;

  -- Enforce hard limit of 10
  IF v_count >= 10 THEN
    RAISE EXCEPTION 'DAILY_LIMIT_REACHED: You can only send 10 interests per day.';
  END IF;

  -- Increment counter
  UPDATE profiles
     SET daily_interest_count = daily_interest_count + 1
   WHERE user_id = NEW.sender_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_check_interest_limit
  BEFORE INSERT ON interests
  FOR EACH ROW
  EXECUTE FUNCTION fn_check_daily_interest_limit();

-- ============================================================
-- TRIGGER 3: Prevent duplicate primary photo
-- Ensures only one photo per user has is_primary = true
-- ============================================================

CREATE OR REPLACE FUNCTION fn_enforce_single_primary_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE photos
       SET is_primary = false
     WHERE user_id = NEW.user_id
       AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_single_primary_photo
  AFTER INSERT OR UPDATE ON photos
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION fn_enforce_single_primary_photo();

-- ============================================================
-- TRIGGER 4: Auto-create empty profile on user signup
-- Creates a minimal profile row so joins never fail
-- ============================================================

CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create placeholder — actual profile filled during onboarding
  INSERT INTO contact_details (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION fn_handle_new_user();
