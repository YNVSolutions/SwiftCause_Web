import { Kiosk } from './types';

export const selectKioskById = (kiosks: Kiosk[], id: string) =>
  kiosks.find(kiosk => kiosk.id === id);

export const selectOnlineKiosks = (kiosks: Kiosk[]) =>
  kiosks.filter(kiosk => kiosk.status === 'online');

export const selectOfflineKiosks = (kiosks: Kiosk[]) =>
  kiosks.filter(kiosk => kiosk.status === 'offline');

export const selectMaintenanceKiosks = (kiosks: Kiosk[]) =>
  kiosks.filter(kiosk => kiosk.status === 'maintenance');

export const selectKiosksByOrganization = (kiosks: Kiosk[], organizationId: string) =>
  kiosks.filter(kiosk => kiosk.organizationId === organizationId);

export const selectKiosksByCampaign = (kiosks: Kiosk[], campaignId: string) =>
  kiosks.filter(kiosk => kiosk.assignedCampaigns?.includes(campaignId));

export const selectKioskByAccessCode = (kiosks: Kiosk[], accessCode: string) =>
  kiosks.find(kiosk => kiosk.accessCode === accessCode);

export const selectKioskTotalRaised = (kiosk: Kiosk) =>
  kiosk.totalRaised || 0;

export const selectKioskTotalDonations = (kiosk: Kiosk) =>
  kiosk.totalDonations || 0;
