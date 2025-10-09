import { User, AdminSession } from '../../../shared/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  organizationType: string;
  organizationSize: string;
  organizationId: string;
  website?: string;
  currency: string;
  agreeToTerms: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<User | null>;
  clearError: () => void;
}
