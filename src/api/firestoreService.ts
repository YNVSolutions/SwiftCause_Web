import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';

export async function getCampaigns() {
  const snapshot = await getDocs(collection(db, 'campaigns'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getKiosks() {
  const snapshot = await getDocs(collection(db, 'kiosks'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateCampaign(campaignId: string, data: any) {
  const ref = doc(db, 'campaigns', campaignId);
  await updateDoc(ref, data);
}

export async function updateCampaignWithImage(campaignId: string, data: any, imageFile: File | null = null) {
  const ref = doc(db, 'campaigns', campaignId);
  await updateDoc(ref, data);
  return data;
}

export async function getUserById(userId: string) {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getTopCampaigns(limitCount: number) {
  const campaignsRef = collection(db, 'campaigns');
  const q = query(campaignsRef, orderBy('raised', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllCampaigns() {
  const campaignsRef = collection(db, 'campaigns');
  const snapshot = await getDocs(campaignsRef);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateKiosk(kioskId: string, data: any) {
  const ref = doc(db, 'kiosks', kioskId);
  await updateDoc(ref, data);
}

export async function createCampaign(data: any) {
  const campaignsRef = collection(db, 'campaigns');
  const docRef = await addDoc(campaignsRef, { ...data, raised: data.raised || 0 });
  return { id: docRef.id, ...data, raised: data.raised || 0 };
}

export async function createCampaignWithImage(data: any, imageFile: File | null = null) {
  const campaignData = {
    ...data,
    raised: 0,
    donationCount: 0,
    createdAt: new Date(),
    status: data.status || 'active'
  };
  
  const campaignsRef = collection(db, 'campaigns');
  const docRef = await addDoc(campaignsRef, campaignData);
  return { id: docRef.id, ...campaignData };
}

export async function deleteCampaign(campaignId: string) {
  const ref = doc(db, 'campaigns', campaignId);
  await deleteDoc(ref);
}

export async function getRecentDonations(limitCount: number) {
  const donationsRef = collection(db, 'donations');
  const q = query(donationsRef, orderBy('timestamp', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
