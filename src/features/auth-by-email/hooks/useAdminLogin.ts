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
	const [emailVerificationError, setEmailVerificationError] = useState<string>('');
	const [isCheckingEmail, setIsCheckingEmail] = useState(false);
	const [emailVerified, setEmailVerified] = useState<boolean>(true);

	const checkEmailVerification = useCallback(async () => {
		if (!email || !email.includes('@')) {
			setEmailVerificationError('');
			setEmailVerified(true);
			return;
		}

		setIsCheckingEmail(true);
		setEmailVerificationError('');
		
		try {
			const result = await authApi.checkEmailVerification(email);
			
			if (!result.exists) {
				setEmailVerificationError('');
				setEmailVerified(true);
			} else if (!result.verified) {
				setEmailVerificationError('This email is not verified yet. Please verify your email before logging in.');
				setEmailVerified(false);
			} else {
				setEmailVerificationError('');
				setEmailVerified(true);
			}
		} catch (err) {
			console.error('Error checking email verification:', err);
			setEmailVerificationError('');
			setEmailVerified(true);
		} finally {
			setIsCheckingEmail(false);
		}
	}, [email]);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError('');

		if (!email || !password) {
			setLocalError('Please enter both email and password.');
			return;
		}

		if (!emailVerified) {
			setLocalError('Please verify your email before logging in.');
			return;
		}

		try {
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
			const errorMessage = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
			setLocalError(errorMessage);
		}
	}, [email, password, emailVerified, login, onLogin]);

	const error = useMemo(() => localError || authError || '', [localError, authError]);

	return {
		email,
		password,
		setEmail,
		setPassword,
		error,
		loading,
		emailVerificationError,
		isCheckingEmail,
		checkEmailVerification,
		handleSubmit
	};
}


