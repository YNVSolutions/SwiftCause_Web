import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { Organization } from '../model';

export const organizationApi = {
  // Get all organizations
  async getOrganizations(): Promise<Organization[]> {
    try {
      const q = query(collection(db, 'organizations'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Organization));
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  // Get organization by ID
  async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const docRef = doc(db, 'organizations', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Organization;
      }
      return null;
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  },

  // Create new organization
  async createOrganization(organization: Omit<Organization, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'organizations'), {
        ...organization,
        tags: organization.tags || [],
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  },

  // Update organization
  async updateOrganization(id: string, updates: Partial<Organization>): Promise<void> {
    try {
      const docRef = doc(db, 'organizations', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  },

  // Delete organization
  async deleteOrganization(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'organizations', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  },

  // Get organization tags
  async getOrganizationTags(organizationId: string): Promise<string[]> {
    try {
      const docRef = doc(db, 'organizations', organizationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.tags || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching organization tags:', error);
      throw error;
    }
  },

  // Update organization tags
  async updateOrganizationTags(organizationId: string, tags: string[]): Promise<void> {
    try {
      const docRef = doc(db, 'organizations', organizationId);
      await updateDoc(docRef, { tags });
    } catch (error) {
      console.error('Error updating organization tags:', error);
      throw error;
    }
  }
};
