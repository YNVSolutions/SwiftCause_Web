// Kiosk-related types
export interface Kiosk {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "maintenance";
  lastActive?: string;
  totalDonations?: number;
  totalRaised?: number;
  accessCode: string;
  qrCode?: string;
  assignedCampaigns?: string[];
  defaultCampaign?: string;
  settings?: {
    displayMode: "grid" | "list" | "carousel";
    showAllCampaigns: boolean;
    maxCampaignsDisplay: number;
    autoRotateCampaigns: boolean;
    rotationInterval?: number;
  };
  deviceInfo?: {
    model?: string;
    os?: string;
    screenSize?: string;
    touchCapable?: boolean;
  };
  operatingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  organizationId?: string;
}
