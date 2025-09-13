import { collection, getDocs, doc, DocumentData, query, where } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { db } from '../lib/firebase';
import { User, UserRole, Permission } from '../App';

// Helper function to make authenticated fetch calls to Firebase Functions
async function callAuthenticatedFunction(functionName: string, method: string, data?: any) {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }

  const url = `https://us-central1-swiftcause-app.cloudfunctions.net/${functionName}`;
  
  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.error || 'Something went wrong on the server.');
  }

  return responseData;
}

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

export async function updateUser(userId: string, data: Partial<User>): Promise<any> {
  try {
    const result = await callAuthenticatedFunction('updateUser', 'POST', { userId, data });
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
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
    const result = await callAuthenticatedFunction('createUser', 'POST', userData);
    return result;
  } catch (error) {
    console.error('Error calling createUser function:', error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<any> {
  try {
    const result = await callAuthenticatedFunction('deleteUser', 'POST', { userId });
    return result;
  } catch (error) {
    console.error('Error calling deleteUser function:', error);
    throw error;
  }
}
