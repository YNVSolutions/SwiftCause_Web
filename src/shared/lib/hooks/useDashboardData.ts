import { useState, useCallback, useEffect } from 'react';
import { getKiosks, getRecentDonations, getCampaigns } from '../../api/firestoreService';
import { collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Campaign } from '../../types';
import { Kiosk, Donation } from '../../types';

const getStringProp = (value: unknown, key: string): string | undefined => {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const prop = record[key];
  return typeof prop === 'string' ? prop : undefined;
};

const toErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    return {
      code: getStringProp(error, 'code') ?? 'error',
      message: error.message,
      stack: error.stack || 'No stack trace',
    };
  }
  if (typeof error === 'object' && error !== null) {
    return {
      code: getStringProp(error, 'code') ?? 'unknown',
      message: getStringProp(error, 'message') ?? JSON.stringify(error),
      stack: getStringProp(error, 'stack') ?? 'No stack trace',
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
  donationDistributionError?: string;
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

      // Fetch donation distribution - using client-side counting to avoid index requirements
      let donationDistribution: Array<{ range: string; count: number }> = [];
      let donationDistributionError: string | undefined;
      
      try {
        // Define amount ranges
        const ranges = [
          { min: 0, max: 100, label: '£0-£100', isLast: false },
          { min: 100, max: 200, label: '£100-£200', isLast: false },
          { min: 200, max: 300, label: '£200-£300', isLast: false },
          { min: 300, max: 400, label: '£300-£400', isLast: false },
          { min: 400, max: 500, label: '£400-£500', isLast: false },
          { min: 500, max: 10000, label: '£500+', isLast: true }
        ];

        // Fetch all donations for this organization (client-side counting approach)
        const { getDocs } = await import('firebase/firestore');
        const donationsQuery = query(
          collection(db, 'donations'),
          where("organizationId", "==", organizationId)
        );
        const donationsSnapshot = await getDocs(donationsQuery);
        
        // Initialize counts for each range
        donationDistribution = ranges.map(range => ({
          range: range.label,
          count: 0
        }));

        // Count donations in each range
        donationsSnapshot.forEach((doc) => {
          const donation = doc.data();
          let amount = donation.amount;
          
          // Handle string amounts
          if (typeof amount === 'string') {
            amount = parseFloat(amount);
          }
          
          // Skip invalid amounts
          if (typeof amount !== 'number' || isNaN(amount)) {
            console.warn('Invalid amount in donation:', doc.id, amount);
            return;
          }

          // Find which range this donation belongs to
          for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            if (range.isLast) {
              // Last range: amount >= min
              if (amount >= range.min) {
                donationDistribution[i].count++;
                break;
              }
            } else {
              // Other ranges: min <= amount < max
              if (amount >= range.min && amount < range.max) {
                donationDistribution[i].count++;
                break;
              }
            }
          }
        });
        
      } catch (error) {
        console.error('Donation distribution query failed:', error);
        const details = toErrorDetails(error);
        console.error('Error details:', details);
        donationDistribution = [];
        donationDistributionError = 'Error in fetching donation data';
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
        const rawTs: unknown = donation.timestamp;

        // Normalize into ISO string for sorting
        let iso: string;
        if (isFirestoreTimestamp(rawTs)) {
          iso = new Date(rawTs.seconds * 1000).toISOString();
        }
        else {
          iso = safeIso(String(rawTs));
        }

        const donationExtras = donation as Donation & { platform?: unknown };
        const platform = typeof donationExtras.platform === 'string' ? donationExtras.platform : undefined;
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
  }, [fetchDashboardData]);

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
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as { seconds?: unknown; nanoseconds?: unknown };
  return typeof record.seconds === "number" && typeof record.nanoseconds === "number";
}

function safeIso(input: string): string {
  const d = new Date(input);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
