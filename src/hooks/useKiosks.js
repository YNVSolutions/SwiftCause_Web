import { useCallback, useEffect, useState } from 'react';
import { getKiosks } from '../api/firestoreService';

export function useKiosks() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kiosks, setKiosks] = useState([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getKiosks();
      setKiosks(list);
    } catch (e) {
      setError('Failed to load kiosks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, error, kiosks, refresh };
}


