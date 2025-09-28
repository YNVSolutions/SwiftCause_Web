import { useState, useCallback, useEffect } from 'react';
import { getAllCampaigns, getKiosks, getRecentDonations, getCampaigns } from '../api/firestoreService';
import { DocumentData, Timestamp } from 'firebase/firestore';
import { Campaign } from '../App';

interface Kiosk {
  id: string;
  status?: 'online' | 'offline' | 'maintenance';
  name?: string;
  location?: string;
  totalRaised?: number;
  deviceInfo?: {
    os?: string;
    model?: string;
    screenSize?: string;
    touchCapable?: boolean;
  };
}

interface Donation {
  id: string;
  amount: number;
  campaignId: string;
  timestamp: Timestamp;
  platform?: string; // This might be kioskId
}

interface DashboardStats {
  totalRaised: number;
  totalDonations: number;
  activeCampaigns: number;
  activeKiosks: number;
  topLocations: Array<{ name: string; totalRaised: number }>;
  deviceDistribution: Array<{ name: string; value: number }>;
}

export interface Activity {
  id: string;
  type: 'donation' | 'campaign' | 'kiosk';
  message: string;
  timestamp: string;
  kioskId?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export function useDashboardData(organizationId?: string) {
  const [stats, setStats] = useState<DashboardStats>({
    totalRaised: 0,
    totalDonations: 0,
    activeCampaigns: 0,
    activeKiosks: 0,
    topLocations: [],
    deviceDistribution: [],
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false);
      setError("Organization ID is not available.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [campaignsData, kiosksData, recentDonationsData] = await Promise.all([
        getCampaigns(organizationId) as Promise<Campaign[]>,
        getKiosks(organizationId) as Promise<Kiosk[]>,
        getRecentDonations(5, organizationId) as Promise<Donation[]> 
      ]);

      const totalRaised = campaignsData.reduce((acc, campaign: Campaign) => acc + (Number(campaign.raised) || 0), 0);
      const totalDonations = campaignsData.reduce((acc, campaign: Campaign) => acc + (Number(campaign.donationCount) || 0), 0);
      
      const activeCampaigns = campaignsData.filter((c: Campaign) => c.status === 'active').length;
      const activeKiosks = kiosksData.filter((k: Kiosk) => k.status === 'online').length;

      // Process Geographic Data - Group kiosks by location and sum totalRaised
      const locationGroups: { [key: string]: number } = {};
      kiosksData.forEach((kiosk: Kiosk) => {
        if (kiosk.location && kiosk.totalRaised) {
          locationGroups[kiosk.location] = (locationGroups[kiosk.location] || 0) + kiosk.totalRaised;
        }
      });
      const topLocations = Object.entries(locationGroups)
        .map(([name, totalRaised]) => ({ name, totalRaised }))
        .sort((a, b) => b.totalRaised - a.totalRaised)
        .slice(0, 5);

      // Process Device Data - Count occurrences of each device OS
      const deviceCounts: { [key: string]: number } = {};
      kiosksData.forEach((kiosk: Kiosk) => {
        if (kiosk.deviceInfo?.os) {
          deviceCounts[kiosk.deviceInfo.os] = (deviceCounts[kiosk.deviceInfo.os] || 0) + 1;
        }
      });
      const deviceDistribution = Object.entries(deviceCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setStats({ 
        totalRaised, 
        totalDonations, 
        activeCampaigns, 
        activeKiosks, 
        topLocations, 
        deviceDistribution 
      });

      const formattedActivities = recentDonationsData.map((donation: Donation): Activity => {
        const timestamp = donation.timestamp; 
        return {
          id: donation.id,
          type: 'donation',
          message: `New donation of $${donation.amount} for campaign ${donation.campaignId}`,
          timestamp: timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : 'N/A',
          kioskId: donation.platform,
        };
      });
      setRecentActivities(formattedActivities);

      const offlineKioskAlerts = kiosksData
        .filter((kiosk: Kiosk) => kiosk.status === 'offline')
        .map((kiosk: Kiosk): Alert => ({
          id: kiosk.id,
          type: 'warning',
          message: `Kiosk ${kiosk.name} at ${kiosk.location} is offline.`,
          priority: 'medium',
        }));
      setAlerts(offlineKioskAlerts);

    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
      setError('Could not load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { loading, error, stats, recentActivities, alerts, refreshDashboard: fetchDashboardData };
}