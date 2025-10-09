import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { User } from '../model';

export const userApi = {
  // Get all users
  async getUsers(organizationId?: string): Promise<User[]> {
    try {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      
      if (organizationId) {
        q = query(
          collection(db, 'users'),
          where('organizationId', '==', organizationId),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create new user
  async createUser(user: Omit<User, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...user,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
