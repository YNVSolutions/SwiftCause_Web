import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';

export async function getCampaigns(): Promise<DocumentData[]> {
  const snapshot = await getDocs(collection(db, 'campaigns'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getKiosks(): Promise<DocumentData[]> {
  const snapshot = await getDocs(collection(db, 'kiosks'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateCampaign(campaignId: string, data: Partial<DocumentData>): Promise<void> {
  const ref = doc(db, 'campaigns', campaignId);
  await updateDoc(ref, data);
}

export async function getUserById(userId: string): Promise<DocumentData | null> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getTopCampaigns(limitCount: number): Promise<DocumentData[]> {
  const campaignsRef = collection(db, 'campaigns');
  const q = query(campaignsRef, orderBy('collectedAmount', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllCampaigns(): Promise<DocumentData[]> {
  const campaignsRef = collection(db, 'campaigns');
  const snapshot = await getDocs(campaignsRef);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


