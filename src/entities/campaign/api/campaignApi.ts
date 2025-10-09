import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { Campaign } from '../model';

export const campaignApi = {
  // Get all campaigns
  async getCampaigns(organizationId?: string): Promise<Campaign[]> {
    try {
      let q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
      
      if (organizationId) {
        q = query(
          collection(db, 'campaigns'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Campaign));
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  // Get campaign by ID
  async getCampaignById(id: string): Promise<Campaign | null> {
    try {
      const docRef = doc(db, 'campaigns', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Campaign;
      }
      return null;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },

  // Create new campaign
  async createCampaign(campaign: Omit<Campaign, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'campaigns'), {
        ...campaign,
        createdAt: new Date().toISOString(),
        status: 'active'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Update campaign
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
    try {
      const docRef = doc(db, 'campaigns', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  // Delete campaign
  async deleteCampaign(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'campaigns', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  // Get campaigns for kiosk
  async getCampaignsForKiosk(kioskId: string, organizationId?: string): Promise<Campaign[]> {
    try {
      const campaigns = await this.getCampaigns(organizationId);
      return campaigns.filter(campaign => 
        campaign.isGlobal || campaign.assignedKiosks?.includes(kioskId)
      );
    } catch (error) {
      console.error('Error fetching campaigns for kiosk:', error);
      throw error;
    }
  }
};
