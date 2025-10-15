// Campaign-related constants
export const CAMPAIGN_CATEGORIES = [
  'Global Health', 
  'Education', 
  'Emergency Relief', 
  'Food Security', 
  'Environmental', 
  'Community Development', 
  'Animal Welfare', 
  'Arts & Culture'
] as const;

export const CAMPAIGN_THEMES = [
  { value: 'default', label: 'Default', description: 'Clean, professional design' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, distraction-free' },
  { value: 'vibrant', label: 'Vibrant', description: 'Bold colors and gradients' },
  { value: 'elegant', label: 'Elegant', description: 'Sophisticated typography' }
] as const;

export const PREDEFINED_AMOUNT_SETS = [
  { name: 'Small Donations', amounts: [5, 10, 25, 50, 100] },
  { name: 'Medium Donations', amounts: [25, 50, 100, 250, 500] },
  { name: 'Large Donations', amounts: [100, 250, 500, 1000, 2500] },
  { name: 'Major Gifts', amounts: [500, 1000, 2500, 5000, 10000] }
] as const;

export const DEFAULT_CAMPAIGN_CONFIG = {
  predefinedAmounts: [25, 50, 100, 250, 500],
  allowCustomAmount: true,
  minCustomAmount: 1,
  maxCustomAmount: 10000,
  suggestedAmounts: [25, 50, 100],
  enableRecurring: true,
  recurringIntervals: ['monthly', 'quarterly'] as const,
  defaultRecurringInterval: 'monthly' as const,
  recurringDiscount: 0,
  displayStyle: 'grid' as const,
  showProgressBar: true,
  showDonorCount: true,
  showRecentDonations: true,
  maxRecentDonations: 5,
  primaryCTAText: 'Donate Now',
  secondaryCTAText: 'Learn More',
  theme: 'default' as const,
  requiredFields: ['email'] as const,
  optionalFields: ['name'] as const,
  enableAnonymousDonations: true,
  enableSocialSharing: true,
  enableDonorWall: true,
  enableComments: false
} as const;

export const DEFAULT_CAMPAIGN_VALUES = {
  goal: 10000,
  raised: 0,
  status: 'active' as const,
  category: '',
  organizationId: 'ORG-NEW',
  isGlobal: false,
  assignedKiosks: [],
  galleryImages: [],
  impactMetrics: {
    peopleHelped: 0,
    itemsProvided: 0
  }
} as const;

export const CAMPAIGN_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' }
] as const;

export const RECURRING_INTERVALS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
] as const;

export const DISPLAY_STYLES = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'carousel', label: 'Carousel' }
] as const;

export const FORM_FIELDS = [
  { value: 'email', label: 'Email' },
  { value: 'name', label: 'Name' },
  { value: 'phone', label: 'Phone' },
  { value: 'address', label: 'Address' },
  { value: 'message', label: 'Message' }
] as const;
