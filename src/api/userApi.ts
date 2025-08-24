import { collection, getDocs, doc, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function fetchAllUsers(): Promise<DocumentData[]> {
  try {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);

    if (querySnapshot.empty) {
      console.log('No users found.');
      return [];
    }

    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch user data.');
  }
}


export async function updateUser(userId: string, data: DocumentData): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    console.log(`User with ID ${userId} successfully updated.`);
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user.');
  }
}