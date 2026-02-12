import { useState, useCallback, useEffect } from 'react';
import { getKiosks, getRecentDonations, getCampaigns } from '../../api/firestoreService';
import { formatCurrency } from '../currencyFormatter';
import { collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Campaign } from '../../types';
import { Kiosk, Donation } from '../../types';


interface DashboardStats {
  totalRaised: number;
  totalDonations: number;
  activeCampaigns: number;
  activeKiosks: number;
  totalGiftAid: number;
  topLocations: Array<{ name: string; totalRaised: number }>;
  deviceDistribution: Array<{ name: string; value: number }>;
  donationDistribution: Array<{ range: string; count: number }>;
  donationDistributionError?: string;
  monthlyRevenue: Array<{ month: string; donationRevenue: number; totalRevenue: number }>;
  heatmapData: Array<{ day: string; hour: number; value: number; donations: number }>;
  categoryData: Array<{ name: string; value: number; percentage: number; color: string }>;
  topCampaigns: Array<{ id: string; name: string; raised: number; goal: number; percentage: number; donationCount: number }>;
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
    totalGiftAid: 0,
    topLocations: [],
    deviceDistribution: [],
    donationDistribution: [],
    monthlyRevenue: [],
    heatmapData: [],
    categoryData: [],
    topCampaigns: [],
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

      // Initialize Gift Aid total
      let totalGiftAid = 0;


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

      // Fetch donation distribution by category - using client-side counting to avoid index requirements
      let donationDistribution: Array<{ range: string; count: number }> = [];
      let donationDistributionError: string | undefined;
      
      // Declare categoryTotals outside try block so it's accessible in catch block
      const categoryTotals: { [category: string]: { count: number; amount: number } } = {};
      
      // Declare monthlyRevenue outside try block so it's accessible in catch block
      let monthlyRevenue: Array<{ month: string; donationRevenue: number; totalRevenue: number }> = [];
      
      // Declare heatmapData outside try block so it's accessible in catch block
      let heatmapData: Array<{ day: string; hour: number; value: number; donations: number }> = [];
      
      // Declare categoryData and topCampaigns outside try block so they're accessible in catch block
      let categoryData: Array<{ name: string; value: number; percentage: number; color: string }> = [];
      let topCampaigns: Array<{ id: string; name: string; raised: number; goal: number; percentage: number; donationCount: number }> = [];
      
