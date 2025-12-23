import { useState, useCallback, useEffect } from 'react';
import { getKiosks, getRecentDonations, getCampaigns } from '../../api/firestoreService';
import { getCountFromServer, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Campaign } from '../../types';
import { Kiosk, Donation } from '../../types';

const toErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    return { code: (error as any)?.code || 'error', message: error.message, stack: error.stack || 'No stack trace' };
  }
  if (typeof error === 'object' && error !== null) {
    return {
      code: (error as any).code || 'unknown',
      message: (error as any).message || JSON.stringify(error),
      stack: (error as any).stack || 'No stack trace',
    };
  }
  return { code: 'unknown', message: String(error), stack: 'No stack trace' };
};


interface DashboardStats {
  totalRaised: number;
  totalDonations: number;
  activeCampaigns: number;
  activeKiosks: number;
  topLocations: Array<{ name: string; totalRaised: number }>;
  deviceDistribution: Array<{ name: string; value: number }>;
  donationDistribution: Array<{ range: string; count: number }>;
  donationDistributionError?: boolean;
}

type FirestoreTimestamp = { seconds: number; nanoseconds: number };

export interface Activity {
  id: string;
  type: 'donation' | 'campaign' | 'kiosk';
  message: string;
  timestamp: string;
  timeAgo: string;
  displayTime: string;
  kioskId?: string;
  donationData?: Donation;
  campaignName?: string;
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
    donationDistribution: [],
    donationDistributionError: false,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    // Validate organizationId
    if (!organizationId || typeof organizationId !== 'string' || organizationId.trim() === '') {
      setLoading(false);
      setError("Invalid organization ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [campaignsData, kiosksData, recentDonationsData] = await Promise.all([
        getCampaigns(organizationId) as Promise<Campaign[]>,
        getKiosks(organizationId) as Promise<Kiosk[]>,
        getRecentDonations(10, organizationId) as Promise<Donation[]>
      ]);

      const totalRaised = campaignsData.reduce((acc, campaign: Campaign) => acc + (Number(campaign.raised) || 0), 0);
      const totalDonations = campaignsData.reduce((acc, campaign: Campaign) => acc + (Number(campaign.donationCount) || 0), 0);

      const activeCampaigns = campaignsData.filter((c: Campaign) => c.status === 'active').length;
      const activeKiosks = kiosksData.filter((k: Kiosk) => k.status === 'online').length;


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


      const normalizeOs = (raw?: string): string | null => {
        if (!raw) return null;
        const v = raw.trim().toLowerCase();
        if (!v) return null;
        if (v.includes('ios') || v.includes('ipad')) return 'iOS';
        if (v.includes('android')) return 'Android';
        if (v.includes('windows')) return 'Windows';
        if (v.includes('chrome')) return 'ChromeOS';
        if (v.includes('linux')) return 'Linux';
        return raw.trim();
      };

