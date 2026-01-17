import { db } from '../../lib/firebase';
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
  where
} from 'firebase/firestore';
import type { DocumentData, Query } from 'firebase/firestore';
import type { Campaign, Kiosk, Organization } from '../../types';
export async function getCampaigns(organizationId?: string): Promise<Campaign[]> {
  let campaignsCollection: Query<DocumentData> = collection(db, 'campaigns');
  if (organizationId) {
    campaignsCollection = query(campaignsCollection, where("organizationId", "==", organizationId));
  }
  const snapshot = await getDocs(campaignsCollection);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Campaign));
}

export async function getKiosks(organizationId?: string): Promise<Kiosk[]> {
  let kiosksCollection: Query<DocumentData> = collection(db, 'kiosks');
  if (organizationId) {
    kiosksCollection = query(kiosksCollection, where("organizationId", "==", organizationId));
  }
  const snapshot = await getDocs(kiosksCollection);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Kiosk));
}

export async function getAllKiosks(): Promise<Kiosk[]> {
  const snapshot = await getDocs(collection(db, 'kiosks'));
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Kiosk));
}

export async function updateCampaign(campaignId: string, data: Partial<Campaign>) {
  const ref = doc(db, 'campaigns', campaignId);
  await updateDoc(ref, data);
}

export async function updateCampaignWithImage(campaignId: string, data: Partial<Campaign>) {
  const ref = doc(db, 'campaigns', campaignId);
  await updateDoc(ref, data);
  return data;
}

export async function getUserById(userId: string): Promise<Record<string, unknown> | null> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Record<string, unknown>) };
}

export async function getTopCampaigns(limitCount: number): Promise<Campaign[]> {
  const campaignsRef = collection(db, 'campaigns');
  const q = query(campaignsRef, orderBy('raised', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Campaign));
}

export async function getOrganizations(): Promise<Organization[]> {
  const snapshot = await getDocs(collection(db, 'organizations'));
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Organization));
}
export async function getOrganizationById(organizationId: string): Promise<Organization | null> {
  const docRef = doc(db, 'organizations', organizationId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { ...(docSnap.data() as Organization), id: docSnap.id };
  } else {
    return null;
  }
}
export async function getAllCampaigns(organizationId?: string): Promise<Campaign[]> {
  let campaignsRef: Query<DocumentData> = collection(db, 'campaigns');
  if (organizationId) {
    campaignsRef = query(campaignsRef, where("organizationId", "==", organizationId));
  }
  const snapshot = await getDocs(campaignsRef);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Campaign));
}

export async function updateKiosk(kioskId: string, data: Partial<Kiosk>) {
  const ref = doc(db, 'kiosks', kioskId);
  await updateDoc(ref, data);
}

export async function createCampaign(data: Omit<Campaign, 'id'>): Promise<Campaign> {
  const campaignsRef = collection(db, 'campaigns');
  const docRef = await addDoc(campaignsRef, { ...data, raised: data.raised || 0 });
  return { id: docRef.id, ...data, raised: data.raised || 0 } as Campaign;
}

export async function createCampaignWithImage(data: Omit<Campaign, 'id'>): Promise<Campaign> {
  const campaignData: Omit<Campaign, 'id'> = {
    ...data,
    raised: 0,
    donationCount: 0,
    createdAt: new Date().toISOString(),
    status: data.status || 'active'
  };
  
  const campaignsRef = collection(db, 'campaigns');
  const docRef = await addDoc(campaignsRef, campaignData);
  return { id: docRef.id, ...campaignData } as Campaign;
}

export async function deleteCampaign(campaignId: string) {
  const ref = doc(db, 'campaigns', campaignId);
  await deleteDoc(ref);
}

export async function getRecentDonations(limitCount: number, organizationId?: string): Promise<Array<Record<string, unknown>>> {
  const donationsRef: Query<DocumentData> = collection(db, 'donations');
  let q = query(donationsRef, orderBy('timestamp', 'desc'), limit(limitCount));
  if (organizationId) {
    q = query(donationsRef, where("organizationId", "==", organizationId), orderBy('timestamp', 'desc'), limit(limitCount));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
}

export async function createThankYouMail(recipientEmail: string) {
  const mailRef = collection(db, 'mail');
  const donationThankYouEmail = {
    to: [recipientEmail],
    message: {
      subject: 'Thank you for your donation!',
      text: `Dear Donor,\n\nThank you so much for your generous contribution to our campaign. Your support means a lot to us and helps us move closer to our goal.\n\nWe truly appreciate your kindness and belief in our mission.\n\nWith gratitude,\nSwift Cause`,
      html: `<!DOCTYPE html>\n<html>\n  <body style="font-family: Arial, sans-serif; color: #333;">\n    <h2>Thank You for Your Donation!</h2>\n    <p>Dear Donor,</p>\n    <p>Thank you so much for your generous contribution to our campaign. Your support means a lot to us and helps us move closer to our goal.</p>\n    <p>We truly appreciate your kindness and belief in our mission.</p>\n    <p>With gratitude,</p>\n    <p><strong>Swift Cause</strong></p>\n  </body>\n</html>`
    }
  };

  await addDoc(mailRef, donationThankYouEmail);
}