      try {
        // Fetch all donations for this organization (client-side counting approach)
        const { getDocs } = await import('firebase/firestore');
        const donationsQuery = query(
          collection(db, 'donations'),
          where("organizationId", "==", organizationId)
        );
        
        const donationsSnapshot = await getDocs(donationsQuery);
        
        // Create a map of campaign ID to category using existing campaigns data
        const campaignCategoryMap: { [campaignId: string]: string } = {};
        campaignsData.forEach((campaign: Campaign) => {
          if (campaign.id && campaign.category) {
            campaignCategoryMap[campaign.id] = campaign.category;
          }
        });

        // Count donations by category

        donationsSnapshot.forEach((doc) => {
          const donation = doc.data();
          const campaignId = donation.campaignId;
          
          // Calculate Gift Aid (25% of donation if eligible)
          if (donation.isGiftAid && donation.amount) {
            totalGiftAid += donation.amount * 0.25;
          }
          
          // First try to get category directly from donation
          let category = donation.category;
          
          // If no direct category, try to get from campaign mapping
          if (!category && campaignId) {
            category = campaignCategoryMap[campaignId];
          }
          
          // If still no category but it's a Gift Aid donation, use "Gift Aid" as category
          if (!category && donation.isGiftAid) {
            category = "Gift Aid";
          }
          
          // If still no category, use "Uncategorized" as fallback
          if (!category) {
            category = "Uncategorized";
          }

          let amount = donation.amount;
          
          // Handle string amounts
          if (typeof amount === 'string') {
            amount = parseFloat(amount);
          }
          
          // Skip invalid amounts
          if (typeof amount !== 'number' || isNaN(amount)) {
            return;
          }

          // Initialize category if not exists
          if (!categoryTotals[category]) {
            categoryTotals[category] = { count: 0, amount: 0 };
          }

          // Add to category totals
          categoryTotals[category].count++;
          categoryTotals[category].amount += amount;
          totalDonationCount++;
          totalDonationAmount += amount;
        });

        // Convert to the expected format with percentages
        donationDistribution = Object.entries(categoryTotals)
          .map(([category, data]) => ({
            range: category, // Using 'range' field to maintain compatibility with existing chart component
            count: data.count
          }))
          .sort((a, b) => b.count - a.count); // Sort by count descending
        
        // Compute monthly revenue data
        const monthlyRevenueMap: { [month: string]: { donationRevenue: number; giftAidAmount: number } } = {};
        
        // Process donations again for monthly revenue calculation
        donationsSnapshot.forEach((doc) => {
          const donation = doc.data();
          let amount = donation.amount;
          
          // Handle string amounts
          if (typeof amount === 'string') {
            amount = parseFloat(amount);
          }
          
          // Skip invalid amounts
          if (typeof amount !== 'number' || isNaN(amount)) {
            return;
          }

          // Get donation timestamp
          const timestamp = donation.timestamp;
          let donationDate: Date;
          
          if (isFirestoreTimestamp(timestamp)) {
            donationDate = new Date(timestamp.seconds * 1000);
          } else {
            donationDate = new Date(timestamp);
          }
          
          // Skip invalid dates
          if (isNaN(donationDate.getTime())) {
            return;
          }

          // Get month key (e.g., "2024-01")
          const monthKey = `${donationDate.getFullYear()}-${String(donationDate.getMonth() + 1).padStart(2, '0')}`;
          
          // Initialize month if not exists
          if (!monthlyRevenueMap[monthKey]) {
            monthlyRevenueMap[monthKey] = { donationRevenue: 0, giftAidAmount: 0 };
          }
          
          // Add to donation revenue
          monthlyRevenueMap[monthKey].donationRevenue += amount;
          
          // Add Gift Aid amount (25% of donation if eligible)
          if (donation.isGiftAid) {
            monthlyRevenueMap[monthKey].giftAidAmount += amount * 0.25;
          }
        });

        // Convert to array format for chart: two previous, current, and two next months
        monthlyRevenue = [];
        const currentDate = new Date();
        
        for (let offset = -2; offset <= 2; offset++) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleDateString('en-GB', { month: 'short' });
          
          const monthData = monthlyRevenueMap[monthKey] || { donationRevenue: 0, giftAidAmount: 0 };
          
          monthlyRevenue.push({
            month: monthName,
            donationRevenue: monthData.donationRevenue,
            totalRevenue: monthData.donationRevenue + monthData.giftAidAmount
          });
        }
        
        // Compute heatmap data from donations
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const heatmapMatrix: { [key: string]: number } = {};
        
        // Initialize 7x24 matrix with zeros
        days.forEach(day => {
          for (let hour = 0; hour < 24; hour++) {
            heatmapMatrix[`${day}-${hour}`] = 0;
          }
        });
        
        // Process donations for heatmap
        donationsSnapshot.forEach((doc) => {
          const donation = doc.data();
          const timestamp = donation.timestamp;
          let donationDate: Date;
          
          if (isFirestoreTimestamp(timestamp)) {
            donationDate = new Date(timestamp.seconds * 1000);
          } else {
            donationDate = new Date(timestamp);
          }
          
          // Skip invalid dates
          if (isNaN(donationDate.getTime())) {
            return;
          }

          // Get day of week (0 = Sunday, 1 = Monday, etc.)
          const dayOfWeek = donationDate.getDay();
          // Convert to our format (Monday = 0, Sunday = 6)
          const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const day = days[dayIndex];
          const hour = donationDate.getHours();
          
          const key = `${day}-${hour}`;
          heatmapMatrix[key]++;
        });

