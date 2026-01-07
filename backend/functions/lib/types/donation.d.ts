export interface DonationData {
    campaignId: string | null;
    amount: number;
    currency: string;
    donorId: string | null;
    donorName: string;
    timestamp: FirebaseFirestore.Timestamp;
    isGiftAid: boolean;
    paymentStatus: 'success' | 'failed' | 'pending';
    platform: string;
    stripePaymentIntentId: string;
}
export interface CampaignUpdate {
    collectedAmount: FirebaseFirestore.FieldValue;
    donationCount: FirebaseFirestore.FieldValue;
    lastUpdated: FirebaseFirestore.Timestamp;
}
//# sourceMappingURL=donation.d.ts.map