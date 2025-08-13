import { useCallback, useState } from 'react';
import { loginWithEmailPassword } from '../api/authService';
import { getUserById } from '../api/firestoreService';

export interface UseAuthState<TUser = any> {
  loading: boolean;
  error: string | null;
  user: TUser | null;
  login: (email: string, password: string) => Promise<TUser | null>;
}

export function useAuth<TUser = any>(): UseAuthState<TUser> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<TUser | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await loginWithEmailPassword(email, password);
      const profile = await getUserById(cred.user.uid);
      if (!profile) {
        setError('No user profile found for this account.');
        setUser(null);
        return null;
      }
      setUser(profile as TUser);
      return profile as TUser;
    } catch (e: any) {
      setError(e?.message || 'Authentication failed. Please try again.');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, user, login };
}


