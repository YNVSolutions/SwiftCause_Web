import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { Kiosk } from '../model';

export const kioskApi = {
  // Get all kiosks
  async getKiosks(organizationId?: string): Promise<Kiosk[]> {
    try {
      let q = query(collection(db, 'kiosks'), orderBy('name', 'asc'));
      
      if (organizationId) {
        q = query(
          collection(db, 'kiosks'),
          where('organizationId', '==', organizationId),
          orderBy('name', 'asc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Kiosk));
    } catch (error) {
      console.error('Error fetching kiosks:', error);
      throw error;
    }
  },

  // Get kiosk by ID
  async getKioskById(id: string): Promise<Kiosk | null> {
    try {
      const docRef = doc(db, 'kiosks', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Kiosk;
      }
      return null;
    } catch (error) {
      console.error('Error fetching kiosk:', error);
      throw error;
    }
  },

  // Create new kiosk
  async createKiosk(kiosk: Omit<Kiosk, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'kiosks'), {
        ...kiosk,
        status: 'offline',
        totalDonations: 0,
        totalRaised: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating kiosk:', error);
      throw error;
    }
  },

  // Update kiosk
  async updateKiosk(id: string, updates: Partial<Kiosk>): Promise<void> {
    try {
      const docRef = doc(db, 'kiosks', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating kiosk:', error);
      throw error;
    }
  },

  // Delete kiosk
  async deleteKiosk(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'kiosks', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting kiosk:', error);
      throw error;
    }
  },

  // Update kiosk status
  async updateKioskStatus(id: string, status: Kiosk['status']): Promise<void> {
    try {
      const docRef = doc(db, 'kiosks', id);
      await updateDoc(docRef, { 
        status,
        lastActive: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating kiosk status:', error);
      throw error;
    }
  }
};
