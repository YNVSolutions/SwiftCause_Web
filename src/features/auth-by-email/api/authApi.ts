import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseAuthUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../shared/lib/firebase';
import { User } from '../../../entities/user';
import { SignupCredentials } from '../model';

export const authApi = {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        return {
          id: userDocSnap.id,
          ...userDocSnap.data()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign up with email and password
  async signUp(credentials: SignupCredentials): Promise<User | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const userId = userCredential.user.uid;

      // Create user document
      const userData = {
        username: `${credentials.firstName} ${credentials.lastName}`,
        email: credentials.email,
        role: 'admin',
        permissions: [
          'view_dashboard',
          'view_campaigns',
          'create_campaign',
          'edit_campaign',
          'delete_campaign',
          'view_kiosks',
          'create_kiosk',
          'edit_kiosk',
          'delete_kiosk',
          'assign_campaigns',
          'view_donations',
          'export_donations',
          'view_users',
          'create_user',
          'edit_user',
          'delete_user',
          'manage_permissions',
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        organizationId: credentials.organizationId,
      };

      await setDoc(doc(db, 'users', userId), userData);

      // Create organization document
      await setDoc(doc(db, 'organizations', credentials.organizationId), {
        name: credentials.organizationName,
        type: credentials.organizationType,
        size: credentials.organizationSize,
        website: credentials.website,
        currency: credentials.currency,
        createdAt: new Date().toISOString(),
      });

      return {
        id: userId,
        ...userData
      } as User;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        return {
          id: userDocSnap.id,
          ...userDocSnap.data()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = {
            id: userDocSnap.id,
            ...userDocSnap.data()
          } as User;
          callback(userData);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
};
