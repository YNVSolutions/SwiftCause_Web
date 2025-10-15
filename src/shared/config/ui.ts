// UI and validation constants
export const VALIDATION_LIMITS = {
  campaign: {
    title: { min: 3, max: 100 },
    description: { min: 10, max: 500 },
    goal: { min: 1, max: 10000000 },
    maxCustomAmount: { min: 1, max: 100000 },
    maxRecentDonations: { min: 1, max: 50 }
  },
  user: {
    username: { min: 3, max: 30 },
    email: { max: 100 },
    firstName: { min: 1, max: 50 },
    lastName: { min: 1, max: 50 }
  },
  organization: {
    name: { min: 2, max: 100 },
    website: { max: 200 }
  }
} as const;

export const FILE_UPLOAD_LIMITS = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxDimensions: { width: 4000, height: 4000 }
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'text/plain', 'application/msword']
  }
} as const;

export const PAGINATION_DEFAULTS = {
  campaigns: { pageSize: 12, maxPageSize: 50 },
  donations: { pageSize: 20, maxPageSize: 100 },
  users: { pageSize: 10, maxPageSize: 50 },
  kiosks: { pageSize: 10, maxPageSize: 50 }
} as const;

export const TOAST_DEFAULTS = {
  duration: 2500,
  position: 'top-right'
} as const;

export const LOADING_STATES = {
  short: 500,
  medium: 1000,
  long: 2000
} as const;

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
} as const;

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500
} as const;
