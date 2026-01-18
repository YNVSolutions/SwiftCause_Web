import { useState, useEffect } from 'react';
import { getTopCampaigns } from '../../../shared/api/firestoreService';
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
          .filter((campaign) => (campaign as { status?: unknown }).status === 'active')
          .map((campaign, index) => {
            const data = campaign as Record<string, unknown>;
            const title =
              (typeof data.name === 'string' && data.name) ||
              (typeof data.title === 'string' && data.title) ||
              'Untitled Campaign';
            const description =
              typeof data.description === 'string'
                ? data.description
                : 'Help us reach our goal and make a difference';
            const raised = typeof data.raised === 'number' ? data.raised : 0;
            const goal =
              typeof data.goal === 'number'
                ? data.goal
                : typeof data.targetAmount === 'number'
                  ? data.targetAmount
                  : 10000;
            const supporters =
              typeof data.donationCount === 'number'
                ? data.donationCount
                : typeof data.supporters === 'number'
                  ? data.supporters
                  : 0;
            const category = typeof data.category === 'string' ? data.category : 'General';
            const createdAt = typeof data.createdAt === 'string' ? data.createdAt : undefined;
            const id = typeof data.id === 'string' || typeof data.id === 'number'
              ? data.id
              : `campaign-${index}`;

            return {
              id,
              title,
              description,
              raised,
              goal,
              supporters,
              category,
              isActive: (data.status as string | undefined) === 'active',
              createdAt,
              gradient: getGradientByIndex(index),
              accentColor: getAccentColorByIndex(index),
            };
          });

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
