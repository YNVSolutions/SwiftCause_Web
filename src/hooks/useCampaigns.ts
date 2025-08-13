import { useCallback, useEffect, useState } from 'react';
import { getCampaigns, getTopCampaigns, getAllCampaigns, updateCampaign } from '../api/firestoreService';

export interface UseCampaignsState<TCampaign = any> {
  loading: boolean;
  error: string | null;
  campaigns: TCampaign[];
  refresh: () => Promise<void>;
  update: (id: string, data: Partial<TCampaign>) => Promise<void>;
  getTop: (limitCount: number) => Promise<TCampaign[]>;
}

export function useCampaigns<TCampaign = any>(): UseCampaignsState<TCampaign> {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<TCampaign[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getCampaigns();
      setCampaigns(list as TCampaign[]);
    } catch (e: any) {
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOne = useCallback(async (id: string, data: Partial<TCampaign>) => {
    await updateCampaign(id, data as any);
    setCampaigns(prev => prev.map(c => ((c as any).id === id ? { ...(c as any), ...data } : c)));
  }, []);

  const getTop = useCallback(async (limitCount: number) => {
    return (await getTopCampaigns(limitCount)) as TCampaign[];
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    loading,
    error,
    campaigns,
    refresh: fetchAll,
    update: updateOne,
    getTop
  };
}


