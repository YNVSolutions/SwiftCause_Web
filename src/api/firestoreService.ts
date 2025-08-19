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
  limit
} from 'firebase/firestore';
import { uploadCampaignCoverImage } from '../lib/imageUpload';

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
  let imageUrl = data.coverImageUrl;
  
  if (imageFile) {
    try {
      imageUrl = await uploadCampaignCoverImage(imageFile, campaignId);
    } catch (error) {
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  const updateData = {
    ...data,
    coverImageUrl: imageUrl
  };
  
  const ref = doc(db, 'campaigns', campaignId);
  await updateDoc(ref, updateData);
  
  return updateData;
}

export async function getUserById(userId: string) {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getTopCampaigns(limitCount: number) {
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

export async function updateKiosk(kioskId: string, data: any) {
  const ref = doc(db, 'kiosks', kioskId);
  await updateDoc(ref, data);
}

export async function createCampaign(data: any) {
  const campaignsRef = collection(db, 'campaigns');
  const docRef = await addDoc(campaignsRef, data);
  return { id: docRef.id, ...data };
}

export async function createCampaignWithImage(data: any, imageFile: File | null = null) {
  let imageUrl = data.coverImageUrl || '';
  
  if (imageFile) {
    try {
      const tempId = Date.now().toString();
      imageUrl = await uploadCampaignCoverImage(imageFile, tempId);
    } catch (error) {
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  const campaignData = {
    ...data,
    coverImageUrl: imageUrl,
    collectedAmount: 0,
    donationCount: 0,
    createdAt: new Date(),
    status: data.status || 'active'
  };
  
  const campaignsRef = collection(db, 'campaigns');
  const docRef = await addDoc(campaignsRef, campaignData);
  return { id: docRef.id, ...campaignData };
}
