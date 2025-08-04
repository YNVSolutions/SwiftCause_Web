import { User } from '../../../App';

export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    email: 'admin@donatehub.com',
    role: 'admin',
    lastLogin: '2024-01-07T14:30:00Z',
    kioskAccess: []
  },
  {
    id: 'user-002',
    username: 'kiosk_nyc_001',
    email: 'kiosk.nyc@donatehub.com',
    role: 'kiosk',
    lastLogin: '2024-01-07T13:15:00Z',
    kioskAccess: ['KIOSK-NYC-001']
  },
  {
    id: 'user-003',
    username: 'kiosk_la_002',
    email: 'kiosk.la@donatehub.com',
    role: 'kiosk',
    lastLogin: '2024-01-07T12:45:00Z',
    kioskAccess: ['KIOSK-LA-002']
  },
  {
    id: 'user-004',
    username: 'manager_west',
    email: 'manager.west@donatehub.com',
    role: 'admin',
    lastLogin: '2024-01-06T16:20:00Z',
    kioskAccess: []
  },
  {
    id: 'user-005',
    username: 'kiosk_multi',
    email: 'kiosk.multi@donatehub.com',
    role: 'kiosk',
    lastLogin: '2024-01-06T09:30:00Z',
    kioskAccess: ['KIOSK-CHI-003', 'KIOSK-MIA-004']
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