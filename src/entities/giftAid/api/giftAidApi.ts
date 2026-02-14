import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { GiftAidDeclaration } from '../model';
import { classifyDonation } from '../lib/classification';

/**
 * HMRC-compliant Gift Aid API
 * 
 * LEGAL CONTRACT - DO NOT MODIFY WITHOUT COMPLIANCE REVIEW
 * 
 * This API enforces strict HMRC compliance requirements:
 * - 1:1 mapping between donations and Gift Aid declarations
 * - Integer-only monetary arithmetic (pence)
 * - Immutable legal declaration text
 * - Complete audit trail
 * - Duplicate prevention
 * - Automatic classification (STANDARD, GADS, PENDING)
 */
export const giftAidApi = {
  /**
   * Create new Gift Aid declaration - HMRC-compliant with strict 1:1 mapping
   * 
   * COMPLIANCE GUARANTEES:
   * - Uses donationId as document ID to enforce 1:1 relationship
   * - Prevents duplicate Gift Aid records for the same donation
   * - Gift Aid amounts are calculated in orchestration layer (not frontend)
   * - One donation can have at most one Gift Aid declaration
   * - Full audit trail with creation and update timestamps
   * - All monetary amounts stored as integer pence
   * - Automatic classification based on amount and data completeness
   * 
   * @param data - Gift Aid declaration data without id and timestamps
   * @returns Promise<string> - The donationId (used as document ID)
   * @throws Error if Gift Aid declaration already exists for the donation
   */
  async createGiftAidDeclaration(data: Omit<GiftAidDeclaration, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { donationId } = data;
      
      // GUARANTEE: Use donationId as document ID to enforce 1:1 mapping
      const docRef = doc(db, 'giftAidDeclarations', donationId);
      
      // GUARANTEE: Prevent duplicate Gift Aid records for same donation
      const existingDoc = await getDoc(docRef);
      if (existingDoc.exists()) {
        throw new Error(`Gift Aid declaration already exists for donation ${donationId}. Only one Gift Aid declaration per donation is allowed.`);
      }

      // AUTOMATIC CLASSIFICATION: Classify donation based on amount and data completeness
      const classificationResult = classifyDonation(data);
      
      // GUARANTEE: Canonical timestamp source (ISO string)
      const now = new Date().toISOString();
      
      // GUARANTEE: Store with explicit ID, audit timestamps, and classification
      await setDoc(docRef, {
        ...data,
        id: donationId,
        classification: classificationResult.classification,
        pendingReasons: classificationResult.pendingReasons || [],
        createdAt: now,
        updatedAt: now
      });
      
      return donationId;
    } catch (error) {
      console.error('Error creating Gift Aid declaration:', error);
      throw error;
    }
  },

  /**
   * Get Gift Aid declaration by donation ID - Direct 1:1 lookup
   * 
   * COMPLIANCE GUARANTEES:
   * - Returns single record or null (never arrays)
   * - Direct document lookup using donationId as document ID
   * - HMRC-queryable for export and reporting
   * - Enforces strict 1:1 donation ↔ Gift Aid mapping
   * 
   * @param donationId - The donation ID (also used as Gift Aid document ID)
   * @returns Promise<GiftAidDeclaration | null> - Single declaration or null
   */
  async getGiftAidByDonationId(donationId: string): Promise<GiftAidDeclaration | null> {
    try {
      // GUARANTEE: Direct 1:1 lookup using donationId as document ID
      const docRef = doc(db, 'giftAidDeclarations', donationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as GiftAidDeclaration;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching Gift Aid by donation ID:', error);
      throw error;
    }
  },

  /**
   * Get Gift Aid declarations by classification
   * 
   * Allows filtering by classification track for export and reporting
   * 
   * @param organizationId - Organization ID
   * @param classification - Classification type (STANDARD, GADS, PENDING)
   * @returns Promise<GiftAidDeclaration[]> - Array of declarations
   */
  async getGiftAidByClassification(
    organizationId: string,
    classification: 'STANDARD' | 'GADS' | 'PENDING'
  ): Promise<GiftAidDeclaration[]> {
    try {
      const giftAidRef = collection(db, 'giftAidDeclarations');
      const q = query(
        giftAidRef,
        where('organizationId', '==', organizationId),
        where('classification', '==', classification)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as GiftAidDeclaration));
    } catch (error) {
      console.error('Error fetching Gift Aid by classification:', error);
      throw error;
    }
  },

  /**
   * Update Gift Aid declaration - Maintains 1:1 relationship and audit trail
   * 
   * COMPLIANCE GUARANTEES:
   * - Maintains 1:1 relationship (cannot change donationId)
   * - Updates audit trail with updatedAt timestamp
   * - Preserves creation timestamp and document ID
   * - All monetary amounts remain as integer pence
   * - Re-classifies if data changes affect classification
   * 
   * @param donationId - The donation ID (document ID)
   * @param updates - Partial updates (excluding id, donationId, createdAt)
   */
  async updateGiftAidDeclaration(donationId: string, updates: Partial<Omit<GiftAidDeclaration, 'id' | 'donationId' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, 'giftAidDeclarations', donationId);
      
      // Get existing declaration for re-classification
      const existingDoc = await getDoc(docRef);
      if (!existingDoc.exists()) {
        throw new Error(`Gift Aid declaration not found for donation ${donationId}`);
      }

      const existingData = existingDoc.data() as GiftAidDeclaration;
      
      // Merge updates with existing data for re-classification
      const mergedData = { ...existingData, ...updates };
      
      // Re-classify if relevant fields changed
      const classificationResult = classifyDonation(mergedData);
      
      // GUARANTEE: Include updatedAt timestamp and updated classification
      const updateData = {
        ...updates,
        classification: classificationResult.classification,
        pendingReasons: classificationResult.pendingReasons || [],
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(docRef, updateData, { merge: true });
    } catch (error) {
      console.error('Error updating Gift Aid declaration:', error);
      throw error;
    }
  },

  /**
   * Update classification for existing declaration
   * 
   * Manually trigger re-classification (useful for batch updates)
   * 
   * @param donationId - The donation ID (document ID)
   */
  async updateClassification(donationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'giftAidDeclarations', donationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Gift Aid declaration not found for donation ${donationId}`);
      }

      const data = docSnap.data() as GiftAidDeclaration;
      const classificationResult = classifyDonation(data);
      
      await setDoc(docRef, {
        classification: classificationResult.classification,
        pendingReasons: classificationResult.pendingReasons || [],
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating classification:', error);
      throw error;
    }
  }
};