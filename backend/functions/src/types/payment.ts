export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  metadata: PaymentMetadata;
}

export interface PaymentMetadata {
  campaignId: string;
  donorId: string;
  donorName: string;
  isGiftAid: boolean;
  platform: string;
}

export interface CreatePaymentIntentResponse {
  paymentIntentId?: string;
  paymentIntentClientSecret?: string;
  customer: string;
  ephemeralKey?: string;
}

export interface ConnectionTokenResponse {
  secret: string;
}

export interface ErrorResponse {
  error: string;
}
