import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';


export async function fetchAllDonations(): Promise<DocumentData[]> {
  try {
    const donationsCollection = collection(db, 'donations');
    const querySnapshot = await getDocs(donationsCollection);

    if (querySnapshot.empty) {
      console.log('No donations found.');
      return [];
    }

    const donations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return donations;
  } catch (error) {
    console.error('Error fetching donations:', error);
    throw new Error('Failed to fetch donation data.');
  }
}