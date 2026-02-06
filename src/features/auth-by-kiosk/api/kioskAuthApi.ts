import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../../shared/lib/firebase';
import { KioskSession } from '../../../shared/types';
import { organizationApi } from '../../../entities/organization';

export const kioskAuthApi = {
  // Authenticate kiosk with ID and access code using Firebase Custom Token
  async authenticateKiosk(kioskId: string, accessCode: string): Promise<KioskSession | null> {
    try {
      const functionUrl = `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/kioskLogin`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kioskId, accessCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Kiosk login failed:', errorData.error);
        return null;
      }

      const data = await response.json() as {
        success: boolean;
        token: string;
        kioskData: {
          id: string;
          name: string;
          organizationId?: string;
          assignedCampaigns: string[];
          settings: {
            displayMode: 'grid' | 'list' | 'carousel';
            showAllCampaigns: boolean;
            maxCampaignsDisplay: number;
            autoRotateCampaigns: boolean;
          };
        };
      };

      if (!data.success || !data.token) {
        return null;
      }

      // Sign in with custom token
      await signInWithCustomToken(auth, data.token);

      let organizationCurrency: string | undefined;
      if (data.kioskData.organizationId) {
        const organization = await organizationApi.getOrganizationById(data.kioskData.organizationId);
        if (organization) {
          organizationCurrency = organization.currency;
        }
      }

      const now = new Date().toISOString();
      const kioskSession: KioskSession = {
        kioskId: data.kioskData.id,
        kioskName: data.kioskData.name,
        startTime: now,
        assignedCampaigns: data.kioskData.assignedCampaigns,
        settings: data.kioskData.settings,
        loginMethod: 'manual',
        organizationId: data.kioskData.organizationId,
        organizationCurrency: organizationCurrency || 'GBP',
      };

      return kioskSession;
    } catch (error) {
      console.error('Error authenticating kiosk:', error);
      return null;
    }
  }
};
