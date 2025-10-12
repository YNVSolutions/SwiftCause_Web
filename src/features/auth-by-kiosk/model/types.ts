import { KioskSession } from '../../../shared/types';

export interface KioskLoginCredentials {
  kioskId: string;
  accessCode: string;
}

export interface KioskAuthState {
  kioskSession: KioskSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
