import { useCallback, useEffect, useState } from 'react';
import { getCampaigns, getTopCampaigns, getAllCampaigns, updateCampaign, updateCampaignWithImage, createCampaign, createCampaignWithImage, deleteCampaign } from '../../../shared/api';

export function useCampaigns(organizationId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getCampaigns(organizationId);
      setCampaigns(list);
    } catch (e) {
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const update = useCallback(async (id: string, data: any) => {
    await updateCampaign(id, data);
    setCampaigns(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const updateWithImage = useCallback(async (id: string, data: any) => {
    try {
      const updatedData = await updateCampaignWithImage(id, data);
      setCampaigns(prev => prev.map(c => (c.id === id ? { ...c, ...updatedData } : c)));
      return updatedData;
    } catch (error) {
      throw error;
    }
  }, []);

  const getTop = useCallback(async (limitCount: number) => {
    return await getTopCampaigns(limitCount);
  }, []);

  const create = useCallback(async (data: any) => {
    try {
      const newCampaign = await createCampaign(data);
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (error) {
      throw error;
    }
  }, []);

  const createWithImage = useCallback(async (data: any) => {
    try {
      const newCampaign = await createCampaignWithImage(data);
      setCampaigns(prev => [...prev, newCampaign]);
      return newCampaign;
    } catch (error) {
      throw error;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteCampaign(id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, organizationId]);

  return { loading, error, campaigns, refresh, update, updateWithImage, getTop, create, createWithImage, remove };
}
