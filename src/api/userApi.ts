import { collection, getDocs, doc, updateDoc, DocumentData, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import { User, UserRole, Permission } from '../App';

export async function fetchAllUsers(organizationId?: string): Promise<DocumentData[]> {
  try {
    let usersCollectionRef: any = collection(db, 'users');
    if (organizationId) {
      usersCollectionRef = query(usersCollectionRef, where("organizationId", "==", organizationId));
    }
    const querySnapshot = await getDocs(usersCollectionRef);
    return querySnapshot.docs.map(doc => {
      const firestoreData = doc.data();
      const userObject = { id: doc.id };
      return Object.assign(userObject, firestoreData);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch user data from the server.');
  }
}

export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data as DocumentData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user details.');
  }
}

export async function createUser(userData: {
  email: string;
  password?: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  organizationId: string;
}): Promise<any> {
  try {
    const createUserFunction = httpsCallable(functions, 'createUser');
    const result = await createUserFunction(userData);
    return result.data;
  } catch (error) {
    console.error('Error calling createUser function:', error);
    const message = (error as any).message || 'An unknown server error occurred while creating the user.';
    throw new Error(message);
  }
}

export async function deleteUser(userId: string): Promise<any> {
  try {
    const deleteUserFunction = httpsCallable(functions, 'deleteUser');
    const result = await deleteUserFunction({ userId });
    return result.data;
  } catch (error) {
    console.error('Error calling deleteUser function:', error);
    const message = (error as any).message || 'An unknown server error occurred while deleting the user.';
    throw new Error(message);
  }
}

