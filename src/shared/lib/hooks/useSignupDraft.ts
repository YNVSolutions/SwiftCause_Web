import { useCallback, useEffect, useRef, useState } from 'react';

interface DraftEnvelope<T> {
  data: T;
  updatedAt: number;
}

export function useSignupDraft<T>(key: string, ttlMs: number) {
  const [draft, setDraft] = useState<T | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
    setDraft(null);
    clearTimer();
  }, [clearTimer, key]);

  const scheduleExpiry = useCallback(
    (updatedAt: number) => {
      clearTimer();
      if (!ttlMs || ttlMs <= 0) return;
      const remaining = ttlMs - (Date.now() - updatedAt);
      if (remaining <= 0) {
        clearDraft();
        return;
      }
      timerRef.current = window.setTimeout(() => {
        clearDraft();
      }, remaining);
    },
    [clearDraft, clearTimer, ttlMs]
  );

  const loadDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(key);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as DraftEnvelope<T>;
      if (!parsed?.updatedAt) {
        clearDraft();
        return;
      }
      if (ttlMs && Date.now() - parsed.updatedAt > ttlMs) {
        clearDraft();
        return;
      }
      setDraft(parsed.data);
      scheduleExpiry(parsed.updatedAt);
    } catch {
      clearDraft();
    }
  }, [clearDraft, key, scheduleExpiry, ttlMs]);

  const saveDraft = useCallback(
    (data: T) => {
      if (typeof window === 'undefined') return;
      const envelope: DraftEnvelope<T> = {
        data,
        updatedAt: Date.now()
      };
      sessionStorage.setItem(key, JSON.stringify(envelope));
      scheduleExpiry(envelope.updatedAt);
    },
    [key, scheduleExpiry]
  );

  useEffect(() => {
    loadDraft();
    setIsHydrated(true);
    return () => clearTimer();
  }, [clearTimer, loadDraft]);

  return { draft, saveDraft, clearDraft, isHydrated };
}
