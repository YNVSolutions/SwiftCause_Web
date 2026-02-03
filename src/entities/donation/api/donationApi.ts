import { collection, query, where, getDocs, doc, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { Donation } from '../model';

export const donationApi = {
  // Get all donations
  async getDonations(organizationId?: string): Promise<Donation[]> {
    try {
      let q = query(collection(db, 'donations'), orderBy('timestamp', 'desc'));
      
      if (organizationId) {
        q = query(
          collection(db, 'donations'),
          where('organizationId', '==', organizationId),
          orderBy('timestamp', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Donation));
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  },

  // Get donations by campaign
  async getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    try {
      const q = query(
        collection(db, 'donations'),
        where('campaignId', '==', campaignId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Donation));
    } catch (error) {
      console.error('Error fetching donations by campaign:', error);
      throw error;
    }
  },

  // Get donations by kiosk
  async getDonationsByKiosk(kioskId: string): Promise<Donation[]> {
    try {
      const q = query(
        collection(db, 'donations'),
        where('kioskId', '==', kioskId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Donation));
    } catch (error) {
      console.error('Error fetching donations by kiosk:', error);
      throw error;
    }
  },

  /**
   * ⚠️ LEGACY / NON-STRIPE ONLY
   * DO NOT use for Stripe-backed payments.
   * Stripe donations are created exclusively via webhooks
   * using paymentIntent.id as the Firestore document ID.
   */
  // Create new donation
  async createDonation(donation: Omit<Donation, 'id'>): Promise<string> {
    throw new Error('Legacy donation creation disabled. Stripe webhooks must create donations.');
  },

  // Update donation
  async updateDonation(id: string, updates: Partial<Donation>): Promise<void> {
    try {
      const docRef = doc(db, 'donations', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating donation:', error);
      throw error;
    }
  },

  // Delete donation
  async deleteDonation(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'donations', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting donation:', error);
      throw error;
    }
  }
};
