import { useCallback, useEffect, useState } from 'react';
import { getKiosks } from '../../api/firestoreService';

export function useKiosks(organizationId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kiosks, setKiosks] = useState<any[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getKiosks(organizationId);
      setKiosks(list);
    } catch (e) {
      setError('Failed to load kiosks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    refresh();
  }, [refresh, organizationId]);

  return { loading, error, kiosks, refresh };
}
