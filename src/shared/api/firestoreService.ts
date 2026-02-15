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
  Timestamp,
  where
} from 'firebase/firestore';
import { Organization, Campaign, GiftAidDetails } from '../types';
import { applyCampaignStatusEvent } from '../lib/campaignStatusEngine';

async function syncCampaignStatus(campaign: Campaign): Promise<Campaign> {
  const resolution = applyCampaignStatusEvent(campaign, { type: 'SYSTEM_RECONCILE' });
  const resolvedStatus = resolution.status;
  const needsStatusUpdate = campaign.status !== resolvedStatus;
  const needsMetadataUpdate = Boolean(resolution.updates);

  if (needsStatusUpdate || needsMetadataUpdate) {
    const ref = doc(db, 'campaigns', campaign.id);
    await updateDoc(ref, { status: resolvedStatus, ...(resolution.updates || {}) });
  }

  return { ...campaign, status: resolvedStatus, ...(resolution.updates || {}) };
}
export async function getCampaigns(organizationId?: string): Promise<Campaign[]> {
  const campaignsCollection = organizationId
    ? query(collection(db, 'campaigns'), where("organizationId", "==", organizationId))
    : collection(db, 'campaigns');
  const snapshot = await getDocs(campaignsCollection);
  const campaigns = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Campaign));
  return Promise.all(campaigns.map(syncCampaignStatus));
}

export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  const docRef = doc(db, 'campaigns', campaignId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const campaign = { id: docSnap.id, ...(docSnap.data() as object) } as Campaign;
    return syncCampaignStatus(campaign);
  }
  return null;
}

export async function getKiosks(organizationId?: string) {
  const kiosksCollection = organizationId
    ? query(collection(db, 'kiosks'), where("organizationId", "==", organizationId))
    : collection(db, 'kiosks');
  const snapshot = await getDocs(kiosksCollection);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) }));
}

export async function getAllKiosks() {
  const snapshot = await getDocs(collection(db, 'kiosks'));
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) }));
}

export async function updateCampaign(campaignId: string, data: Partial<Campaign>) {
  const ref = doc(db, 'campaigns', campaignId);
  await updateDoc(ref, data);
}

export async function updateCampaignWithImage(campaignId: string, data: Partial<Campaign>, imageFile: File | null = null): Promise<Partial<Campaign>> {
  void imageFile;
  const ref = doc(db, 'campaigns', campaignId);
  await updateDoc(ref, data);
  return data;
}

export async function getUserById(userId: string) {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as object) };
}

export async function getTopCampaigns(limitCount: number) {
  const campaignsRef = collection(db, 'campaigns');
  const q = query(campaignsRef, orderBy('raised', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() as object }));
}

export async function getOrganizations() {
  const snapshot = await getDocs(collection(db, 'organizations'));
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) }));
}
export async function getOrganizationById(organizationId: string): Promise<Organization | null> {
  const docRef = doc(db, 'organizations', organizationId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { ...(docSnap.data() as Organization), id: docSnap.id };
  } else {
    console.warn("No such organization document!");
    return null;
  }
}
export async function getAllCampaigns(organizationId?: string): Promise<Campaign[]> {
  const campaignsRef = organizationId
    ? query(collection(db, 'campaigns'), where("organizationId", "==", organizationId))
    : collection(db, 'campaigns');
  const snapshot = await getDocs(campaignsRef);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Campaign));
}

export async function updateKiosk(kioskId: string, data: Record<string, unknown>) {
  const ref = doc(db, 'kiosks', kioskId);
  await updateDoc(ref, data);
}

export async function createCampaign(data: Omit<Campaign, 'id'>): Promise<Campaign> {
  const campaignsRef = collection(db, 'campaigns');
  const docRef = await addDoc(campaignsRef, { ...data, raised: data.raised || 0 });
  return { id: docRef.id, ...data, raised: data.raised || 0 } as Campaign;
}

export async function createCampaignWithImage(data: Omit<Campaign, 'id'>, imageFile: File | null = null): Promise<Campaign> {
  void imageFile;
  const campaignData = {
    ...data,
    raised: 0,
    donationCount: 0,
    createdAt: new Date(),
    status: data.status || 'active'
  };
  
  const campaignsRef = collection(db, 'campaigns');
  const docRef = await addDoc(campaignsRef, campaignData);
  return { id: docRef.id, ...campaignData } as unknown as Campaign;
}

export async function deleteCampaign(campaignId: string) {
  const ref = doc(db, 'campaigns', campaignId);
  await deleteDoc(ref);
}

export async function getRecentDonations(limitCount: number, organizationId?: string) {
  const donationsRef = collection(db, 'donations');
  let q = query(donationsRef, orderBy('timestamp', 'desc'), limit(limitCount));
  if (organizationId) {
    q = query(donationsRef, where("organizationId", "==", organizationId), orderBy('timestamp', 'desc'), limit(limitCount));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() as object}));
}

