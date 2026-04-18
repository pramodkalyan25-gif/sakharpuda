import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profileService';
import { useAuth } from './useAuth';

/**
 * useProfile — Manage profile data for the current user.
 * Handles loading, updating, and preferences.
 */
export function useProfile() {
  const { user, profile: ctxProfile, refreshProfile } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [updating, setUpdating]       = useState(false);
  const [error, setError]             = useState(null);

  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    setLoadingPrefs(true);
    try {
      const prefs = await profileService.getPreferences(user.id);
      setPreferences(prefs);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingPrefs(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return;
    setUpdating(true);
    setError(null);
    try {
      await profileService.updateProfile(user.id, updates);
      await refreshProfile();
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setUpdating(false);
    }
  }, [user?.id, refreshProfile]);

  const savePreferences = useCallback(async (prefs) => {
    if (!user?.id) return;
    setUpdating(true);
    try {
      const saved = await profileService.savePreferences(user.id, prefs);
      setPreferences(saved);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setUpdating(false);
    }
  }, [user?.id]);

  return {
    profile: ctxProfile,
    preferences,
    loadingPrefs,
    updating,
    error,
    updateProfile,
    savePreferences,
    refreshProfile,
  };
}
