// seedKiosks.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc , doc} from 'firebase/firestore';
import { faker } from '@faker-js/faker';

// --- 1. Your Web SDK Firebase config ---

// --- 2. Init ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateKioskIds() {
  const kiosksSnap = await getDocs(collection(db, 'kiosks'));

  if (kiosksSnap.empty) {
    console.log('No kiosks found.');
    return;
  }

  for (const kioskDoc of kiosksSnap.docs) {
    await updateDoc(doc(db, 'kiosks', kioskDoc.id), { id: kioskDoc.id });
    console.log(`Updated kiosk ${kioskDoc.id}`);
  }

  console.log('✅ All kiosk IDs updated to match doc IDs.');
}

updateKioskIds();
