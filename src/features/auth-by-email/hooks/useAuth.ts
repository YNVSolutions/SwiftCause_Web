import { useCallback, useState } from 'react';
import { authApi } from '../api';
import { User } from '../../../entities/user';

function getFriendlyAuthMessage(error: unknown) {
  // Type guard to check if error has a code property
  const hasCode = (err: unknown): err is { code: string } => {
    return typeof err === 'object' && err !== null && 'code' in err;
  };
  
  const code = hasCode(error) ? error.code : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/invalid-email':
      return 'Invalid email format. Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in or use a different email.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 8 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled. Please contact support.';
    default:
      return 'Authentication failed. Please try again.';
  }
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const profile = await authApi.signIn(email, password);
      if (!profile) {
        setError('No user profile found for this account.');
        setUser(null);
        return null;
      }
      setUser(profile);
      return profile;
    } catch (e: unknown) {
      setError(getFriendlyAuthMessage(e));
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, user, login };
}