export async function createThankYouMail(recipientEmail: string, campaignName?: string) {
  const mailRef = collection(db, 'mail');
  const normalizedCampaignName = campaignName?.replace(/[\r\n]+/g, ' ').trim();
  const escapedCampaignName = normalizedCampaignName
    ? normalizedCampaignName
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    : '';
  const campaignTextLine = normalizedCampaignName ? `Campaign: ${normalizedCampaignName}\n\n` : '';
  const campaignHtmlLine = normalizedCampaignName
    ? `<p><strong>Campaign:</strong> ${escapedCampaignName}</p>`
    : '';
  const donationThankYouEmail = {
    to: [recipientEmail],
    message: {
      subject: normalizedCampaignName
        ? `Thank you for supporting ${normalizedCampaignName}!`
        : "Thank you for your donation!",
      text: `Dear Donor,\n\nThank you so much for your generous contribution to our campaign. Your support means a lot to us and helps us move closer to our goal.\n\n${campaignTextLine}We truly appreciate your kindness and belief in our mission.\n\nWith gratitude,\nSwift Cause`,
      html: `<!DOCTYPE html>\n<html>\n  <body style="font-family: Arial, sans-serif; color: #333;">\n    <h2>Thank You for Your Donation!</h2>\n    <p>Dear Donor,</p>\n    <p>Thank you so much for your generous contribution to our campaign. Your support means a lot to us and helps us move closer to our goal.</p>\n    ${campaignHtmlLine}\n    <p>We truly appreciate your kindness and belief in our mission.</p>\n    <p>With gratitude,</p>\n    <p><strong>Swift Cause</strong></p>\n  </body>\n</html>`,
    },
  };

  await addDoc(mailRef, donationThankYouEmail);
}

export interface FeedbackData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  timestamp?: Date;
}

export async function submitFeedback(feedback: FeedbackData) {
  const feedbackRef = collection(db, 'feedback');
  const feedbackData = {
    firstName: feedback.firstName,
    lastName: feedback.lastName,
    email: feedback.email,
    message: feedback.message,
    timestamp: Timestamp.now()
  };
  
  const docRef = await addDoc(feedbackRef, feedbackData);
  return { id: docRef.id, ...feedbackData };
}

export async function queueContactConfirmationEmail(feedback: FeedbackData) {
  const mailRef = collection(db, 'mail');
  const mailData = {
    to: feedback.email,
    message: {
      subject: 'We received your message',
      text: `Hi ${feedback.firstName || 'there'},\n\nThanks for contacting SwiftCause. We received your message and will get back to you shortly.\n\nMessage:\n${feedback.message}\n\n— SwiftCause Team`,
      html: `<p>Hi ${feedback.firstName || 'there'},</p><p>Thanks for contacting SwiftCause. We received your message and will get back to you shortly.</p><p><strong>Message:</strong><br/>${String(feedback.message).replace(/\n/g, '<br/>')}</p><p>— SwiftCause Team</p>`
    },
    createdAt: Timestamp.now()
  };

  const docRef = await addDoc(mailRef, mailData);
  return { id: docRef.id, ...mailData };
}

export async function storeGiftAidDeclaration(giftAidData: GiftAidDetails, transactionId: string) {
  const giftAidRef = collection(db, 'giftAidDeclarations');
  const giftAidDeclaration = {
    // Donor Information
    firstName: giftAidData.firstName,
    surname: giftAidData.surname,
    houseNumber: giftAidData.houseNumber || '',
    address: giftAidData.address || '',
    town: giftAidData.town || '',
    postcode: giftAidData.postcode,
    
    // Declaration Requirements
    giftAidConsent: giftAidData.giftAidConsent,
    ukTaxpayerConfirmation: giftAidData.ukTaxpayerConfirmation,
    declarationText: giftAidData.declarationText,
    declarationDate: new Date(giftAidData.declarationDate),
    
    // Donation Details
    donationAmount: giftAidData.donationAmount,
    donationDate: new Date(giftAidData.donationDate),
    organizationId: giftAidData.organizationId,
    donationId: giftAidData.donationId || '',
    
    // Audit Trail
    timestamp: new Date(giftAidData.timestamp),
    taxYear: giftAidData.taxYear,
    
    // Payment Reference
    transactionId: transactionId,
    
    // Firebase metadata
    createdAt: Timestamp.now(),
    status: 'active'
  };
  
  const docRef = await addDoc(giftAidRef, giftAidDeclaration);
  console.warn('Gift Aid declaration stored with ID:', docRef.id);
  return { id: docRef.id, ...giftAidDeclaration };
}

export interface CurrencyRequestData {
  email: string;
  requestedCurrency: string;
  notes?: string;
  organizationName: string;
  firstName: string;
  lastName: string;
}

export async function submitCurrencyRequest(data: CurrencyRequestData) {
  const currencyRequestsRef = collection(db, 'currencyRequests');
  const requestData = {
    email: data.email,
    requestedCurrency: data.requestedCurrency,
    notes: data.notes || '',
    organizationName: data.organizationName,
    firstName: data.firstName,
    lastName: data.lastName,
    status: 'pending',
    createdAt: Timestamp.now(),
    timestamp: Timestamp.now()
  };
  
  const docRef = await addDoc(currencyRequestsRef, requestData);
  console.warn('Currency request submitted with ID:', docRef.id);
  return { id: docRef.id, ...requestData };
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking email existence:', error);
    throw error;
  }
}

export async function checkOrganizationIdExists(organizationId: string): Promise<boolean> {
  try {
    const orgRef = doc(db, 'organizations', organizationId);
    const orgSnap = await getDoc(orgRef);
    return orgSnap.exists();
  } catch (error) {
    console.error('Error checking organization ID existence:', error);
    throw error;
  }
}
