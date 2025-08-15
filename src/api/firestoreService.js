import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

export async function getCampaigns() {
  const snapshot = await getDocs(collection(db, 'campaigns'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getKiosks() {
  const snapshot = await getDocs(collection(db, 'kiosks'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateCampaign(campaignId, data) {
  const ref = doc(db, 'campaigns', campaignId);
  await updateDoc(ref, data);
}

export async function getUserById(userId) {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getTopCampaigns(limitCount) {
  const campaignsRef = collection(db, 'campaigns');
  const q = query(campaignsRef, orderBy('collectedAmount', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllCampaigns() {
  const campaignsRef = collection(db, 'campaigns');
  const snapshot = await getDocs(campaignsRef);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateKiosk(kioskId, data) {
  const ref = doc(db, 'kiosks', kioskId);
  await updateDoc(ref, data);
}