      const deviceCounts: { [key: string]: number } = {};
      kiosksData.forEach((kiosk: Kiosk) => {
        const normalized = normalizeOs(kiosk.deviceInfo?.os);
        if (normalized) {
          deviceCounts[normalized] = (deviceCounts[normalized] || 0) + 1;
        }
      });
      const deviceDistribution = Object.entries(deviceCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Fetch donation distribution using aggregation queries (more efficient)
      let donationDistribution: Array<{ range: string; count: number }> = [];
      let donationDistributionError = false;
      try {
        // Define amount ranges
        const ranges = [
          { min: 0, max: 100, label: '$0-$100' },
          { min: 100, max: 200, label: '$100-$200' },
          { min: 200, max: 300, label: '$200-$300' },
          { min: 300, max: 400, label: '$300-$400' },
          { min: 400, max: 500, label: '$400-$500' },
          { min: 500, max: 10000, label: '$500+' } // Set reasonable upper limit
        ];

        console.log('Starting donation distribution queries for organization:', organizationId);

        // Use Promise.all to fetch counts in parallel for better performance
        donationDistribution = await Promise.all(
          ranges.map(async (range) => {
            try {
              // Build query for this range
              let rangeQuery = collection(db, 'donations');
              const constraints = [];
              
              if (organizationId) {
                constraints.push(where("organizationId", "==", organizationId));
              }
              constraints.push(where("amount", ">=", range.min));
              if (range.max !== 10000) { // Don't add upper limit for last range
                constraints.push(where("amount", "<", range.max));
              }
              
              const q = query(rangeQuery, ...constraints);
              
              console.log(`Querying donations for range ${range.label} with constraints:`, {
                organizationId,
                minAmount: range.min,
                maxAmount: range.max !== 10000 ? range.max : 'unlimited'
              });
              
              // Use getCountFromServer for efficient counting (doesn't download documents)
              const snapshot = await getCountFromServer(q);
              const count = snapshot.data().count;
              
              console.log(`Count for range ${range.label}:`, count);
              
              return {
                range: range.label,
                count: count
              };
            } catch (error: unknown) {
              const details = toErrorDetails(error);
              console.error(`Error fetching count for range ${range.label}:`, details.message);
              console.error('Error details:', details);
              return {
                range: range.label,
                count: 0
              };
            }
          })
        );

        console.log('Final donation distribution data:', donationDistribution);
        console.log('Total donations across all ranges:', donationDistribution.reduce((sum, item) => sum + item.count, 0));
      } catch (error: unknown) {
        console.error('Failed to fetch donation distribution data:', error);
        // Set empty array so the chart shows "No Donation Data" instead of breaking
        donationDistribution = [];
        donationDistributionError = true;
      }

      setStats({
        totalRaised,
        totalDonations,
        activeCampaigns,
        activeKiosks,
        topLocations,
        deviceDistribution,
        donationDistribution,
        donationDistributionError
      });

      const formattedActivities = recentDonationsData.map((donation: Donation): Activity => {
        const rawTs: any = donation.timestamp;

        // Normalize into ISO string for sorting
        let iso: string;
        if (isFirestoreTimestamp(rawTs)) {
          iso = new Date(rawTs.seconds * 1000).toISOString();
        }
        else {
          iso = safeIso(String(rawTs));
        }

        const platform: string | undefined = (donation as any).platform;
        const campaignName =
          campaignsData.find(c => c.id === donation.campaignId)?.title ||
          donation.campaignId;

        const dateObj = new Date(iso);
        

        return {
          id: donation.id,
          type: "donation",
          message: `New donation of $${donation.amount} for campaign ${campaignName}`,

          // raw ISO used for sorting
          timestamp: iso,

          // "x minutes ago", "yesterday", etc.
          timeAgo: getTimeBucket(iso),

          // Human-friendly time if needed
          displayTime: isNaN(dateObj.getTime()) ? "Invalid timestamp" : dateObj.toLocaleString(), 

          ...(platform ? { kioskId: platform } : {}),
          
          // Include full donation data for detail view
          // ⚠️ SECURITY NOTE: This exposes PII (email, phone, name) to client
          // TODO: Sanitize or use server-side API to filter sensitive fields
          donationData: donation,
          campaignName: campaignName
        } as Activity;
      });

      // Sort by real ISO timestamp
      formattedActivities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );


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
  }, [organizationId]);

  return { loading, error, stats, recentActivities, alerts, refreshDashboard: fetchDashboardData };
}

function getTimeBucket(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // --- Under 1 hour ---
  if (diffMinutes < 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  // --- Under 1 day ---
  if (diffHours < 24) return `${diffHours} hours ago`;

  // --- Yesterday ---
  if (diffDays === 1) return "Yesterday";

  // For week/month calculations:
  const nowDay = now.getDay();            // 0 = Sun

  // --- This Week ---
  // Same week if both fall after last Sunday
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - nowDay);

  if (date >= startOfWeek) return "This week";

  // --- Last Week ---
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  if (date >= startOfLastWeek && date < startOfWeek) return "Last week";

  // --- Earlier This Month ---
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (date >= startOfMonth) return "Earlier this month";

  // --- Last Month ---
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day of previous month

  if (date >= startOfLastMonth && date <= endOfLastMonth) return "Last month";

  // --- Older ---
  return "Older";
}

function isFirestoreTimestamp(value: unknown): value is FirestoreTimestamp {
  return (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (value as any).seconds === "number" &&
    "nanoseconds" in value &&
    typeof (value as any).nanoseconds === "number"
  );
}

function safeIso(input: string): string {
  const d = new Date(input);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
