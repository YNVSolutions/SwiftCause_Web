import { useCallback, useState } from 'react';
import { loginWithEmailPassword } from '../../api/legacy/authService';
import { getUserById } from '../../api/firestoreService';

function getFriendlyAuthMessage(error) {
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
      setError(getFriendlyAuthMessage(e));
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, user, login };
}


