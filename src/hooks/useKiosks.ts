import { useCallback, useEffect, useState } from 'react';
import { getKiosks } from '../api/firestoreService';

export interface UseKiosksState<TKiosk = any> {
  loading: boolean;
  error: string | null;
  kiosks: TKiosk[];
  refresh: () => Promise<void>;
}

export function useKiosks<TKiosk = any>(): UseKiosksState<TKiosk> {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kiosks, setKiosks] = useState<TKiosk[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getKiosks();
      setKiosks(list as TKiosk[]);
    } catch (e: any) {
      setError('Failed to load kiosks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { loading, error, kiosks, refresh: fetchAll };
}


