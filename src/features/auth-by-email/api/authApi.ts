import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  applyActionCode,
  fetchSignInMethodsForEmail,
  User as FirebaseAuthUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../shared/lib/firebase';
import { User } from '../../../entities/user';
import { SignupCredentials } from '../model';

export const authApi = {
  // Check if email exists in Firebase Authentication
  async checkEmailExistsInAuth(email: string): Promise<boolean> {
    try {
      // Check Firebase Authentication instead of Firestore
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      // If signInMethods array has items, the email is registered in Auth
      return signInMethods.length > 0;
    } catch (error: unknown) {
      console.error('Error checking email in Firebase Auth:', error);
      // On error, return false to allow signup attempt (fail-open)
      return false;
    }
  },

  async signInForVerificationCheck(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: unknown) {
      const expectedErrors = [
        'auth/invalid-email',
        'auth/invalid-credential',
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/user-disabled',
        'auth/too-many-requests'
      ];
      
      const hasCode = (err: unknown): err is { code: string } => {
        return typeof err === 'object' && err !== null && 'code' in err;
      };
      
      if (!hasCode(error) || !expectedErrors.includes(error.code)) {
        console.error('Unexpected error signing in:', error);
      }
      
      throw error;
    }
  },

  // Check if email exists and is verified in Firestore
  async checkEmailVerification(email: string): Promise<{ exists: boolean; verified: boolean }> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { exists: false, verified: false };
      }
      
      const userData = querySnapshot.docs[0].data();
      return { 
        exists: true, 
        verified: userData.emailVerified === true 
      };
    } catch (error: unknown) {
      console.error('Error checking email verification:', error);
      return { exists: false, verified: false };
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      
      // Update lastLogin timestamp
      await updateDoc(userDocRef, {
        lastLogin: new Date().toISOString()
      });
      
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        return {
          id: userDocSnap.id,
          ...userDocSnap.data()
        } as User;
      }
      return null;
    } catch (error: unknown) {
      // Don't log expected authentication errors to console
      const expectedErrors = [
        'auth/invalid-email',
        'auth/invalid-credential',
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/user-disabled',
        'auth/too-many-requests'
      ];
      
      // Type guard to check if error has a code property
      const hasCode = (err: unknown): err is { code: string } => {
        return typeof err === 'object' && err !== null && 'code' in err;
      };
      
      if (!hasCode(error) || !expectedErrors.includes(error.code)) {
        console.error('Unexpected error signing in:', error);
      }
      
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
          'system_admin',
        ],
        isActive: true,
        emailVerified: false,
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

      // Send verification email
      await sendEmailVerification(userCredential.user);

      return {
        id: userId,
        ...userData
      } as User;
    } catch (error: unknown) {
      // Don't log expected authentication errors to console
      const expectedErrors = [
        'auth/email-already-in-use',
        'auth/invalid-email',
        'auth/weak-password',
        'auth/operation-not-allowed'
      ];
      
      // Type guard to check if error has a code property
      const hasCode = (err: unknown): err is { code: string } => {
        return typeof err === 'object' && err !== null && 'code' in err;
      };
      
      if (!hasCode(error) || !expectedErrors.includes(error.code)) {
        console.error('Unexpected error signing up:', error);
      }
      
      throw error;
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
  },

  // Send verification email to current user
  async sendVerificationEmail(user: FirebaseAuthUser): Promise<void> {
    try {
      await sendEmailVerification(user);
    } catch (error: unknown) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  },

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found. Please sign up again.');
      }
      if (user.email !== email) {
        throw new Error('Email does not match current user');
      }
      await sendEmailVerification(user);
    } catch (error: unknown) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  },

  // Verify email with action code
  async verifyEmailCode(code: string): Promise<void> {
    try {
      await applyActionCode(auth, code);
      
      // Update Firestore user document
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          emailVerified: true
        });
      }
    } catch (error: unknown) {
      console.error('Error verifying email code:', error);
      throw error;
    }
  }
};
