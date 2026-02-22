// API-related types
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  subscriptionId?: string;
  error?: string;
  campaignTitle?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
