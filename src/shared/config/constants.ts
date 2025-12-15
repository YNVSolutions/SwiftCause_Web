// Application constants
export const APP_NAME = 'SwiftCause';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  CAMPAIGNS: '/campaigns',
  CAMPAIGN_DETAIL: '/campaign',
  PAYMENT: '/payment',
  RESULT: '/result',
  EMAIL_CONFIRMATION: '/email-confirmation',
  ADMIN_DASHBOARD: '/admin-dashboard',
  ADMIN_CAMPAIGNS: '/admin-campaigns',
  ADMIN_KIOSKS: '/admin-kiosks',
  ADMIN_DONATIONS: '/admin-donations',
  ADMIN_USERS: '/admin-users',
  ABOUT: '/about',
  CONTACT: '/contact',
  DOCS: '/docs',
  TERMS: '/terms',
} as const;

export const DEFAULT_CAMPAIGN_IMAGE = '/campaign-placeholder.jpg';

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
  KIOSK: 'kiosk',
} as const;

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_CAMPAIGNS: 'view_campaigns',
  CREATE_CAMPAIGN: 'create_campaign',
  EDIT_CAMPAIGN: 'edit_campaign',
  DELETE_CAMPAIGN: 'delete_campaign',
  VIEW_KIOSKS: 'view_kiosks',
  CREATE_KIOSK: 'create_kiosk',
  EDIT_KIOSK: 'edit_kiosk',
  DELETE_KIOSK: 'delete_kiosk',
  ASSIGN_CAMPAIGNS: 'assign_campaigns',
  VIEW_DONATIONS: 'view_donations',
  EXPORT_DONATIONS: 'export_donations',
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  MANAGE_PERMISSIONS: 'manage_permissions',
  SYSTEM_ADMIN: 'system_admin',
} as const;
