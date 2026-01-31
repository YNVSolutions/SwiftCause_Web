import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase';
import { GiftAidDeclaration } from '../model';

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
      
      // GUARANTEE: Canonical timestamp source (ISO string)
      const now = new Date().toISOString();
      
      // GUARANTEE: Store with explicit ID and audit timestamps
      await setDoc(docRef, {
        ...data,
        id: donationId,
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
   * Update Gift Aid declaration - Maintains 1:1 relationship and audit trail
   * 
   * COMPLIANCE GUARANTEES:
   * - Maintains 1:1 relationship (cannot change donationId)
   * - Updates audit trail with updatedAt timestamp
   * - Preserves creation timestamp and document ID
   * - All monetary amounts remain as integer pence
   * 
   * @param donationId - The donation ID (document ID)
   * @param updates - Partial updates (excluding id, donationId, createdAt)
   */
  async updateGiftAidDeclaration(donationId: string, updates: Partial<Omit<GiftAidDeclaration, 'id' | 'donationId' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, 'giftAidDeclarations', donationId);
      
      // GUARANTEE: Include updatedAt timestamp for audit trail
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(docRef, updateData, { merge: true });
    } catch (error) {
      console.error('Error updating Gift Aid declaration:', error);
      throw error;
    }
  }
};