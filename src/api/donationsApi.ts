import { collection, getDocs, DocumentData, query, where } from 'firebase/firestore';
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

export async function getDonationsByKiosk(kioskId: string) {
  const donationsRef = collection(db, 'donations');
  const q = query(donationsRef, where('kioskId', '==', kioskId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}