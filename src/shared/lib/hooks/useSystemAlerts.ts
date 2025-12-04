import { useState, useEffect } from "react";
import { Organization, Kiosk, Campaign } from "../../types";
import { getKiosks, getAllCampaigns } from "../../api/firestoreService";

export type AlertSeverity = "critical" | "warning" | "info" | "success";

export interface SystemAlert {
  id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  actionScreen?: string;
  metadata?: Record<string, any>;
}

interface UseSystemAlertsProps {
  organization: Organization | null;
  organizationId?: string;
}

export function useSystemAlerts({ organization, organizationId }: UseSystemAlertsProps) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const checkAlerts = async () => {
      setLoading(true);
      const newAlerts: SystemAlert[] = [];

      try {
        // 1. Check Stripe Connection (Critical)
        if (!organization?.stripe?.accountId) {
          newAlerts.push({
            id: "stripe-not-connected",
            type: "stripe_not_connected",
            severity: "critical",
            title: "Stripe Not Connected",
            message: "Your organization has not set up a Stripe account yet. Donations cannot be processed.",
            actionScreen: "admin-dashboard", // Will navigate to Stripe setup on dashboard
          });
        }

        // Fetch kiosks and campaigns
        const [kiosksData, campaignsData] = await Promise.all([
          getKiosks(organizationId).catch(() => []),
          getAllCampaigns(organizationId).catch(() => []),
        ]);

        const kiosks = kiosksData as Kiosk[];
        const campaigns = campaignsData as Campaign[];

        // 2. Check Kiosk Offline (Warning)
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        kiosks.forEach((kiosk) => {
          // Check if kiosk is marked as offline
          if (kiosk.status === "offline") {
            newAlerts.push({
              id: `kiosk-offline-${kiosk.id}`,
              type: "kiosk_offline",
              severity: "warning",
              title: "Kiosk Offline",
              message: `Kiosk "${kiosk.name}" at ${kiosk.location || "Unknown Location"} is offline.`,
              actionScreen: "admin-kiosks",
              metadata: { kioskId: kiosk.id, kioskName: kiosk.name, location: kiosk.location },
            });
          } else if (kiosk.lastActive) {
            // Check if kiosk hasn't checked in for over 24 hours
            const lastActiveDate = new Date(kiosk.lastActive);
            if (lastActiveDate < twentyFourHoursAgo && kiosk.status !== "maintenance") {
              newAlerts.push({
                id: `kiosk-inactive-${kiosk.id}`,
                type: "kiosk_inactive",
                severity: "warning",
                title: "Kiosk Inactive",
                message: `Kiosk "${kiosk.name}" at ${kiosk.location || "Unknown Location"} hasn't checked in for over 24 hours.`,
                actionScreen: "admin-kiosks",
                metadata: { kioskId: kiosk.id, kioskName: kiosk.name, location: kiosk.location },
              });
            }
          }
        });

        // 3. Check Empty Kiosk (Warning)
        kiosks.forEach((kiosk) => {
          if (kiosk.status === "online" || kiosk.status === "maintenance") {
            const assignedCampaignIds = kiosk.assignedCampaigns || [];
            if (assignedCampaignIds.length === 0) {
              newAlerts.push({
                id: `kiosk-empty-${kiosk.id}`,
                type: "kiosk_empty",
                severity: "warning",
                title: "Empty Kiosk",
                message: `Kiosk "${kiosk.name}" at ${kiosk.location || "Unknown Location"} is active but has no campaigns assigned.`,
                actionScreen: "admin-kiosks",
                metadata: { kioskId: kiosk.id, kioskName: kiosk.name, location: kiosk.location },
              });
            }
          }
        });

        // 4. Check All Campaigns Expired for Kiosk (Warning)
        kiosks.forEach((kiosk) => {
          if (kiosk.status === "online" || kiosk.status === "maintenance") {
            const assignedCampaignIds = kiosk.assignedCampaigns || [];
            if (assignedCampaignIds.length > 0) {
              const assignedCampaigns = campaigns.filter((c) =>
                assignedCampaignIds.includes(c.id)
              );
              const now = new Date();
              const allExpired = assignedCampaigns.every((campaign) => {
                if (!campaign.endDate) return false;
                let endDate: Date;
                const endDateValue = campaign.endDate as any;
                if (endDateValue instanceof Date) {
                  endDate = endDateValue;
                } else if (typeof endDateValue === 'object' && endDateValue !== null && 'seconds' in endDateValue) {
                  endDate = new Date(endDateValue.seconds * 1000);
                } else if (typeof endDateValue === 'string') {
                  endDate = new Date(endDateValue);
                } else {
                  return false;
                }
                return endDate < now && !isNaN(endDate.getTime());
              });

              if (allExpired && assignedCampaigns.length > 0) {
                newAlerts.push({
                  id: `kiosk-all-expired-${kiosk.id}`,
                  type: "kiosk_all_campaigns_expired",
                  severity: "warning",
                  title: "All Campaigns Expired",
                  message: `Kiosk "${kiosk.name}" at ${kiosk.location || "Unknown Location"} is running, but all assigned campaigns have expired.`,
                  actionScreen: "admin-kiosks",
                  metadata: { kioskId: kiosk.id, kioskName: kiosk.name, location: kiosk.location },
                });
              }
            }
          }
        });

        // 5. Check Campaign Expiring Soon (Info)
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        campaigns.forEach((campaign) => {
          if (campaign.endDate && campaign.status === "active") {
            let endDate: Date;
            const endDateValue = campaign.endDate as any;
            if (endDateValue instanceof Date) {
              endDate = endDateValue;
            } else if (typeof endDateValue === 'object' && endDateValue !== null && 'seconds' in endDateValue) {
              endDate = new Date(endDateValue.seconds * 1000);
            } else if (typeof endDateValue === 'string') {
              endDate = new Date(endDateValue);
            } else {
              return;
            }
            
            if (isNaN(endDate.getTime())) return;
            
            if (endDate >= now && endDate <= threeDaysFromNow) {
              newAlerts.push({
                id: `campaign-expiring-${campaign.id}`,
                type: "campaign_expiring_soon",
                severity: "info",
                title: "Campaign Expiring Soon",
                message: `Campaign "${campaign.title}" is set to end within the next 3 days.`,
                actionScreen: "admin-campaigns",
                metadata: { campaignId: campaign.id, campaignTitle: campaign.title, endDate: endDate.toISOString() },
              });
            }
          }
        });

        // 6. Check Goal Reached (Success)
        campaigns.forEach((campaign) => {
          if (campaign.status === "active" && campaign.goal > 0 && campaign.raised >= campaign.goal) {
            newAlerts.push({
              id: `campaign-goal-reached-${campaign.id}`,
              type: "campaign_goal_reached",
              severity: "success",
              title: "Goal Reached!",
              message: `Campaign "${campaign.title}" has met or exceeded its fundraising goal.`,
              actionScreen: "admin-campaigns",
              metadata: { campaignId: campaign.id, campaignTitle: campaign.title, goal: campaign.goal, raised: campaign.raised },
            });
          }
        });
      } catch (error) {
        console.error("Error checking system alerts:", error);
      } finally {
        setAlerts(newAlerts);
        setLoading(false);
      }
    };

    checkAlerts();
  }, [organization, organizationId]);

  return { alerts, loading };
}

