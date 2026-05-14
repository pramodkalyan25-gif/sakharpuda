import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { photoService } from '../services/photoService';
import { AuthContext } from './AuthContextInstance';

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [profile, setProfile]     = useState(null);
  const [session, setSession]     = useState(null);
  const [loading, setLoading]     = useState(true);
   const [isAdmin, setIsAdmin]     = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const loadProfile = useCallback(async (userId) => {
    try {
      const exists = await profileService.profileExists(userId);
      if (exists) {
        const [p, photo] = await Promise.all([
          profileService.getOwnProfile(userId),
          photoService.getPrimaryPhoto(userId).catch(() => null)
        ]);
        setProfile(p || null);
        setIsAdmin(p?.is_admin || false);
        if (photo?.signed_url) setAvatarUrl(photo.signed_url);
        else setAvatarUrl(null);
        return !!p;
      }
      setProfile(null);
      setIsAdmin(false);
      setAvatarUrl(null);
      return false;
    } catch (err) {
      console.error('[AuthContext] Error loading profile:', err.message);
      // If it's a database schema error, show a toast so the user knows
      if (err.message?.includes('column') || err.message?.includes('schema')) {
        toast.error('Database Error: Please ensure you have run the required SQL migrations.');
      }
      setProfile(null);
      setAvatarUrl(null);
      return false;
    }
  }, []);

  useEffect(() => {
    // Restore session on mount — await profile load before clearing loading flag
    authService.getSession().then(async (s) => {
      setSession(s);
      setUser(s?.user ?? null);
      // Admin status will be set by loadProfile if user exists
      
      if (s?.user) {
        await loadProfile(s.user.id);
      }

      // If we have a hash or search params with auth info, don't set loading=false yet.
      // Let onAuthStateChange handle the incoming session to avoid UI flicker.
      const hasAuthParams = window.location.hash.includes('access_token=') || 
                            window.location.search.includes('code=');
      
      if (!hasAuthParams || s) {
        setLoading(false);
      }
    });

    // Listen for auth state changes (fires on login/logout)
    const subscription = authService.onAuthStateChange((event, newSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
      }
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      // Admin status will be set by loadProfile if user exists

      if (newSession?.user) {
        // Set loading=true BEFORE the async profile fetch so ProtectedRoute
        // shows a spinner instead of rendering Dashboard with profile=null
        setLoading(true);
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
    setAvatarUrl(null);
  }, []);

  const value = {
    user,
    session,
    profile,
    avatarUrl,
    loading,
    isAdmin,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    refreshProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
