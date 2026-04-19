import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — Convenience hook for consuming AuthContext.
 * Provides all auth state and actions to any component.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
