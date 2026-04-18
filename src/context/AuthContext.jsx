import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [profile, setProfile]     = useState(null);
  const [session, setSession]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [isAdmin, setIsAdmin]     = useState(false);

  const loadProfile = useCallback(async (userId) => {
    try {
      const exists = await profileService.profileExists(userId);
      if (exists) {
        const p = await profileService.getOwnProfile(userId);
        setProfile(p);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Restore session on mount
    authService.getSession().then((s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsAdmin(authService.isAdmin(s?.user));
      if (s?.user) loadProfile(s.user.id);
      setLoading(false);
    });

    // Listen for auth state changes
    const subscription = authService.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsAdmin(authService.isAdmin(newSession?.user));
      if (newSession?.user) {
        // Fire and forget, do not await!
        loadProfile(newSession.user.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(() => {
    if (user?.id) return loadProfile(user.id);
  }, [user, loadProfile]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    refreshProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
