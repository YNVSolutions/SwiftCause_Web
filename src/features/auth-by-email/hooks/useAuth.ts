import { useCallback, useState } from 'react';
import { authApi } from '../api';
import { User } from '../../../entities/user';

function getFriendlyAuthMessage(error: any) {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Invalid username or password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
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
    } catch (e: any) {
      setError(getFriendlyAuthMessage(e));
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, user, login };
}


