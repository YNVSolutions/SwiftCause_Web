import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, deleteObject } from 'firebase/storage'; // Import ref and deleteObject
import { getFunctions } from 'firebase/functions'; // Import getFunctions


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app); // Initialize functions

// Function to delete a file from Firebase Storage
const deleteFile = async (fileUrl: string) => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    console.log(`File deleted successfully: ${fileUrl}`);
  } catch (error) {
    console.error(`Error deleting file ${fileUrl}:`, error);
    throw error; // Re-throw the error for handling in the calling component
  }
};

export { db, auth, storage, functions, doc, getDoc, updateDoc, deleteFile };
