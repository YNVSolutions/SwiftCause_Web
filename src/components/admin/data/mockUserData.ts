import { User, UserPermissions } from '../../../App';
const userPermissions : UserPermissions = {
      permissions: [],
      role: "super_admin",
      description: "Full access to all features"
    };
export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    email: 'admin@donatehub.com',
    role: 'admin',
    lastLogin: '2024-01-07T14:30:00Z',
    isActive: true,
    permissions: userPermissions,
  },
  {
    id: 'user-002',
    username: 'kiosk_nyc_001',
    email: 'kiosk.nyc@donatehub.com',
    role: 'kiosk',
    isActive: true,
    permissions: userPermissions,
  },
  {
    id: 'user-003',
    username: 'kiosk_la_002',
    email: 'kiosk.la@donatehub.com',
    role: 'kiosk',
    isActive: true,
    permissions: userPermissions,
  },
  {
    id: 'user-004',
    username: 'manager_west',
    email: 'manager.west@donatehub.com',
    role: 'admin',
    isActive: true,
    permissions: userPermissions,
  },
  {
    id: 'user-005',
    username: 'kiosk_multi',
    email: 'kiosk.multi@donatehub.com',
    role: 'kiosk',
    isActive: true,
    permissions: userPermissions,
  }
];

export const AVAILABLE_KIOSKS = [
  'KIOSK-NYC-001',
  'KIOSK-LA-002',
  'KIOSK-CHI-003',
  'KIOSK-MIA-004',
  'KIOSK-BOS-005',
  'KIOSK-SEA-006'
];