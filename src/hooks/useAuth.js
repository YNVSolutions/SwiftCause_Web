import { useCallback, useState } from 'react';
import { loginWithEmailPassword } from '../api/authService';
import { getUserById } from '../api/firestoreService';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, password) => {
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
      setUser(profile);
      return profile;
    } catch (e) {
      setError(e?.message || 'Authentication failed. Please try again.');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, user, login };
}


