/**
 * Gift Aid Configuration Constants
 * 
 * HMRC-compliant configuration for Gift Aid classification and processing
 * All monetary values are in pence (minor currency units)
 */

/**
 * Gift Aid threshold values (in pence)
 * 
 * HMRC Rules:
 * - Donations ≤ £30 → GADS (Gift Aid Small Donations Scheme)
 * - Donations > £30 → Standard Gift Aid (requires full declaration)
 */
export const GIFT_AID_THRESHOLDS = {
  /** Maximum amount for GADS eligibility (£30.00 in pence) */
  GADS_MAX: 3000,
  
  /** Minimum amount for Standard Gift Aid (£30.01 in pence) */
  STANDARD_MIN: 3001,
  
  /** Gift Aid reclaim rate (25% of donation amount) */
  GIFT_AID_RATE: 0.25,
} as const;

/**
 * Gift Aid classification types
 * 
 * STANDARD: Donations > £30 with complete donor information
 * GADS: Donations ≤ £30 (Gift Aid Small Donations Scheme)
 * PENDING: Donations missing required information or requiring follow-up
 */
export const GIFT_AID_CLASSIFICATIONS = {
  STANDARD: 'STANDARD',
  GADS: 'GADS',
  PENDING: 'PENDING',
} as const;

/**
 * Gift Aid classification type
 */
export type GiftAidClassification = typeof GIFT_AID_CLASSIFICATIONS[keyof typeof GIFT_AID_CLASSIFICATIONS];

/**
 * Required fields for Standard Gift Aid eligibility
 * All fields must be present and non-empty for STANDARD classification
 */
export const REQUIRED_GIFT_AID_FIELDS = [
  'donorFirstName',
  'donorSurname',
  'donorHouseNumber',
  'donorAddressLine1',
  'donorTown',
  'donorPostcode',
  'ukTaxpayerConfirmation',
  'giftAidConsent',
] as const;

/**
 * Reasons a Gift Aid declaration might be marked as PENDING
 */
export const PENDING_REASONS = {
  MISSING_DONOR_INFO: 'Missing required donor information',
  MISSING_ADDRESS: 'Incomplete address details',
  MISSING_TAXPAYER_CONFIRMATION: 'UK taxpayer confirmation not provided',
  MISSING_CONSENT: 'Gift Aid consent not provided',
  INVALID_AMOUNT: 'Invalid donation amount',
  REQUIRES_REVIEW: 'Requires manual review',
} as const;

/**
 * Gift Aid status values
 */
export const GIFT_AID_STATUS = {
  PENDING: 'pending',
  CLAIMED: 'claimed',
  REJECTED: 'rejected',
} as const;

/**
 * Export configuration
 */
export const GIFT_AID_EXPORT_CONFIG = {
  /** CSV filename prefix */
  CSV_PREFIX: 'gift-aid-declarations',
  
  /** Date format for filenames */
  DATE_FORMAT: 'YYYY-MM-DD',
  
  /** CSV encoding */
  ENCODING: 'utf-8',
  
  /** CSV MIME type */
  MIME_TYPE: 'text/csv;charset=utf-8;',
} as const;
