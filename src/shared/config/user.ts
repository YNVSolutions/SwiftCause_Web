// User and organization-related constants
export const ORGANIZATION_TYPES = [
  'Non-Profit',
  'Charity',
  'Foundation',
  'Religious Organization',
  'Educational Institution',
  'Healthcare Organization',
  'Environmental Group',
  'Community Organization',
  'International NGO',
  'Other'
] as const;

export const ORGANIZATION_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees'
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
  { value: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'CHF' },
  { value: 'SEK', label: 'Swedish Krona (kr)', symbol: 'kr' },
  { value: 'NOK', label: 'Norwegian Krone (kr)', symbol: 'kr' },
  { value: 'DKK', label: 'Danish Krone (kr)', symbol: 'kr' }
] as const;

export const DEFAULT_USER_PERMISSIONS = {
  admin: [
    'view_dashboard',
    'view_campaigns',
    'create_campaign',
    'edit_campaign',
    'delete_campaign',
    'view_kiosks',
    'create_kiosk',
    'edit_kiosk',
    'delete_kiosk',
    'assign_campaigns',
    'view_donations',
    'export_donations',
    'view_users',
    'create_user',
    'edit_user',
    'delete_user',
    'manage_permissions'
  ],
  manager: [
    'view_dashboard',
    'view_campaigns',
    'create_campaign',
    'edit_campaign',
    'view_kiosks',
    'create_kiosk',
    'edit_kiosk',
    'assign_campaigns',
    'view_donations',
    'export_donations',
    'view_users',
    'create_user',
    'edit_user'
  ],
  operator: [
    'view_dashboard',
    'view_campaigns',
    'view_kiosks',
    'view_donations'
  ],
  viewer: [
    'view_dashboard',
    'view_campaigns',
    'view_kiosks',
    'view_donations'
  ]
} as const;

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false
} as const;
