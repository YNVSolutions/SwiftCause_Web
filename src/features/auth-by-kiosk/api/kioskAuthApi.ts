import { kioskApi } from '../../../entities/kiosk';
import { organizationApi } from '../../../entities/organization';
import { KioskSession } from '../../../shared/types';

export const kioskAuthApi = {
  // Authenticate kiosk with ID and access code
  async authenticateKiosk(kioskId: string, accessCode: string): Promise<KioskSession | null> {
    try {
      const kiosks = await kioskApi.getKiosks();
      const kiosk = kiosks.find(k => k.id === kioskId && k.accessCode === accessCode);
      
      if (!kiosk) {
        return null;
      }

      let organizationCurrency: string | undefined;
      if (kiosk.organizationId) {
        const organization = await organizationApi.getOrganizationById(kiosk.organizationId);
        if (organization) {
          organizationCurrency = organization.currency;
        }
      }

      const now = new Date().toISOString();
      const kioskSession: KioskSession = {
        kioskId: kiosk.id,
        kioskName: kiosk.name,
        startTime: now,
        assignedCampaigns: kiosk.assignedCampaigns || [],
        settings: kiosk.settings || {
          displayMode: 'grid',
          showAllCampaigns: false,
          maxCampaignsDisplay: 6,
          autoRotateCampaigns: false
        },
        loginMethod: 'manual',
        organizationId: kiosk.organizationId,
        organizationCurrency: organizationCurrency || 'GBP',
      };

      return kioskSession;
    } catch (error) {
      console.error('Error authenticating kiosk:', error);
      throw error;
    }
  }
};