        // Find maximum count for normalization
        const maxCount = Math.max(...Object.values(heatmapMatrix), 1);
        
        // Convert to heatmap data format with normalization
        heatmapData = [];
        days.forEach(day => {
          for (let hour = 0; hour < 24; hour++) {
            const key = `${day}-${hour}`;
            const donations = heatmapMatrix[key];
            const value = donations / maxCount; // Normalize to 0-1 scale
            
            heatmapData.push({
              day,
              hour,
              value,
              donations
            });
          }
        });
        
        // Transform donation distribution for donut chart
        const colors = ['#4F46E5', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316', '#84CC16'];
        const totalDonations = donationDistribution.reduce((sum, item) => sum + item.count, 0);
        
        categoryData = donationDistribution.map((item, index) => ({
          name: item.range,
          value: item.count,
          percentage: totalDonations > 0 ? Math.round((item.count / totalDonations) * 100) : 0,
          color: colors[index % colors.length]
        }));

        // Transform campaigns data for top performing campaigns
        topCampaigns = campaignsData
          .filter((campaign: Campaign) => campaign.goal && campaign.goal > 0)
          .map((campaign: Campaign) => ({
            id: campaign.id,
            name: campaign.title || 'Untitled Campaign',
            raised: campaign.raised || 0,
            goal: campaign.goal || 0,
            percentage: Math.round(((campaign.raised || 0) / (campaign.goal || 1)) * 100),
            donationCount: campaign.donationCount || 0
          }))
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 5);
      } catch {
        donationDistribution = [];
        donationDistributionError = 'Error in fetching donation data';
        
        // Set default empty monthly revenue data for two previous, current, and two next months
        monthlyRevenue = [];
        const currentDate = new Date();
        
        for (let offset = -2; offset <= 2; offset++) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
          const monthName = date.toLocaleDateString('en-GB', { month: 'short' });
          
          monthlyRevenue.push({
            month: monthName,
            donationRevenue: 0,
            totalRevenue: 0
          });
        }
        
        // Set default empty heatmap data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        heatmapData = [];
        days.forEach(day => {
          for (let hour = 0; hour < 24; hour++) {
            heatmapData.push({
              day,
              hour,
              value: 0,
              donations: 0
            });
          }
        });
        
        // Set default empty category and campaign data
        categoryData = [];
        topCampaigns = [];
      }

      setStats({
        totalRaised,
        totalDonations,
        activeCampaigns,
        activeKiosks,
        totalGiftAid,
        topLocations,
        deviceDistribution,
        donationDistribution,
        donationDistributionError,
        monthlyRevenue,
        heatmapData,
        categoryData,
        topCampaigns
      });

      const formattedActivities = recentDonationsData.map((donation: Donation): Activity => {
        const rawTs: FirestoreTimestamp | string | Date = donation.timestamp as FirestoreTimestamp | string | Date;

        // Normalize into ISO string for sorting
        let iso: string;
        if (isFirestoreTimestamp(rawTs)) {
          iso = new Date(rawTs.seconds * 1000).toISOString();
        }
        else {
          iso = safeIso(String(rawTs));
        }

        const platform: string | undefined = (donation as Donation & { platform?: string }).platform;
        const campaignName =
          campaignsData.find(c => c.id === donation.campaignId)?.title ||
          donation.campaignId;

        const dateObj = new Date(iso);
        const donationAmount =
          typeof donation.amount === 'string'
            ? Number(donation.amount)
            : donation.amount;
        

        return {
          id: donation.id,
          type: "donation",
          message: `New donation of ${formatCurrency(donationAmount || 0)} for campaign ${campaignName}`,

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

    } catch {
      setError('Could not load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
  return (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (value as FirestoreTimestamp).seconds === "number" &&
    "nanoseconds" in value &&
    typeof (value as FirestoreTimestamp).nanoseconds === "number"
  );
}

function safeIso(input: string): string {
  const d = new Date(input);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
