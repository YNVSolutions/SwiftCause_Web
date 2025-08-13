import { useCallback, useEffect, useState } from 'react';
import { getCampaigns, getTopCampaigns, getAllCampaigns, updateCampaign } from '../api/firestoreService';

export function useCampaigns() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getCampaigns();
      setCampaigns(list);
    } catch (e) {
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id, data) => {
    await updateCampaign(id, data);
    setCampaigns(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const getTop = useCallback(async (limitCount) => {
    return await getTopCampaigns(limitCount);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, error, campaigns, refresh, update, getTop };
}


