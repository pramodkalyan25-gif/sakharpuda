import { useState, useEffect, useCallback } from 'react';
import { interestService } from '../services/interestService';
import { useAuth } from './useAuth';

/**
 * useInterests — Manage sent/received interests for current user.
 */
export function useInterests() {
  const { user, profile } = useAuth();
  const [received, setReceived]   = useState([]);
  const [sent, setSent]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const loadInterests = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [recv, sentData] = await Promise.all([
        interestService.getReceivedInterests(user.id),
        interestService.getSentInterests(user.id),
      ]);
      setReceived(recv);
      setSent(sentData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInterests();
  }, [loadInterests]);

  const sendInterest = useCallback(async (receiverId) => {
    if (!user?.id || !profile) throw new Error('Not authenticated');
    await interestService.sendInterest(user.id, receiverId, profile);
    await loadInterests();
  }, [user?.id, profile, loadInterests]);

  const acceptInterest = useCallback(async (interestId) => {
    await interestService.acceptInterest(interestId);
    await loadInterests();
  }, [loadInterests]);

  const rejectInterest = useCallback(async (interestId) => {
    await interestService.rejectInterest(interestId);
    await loadInterests();
  }, [loadInterests]);

  const remainingToday = interestService.getRemainingInterests(profile);

  return {
    received,
    sent,
    loading,
    error,
    remainingToday,
    sendInterest,
    acceptInterest,
    rejectInterest,
    refresh: loadInterests,
  };
}
