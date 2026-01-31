import { useCallback, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { authApi } from '../api';
import { UserRole, AdminSession } from '../../../shared/types';
import { User } from '../../../entities/user';

type OnLogin = (role: UserRole, sessionData?: AdminSession) => void;

export function useAdminLogin(onLogin: OnLogin) {
	const { loading, error: authError, login } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [localError, setLocalError] = useState<string>('');

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError('');

		if (!email || !password) {
			setLocalError('Please enter both email and password.');
			return;
		}

		try {
			// sign in to get the Firebase Auth user
			const userCredential = await authApi.signInForVerificationCheck(email, password);
			
			if (!userCredential.user.emailVerified) {
				setLocalError('Please verify your email before logging in. Check your inbox for the verification link.');
				// Sign out the user
				await authApi.signOut();
				return;
			}

			const profile = await login(email, password);
			if (!profile) {
				return;
			}

			const userData = profile as User;
			if (!userData.isActive) {
				setLocalError('User account is disabled.');
				return;
			}

			if (!userData.organizationId) {
				setLocalError('Organization ID not defined for this user. Please contact support.');
				return;
			}

			const now = new Date().toISOString();
			const adminSession: AdminSession = {
				user: {
					...userData,
					lastLogin: now
				},
				loginTime: now,
				permissions: userData.permissions || []
			};

			onLogin('admin', adminSession);
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'code' in err) {
				const firebaseError = err as { code: string; message: string };
				switch (firebaseError.code) {
					case 'auth/invalid-credential':
					case 'auth/user-not-found':
					case 'auth/wrong-password':
						setLocalError('Invalid email or password. Please try again.');
						break;
					case 'auth/invalid-email':
						setLocalError('Please enter a valid email address.');
						break;
					case 'auth/user-disabled':
						setLocalError('This account has been disabled. Please contact support.');
						break;
					case 'auth/too-many-requests':
						setLocalError('Too many failed login attempts. Please try again later.');
						break;
					default:
						setLocalError('Authentication failed. Please try again.');
				}
			} else {
				const errorMessage = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
				setLocalError(errorMessage);
			}
		}
	}, [email, password, login, onLogin]);

	const error = useMemo(() => localError || authError || '', [localError, authError]);

	return {
		email,
		password,
		setEmail,
		setPassword,
		error,
		loading,
		handleSubmit
	};
}


