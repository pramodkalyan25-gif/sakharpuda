import { useAuthContext } from '../context/AuthContext';

/**
 * useAuth — Convenience hook for consuming AuthContext.
 * Provides all auth state and actions to any component.
 */
export function useAuth() {
  return useAuthContext();
}
