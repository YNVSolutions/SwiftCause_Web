import { useState, useEffect } from 'react';
import { getTopCampaigns } from '../../../shared/api/firestoreService';
import { Campaign as FirestoreCampaign } from '../../../shared/types';
import { Campaign } from '../components/FeaturedCampaign';

export function useFeaturedCampaigns(limit: number = 3) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        const firestoreCampaigns = await getTopCampaigns(limit);

        const transformedCampaigns: Campaign[] = firestoreCampaigns
          .filter((c: any) => c.status === 'active')
          .map((c: any, index: number) => ({
            id: c.id,
            title: c.name || c.title || 'Untitled Campaign',
            description: c.description || 'Help us reach our goal and make a difference',
            raised: c.raised || 0,
            goal: c.goal || c.targetAmount || 10000,
            supporters: c.donationCount || c.supporters || 0,
            category: c.category || 'General',
            isActive: c.status === 'active',
            createdAt: c.createdAt,
            gradient: getGradientByIndex(index),
            accentColor: getAccentColorByIndex(index),
          }));

        setCampaigns(transformedCampaigns);
      } catch (err) {
        console.error('Error fetching featured campaigns:', err);
        setError('Failed to load campaigns');
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [limit]);

  return { campaigns, loading, error };
}

function getGradientByIndex(index: number): string {
  const gradients = [
    'from-green-400/20 via-emerald-400/20 to-teal-400/20',
    'from-emerald-400/20 via-teal-400/20 to-cyan-400/20',
    'from-teal-400/20 via-cyan-400/20 to-green-400/20',
  ];
  return gradients[index % gradients.length];
}

function getAccentColorByIndex(index: number): string {
  const colors = ['bg-green-500', 'bg-emerald-500', 'bg-teal-500'];
  return colors[index % colors.length];
}
