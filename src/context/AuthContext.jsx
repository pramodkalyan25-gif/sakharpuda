import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
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
        return true;
      }
      setProfile(null);
      return false;
    } catch {
      setProfile(null);
      return false;
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
        loadProfile(newSession.user.id).then(async (hasProfile) => {
          // If they just signed in (e.g. Google OAuth) and have no profile, reject the login
          if (!hasProfile && event === 'SIGNED_IN') {
            const userEmail = newSession.user.email;
            try {
              // Delete the auth user that Supabase OAuth auto-created
              await authService.deleteAccount();
            } catch (err) {
              console.error("Failed to delete orphaned auth user:", err);
            }
            await authService.logout();
            toast.error(`User does not have account with email "${userEmail}"`);
          }
        }).finally(() => setLoading(false));
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
export { AuthContext };
